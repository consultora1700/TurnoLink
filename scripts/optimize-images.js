#!/usr/bin/env node
/**
 * Bulk Image Optimizer for TurnoLink
 *
 * Converts all PNG/JPEG/JPG images in uploads/ to WebP + JPEG fallback + thumbnail
 * following the same pipeline as media.service.ts:
 *   - Primary: WebP quality 82, max 2000x2000
 *   - Fallback: JPEG quality 85, max 2000x2000
 *   - Thumbnail: WebP quality 75, 400x400
 *
 * Updates database references and removes originals.
 *
 * Usage: node scripts/optimize-images.js [--dry-run]
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs/promises');
const { existsSync } = require('fs');

const UPLOADS_DIR = path.join(__dirname, '..', 'apps', 'api', 'uploads');
const DRY_RUN = process.argv.includes('--dry-run');

// Same settings as media.service.ts
const WEBP_QUALITY = 82;
const JPEG_QUALITY = 85;
const THUMB_QUALITY = 75;
const MAX_DIM = 2000;
const THUMB_DIM = 400;

let stats = {
  scanned: 0,
  converted: 0,
  alreadyOptimal: 0,
  thumbsCreated: 0,
  bytesFreed: 0,
  errors: [],
};

async function getAllFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function processFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const baseName = path.basename(filePath, ext);
  const dir = path.dirname(filePath);

  // Skip thumbnails and already-processed fallback JPGs
  if (baseName.endsWith('-thumb')) return;

  // Determine what needs processing
  const isWebp = ext === '.webp';
  const isPng = ext === '.png';
  const isJpeg = ext === '.jpeg';
  const isJpg = ext === '.jpg';

  // Check if this is a proper fallback JPG (has corresponding .webp)
  if (isJpg) {
    const webpPath = path.join(dir, baseName + '.webp');
    if (existsSync(webpPath)) {
      // This is a proper fallback, check if thumb exists
      const thumbPath = path.join(dir, baseName + '-thumb.webp');
      if (!existsSync(thumbPath)) {
        await createThumb(filePath, thumbPath);
      }
      return; // Already part of the optimized set
    }
    // Orphan JPG — needs conversion
  }

  // WebP files — just check for missing thumbs/fallbacks
  if (isWebp) {
    const thumbPath = path.join(dir, baseName + '-thumb.webp');
    const jpgPath = path.join(dir, baseName + '.jpg');

    if (!existsSync(thumbPath)) {
      await createThumb(filePath, thumbPath);
    }
    if (!existsSync(jpgPath)) {
      await createFallbackJpg(filePath, jpgPath);
    }
    return;
  }

  // PNG, JPEG, or orphan JPG — full conversion needed
  if (isPng || isJpeg || isJpg) {
    stats.scanned++;

    const webpPath = path.join(dir, baseName + '.webp');
    const jpgPath = path.join(dir, baseName + '.jpg');
    const thumbPath = path.join(dir, baseName + '-thumb.webp');

    try {
      const originalStat = await fs.stat(filePath);
      const originalSize = originalStat.size;

      console.log(`  Converting: ${path.relative(UPLOADS_DIR, filePath)} (${(originalSize / 1024).toFixed(0)}KB)`);

      if (!DRY_RUN) {
        const buffer = await fs.readFile(filePath);

        // Generate all 3 variants in parallel
        const [webpResult, jpgResult, thumbResult] = await Promise.all([
          // WebP primary
          sharp(buffer)
            .resize(MAX_DIM, MAX_DIM, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: WEBP_QUALITY })
            .toBuffer(),
          // JPEG fallback
          sharp(buffer)
            .resize(MAX_DIM, MAX_DIM, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: JPEG_QUALITY })
            .toBuffer(),
          // WebP thumbnail
          sharp(buffer)
            .resize(THUMB_DIM, THUMB_DIM, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: THUMB_QUALITY })
            .toBuffer(),
        ]);

        // Write new files
        await Promise.all([
          fs.writeFile(webpPath, webpResult),
          // Only write JPG fallback if it's not the same file
          isJpg ? null : fs.writeFile(jpgPath, jpgResult),
          fs.writeFile(thumbPath, thumbResult),
        ]);

        // For orphan JPG: overwrite the existing .jpg with the optimized version
        if (isJpg) {
          await fs.writeFile(filePath, jpgResult);
        }

        const newSize = webpResult.length;
        const saved = originalSize - newSize;

        // Delete original PNG/JPEG (not JPG since we overwrote it)
        if (isPng || isJpeg) {
          await fs.unlink(filePath);
        }

        stats.converted++;
        stats.thumbsCreated++;
        stats.bytesFreed += Math.max(0, saved);

        console.log(`    → WebP: ${(newSize / 1024).toFixed(0)}KB, Thumb: ${(thumbResult.length / 1024).toFixed(0)}KB (saved ${(saved / 1024).toFixed(0)}KB)`);
      } else {
        stats.converted++;
        console.log(`    → [DRY RUN] Would convert`);
      }
    } catch (err) {
      stats.errors.push({ file: filePath, error: err.message });
      console.error(`    ✗ Error: ${err.message}`);
    }
  }
}

async function createThumb(sourcePath, thumbPath) {
  try {
    if (DRY_RUN) {
      console.log(`  [DRY RUN] Would create thumb: ${path.relative(UPLOADS_DIR, thumbPath)}`);
      stats.thumbsCreated++;
      return;
    }

    const buffer = await fs.readFile(sourcePath);
    const thumbBuffer = await sharp(buffer)
      .resize(THUMB_DIM, THUMB_DIM, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: THUMB_QUALITY })
      .toBuffer();

    await fs.writeFile(thumbPath, thumbBuffer);
    stats.thumbsCreated++;
    console.log(`  Created thumb: ${path.relative(UPLOADS_DIR, thumbPath)} (${(thumbBuffer.length / 1024).toFixed(0)}KB)`);
  } catch (err) {
    stats.errors.push({ file: sourcePath, error: `Thumb: ${err.message}` });
  }
}

async function createFallbackJpg(sourcePath, jpgPath) {
  try {
    if (DRY_RUN) return;

    const buffer = await fs.readFile(sourcePath);
    const jpgBuffer = await sharp(buffer)
      .resize(MAX_DIM, MAX_DIM, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY })
      .toBuffer();

    await fs.writeFile(jpgPath, jpgBuffer);
  } catch (err) {
    stats.errors.push({ file: sourcePath, error: `Fallback: ${err.message}` });
  }
}

async function updateDatabase() {
  // Update DB references: change .png/.jpeg URLs to .webp
  let prismaClient;
  try {
    const { PrismaClient } = require('@prisma/client');
    prismaClient = new PrismaClient();
  } catch {
    // Try from the api directory
    const { PrismaClient } = require(path.join(__dirname, '..', 'node_modules', '.pnpm', '@prisma+client@5.22.0_prisma@5.22.0', 'node_modules', '@prisma', 'client'));
    prismaClient = new PrismaClient();
  }

  try {
    // Find all media records with non-webp URLs
    const mediaRecords = await prismaClient.media.findMany({
      where: {
        OR: [
          { url: { endsWith: '.png' } },
          { url: { endsWith: '.jpeg' } },
        ],
      },
    });

    console.log(`\n  DB: Found ${mediaRecords.length} media records with PNG/JPEG URLs`);

    for (const record of mediaRecords) {
      const newUrl = record.url.replace(/\.(png|jpeg)$/, '.webp');
      const newThumbUrl = record.url.replace(/\.(png|jpeg)$/, '-thumb.webp');
      const newFallbackUrl = record.url.replace(/\.(png|jpeg)$/, '.jpg');

      if (!DRY_RUN) {
        await prismaClient.media.update({
          where: { id: record.id },
          data: {
            url: newUrl,
            mimeType: 'image/webp',
            thumbnailUrl: newThumbUrl,
            fallbackUrl: newFallbackUrl,
          },
        });
      }
      console.log(`  DB updated: ${record.url} → ${newUrl}`);
    }

    // Also update tenant tables that reference images directly
    // Covers
    const tenantsWithPngCover = await prismaClient.tenant.findMany({
      where: { coverImage: { contains: '.png' } },
      select: { id: true, coverImage: true },
    });
    for (const t of tenantsWithPngCover) {
      const newUrl = t.coverImage.replace(/\.(png|jpeg)$/, '.webp');
      if (!DRY_RUN) {
        await prismaClient.tenant.update({ where: { id: t.id }, data: { coverImage: newUrl } });
      }
      console.log(`  Tenant cover updated: ${t.coverImage} → ${newUrl}`);
    }

    // Logos
    const tenantsWithPngLogo = await prismaClient.tenant.findMany({
      where: { logo: { contains: '.png' } },
      select: { id: true, logo: true },
    });
    for (const t of tenantsWithPngLogo) {
      const newUrl = t.logo.replace(/\.(png|jpeg)$/, '.webp');
      if (!DRY_RUN) {
        await prismaClient.tenant.update({ where: { id: t.id }, data: { logo: newUrl } });
      }
      console.log(`  Tenant logo updated: ${t.logo} → ${newUrl}`);
    }

    // Services with .png/.jpeg images
    const servicesWithPng = await prismaClient.service.findMany({
      where: {
        OR: [
          { image: { contains: '.png' } },
          { image: { contains: '.jpeg' } },
        ],
      },
      select: { id: true, image: true },
    });
    for (const s of servicesWithPng) {
      const newUrl = s.image.replace(/\.(png|jpeg)$/, '.webp');
      if (!DRY_RUN) {
        await prismaClient.service.update({ where: { id: s.id }, data: { image: newUrl } });
      }
      console.log(`  Service image updated: ${s.image} → ${newUrl}`);
    }

    // Employees with .png/.jpeg images
    const employeesWithPng = await prismaClient.employee.findMany({
      where: {
        OR: [
          { image: { contains: '.png' } },
          { image: { contains: '.jpeg' } },
        ],
      },
      select: { id: true, image: true },
    });
    for (const e of employeesWithPng) {
      const newUrl = e.image.replace(/\.(png|jpeg)$/, '.webp');
      if (!DRY_RUN) {
        await prismaClient.employee.update({ where: { id: e.id }, data: { image: newUrl } });
      }
      console.log(`  Employee image updated: ${e.image} → ${newUrl}`);
    }

    // Products with .png/.jpeg images
    try {
      const productsWithPng = await prismaClient.product.findMany({
        where: {
          OR: [
            { image: { contains: '.png' } },
            { image: { contains: '.jpeg' } },
          ],
        },
        select: { id: true, image: true },
      });
      for (const p of productsWithPng) {
        const newUrl = p.image.replace(/\.(png|jpeg)$/, '.webp');
        if (!DRY_RUN) {
          await prismaClient.product.update({ where: { id: p.id }, data: { image: newUrl } });
        }
        console.log(`  Product image updated: ${p.image} → ${newUrl}`);
      }
    } catch { /* Product table may not exist */ }

  } finally {
    await prismaClient.$disconnect();
  }
}

async function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  TurnoLink Image Optimizer ${DRY_RUN ? '(DRY RUN)' : ''}`);
  console.log(`${'='.repeat(60)}\n`);
  console.log(`  Upload dir: ${UPLOADS_DIR}`);
  console.log(`  Settings: WebP q${WEBP_QUALITY}, JPEG q${JPEG_QUALITY}, Thumb q${THUMB_QUALITY} ${THUMB_DIM}px\n`);

  if (!existsSync(UPLOADS_DIR)) {
    console.error('Upload directory not found!');
    process.exit(1);
  }

  const files = await getAllFiles(UPLOADS_DIR);
  const imageFiles = files.filter(f => /\.(png|jpg|jpeg|webp|gif)$/i.test(f));

  console.log(`  Found ${imageFiles.length} image files\n`);

  // Process each file
  for (const file of imageFiles) {
    await processFile(file);
  }

  // Update database references
  console.log(`\n  Updating database references...`);
  await updateDatabase();

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  RESULTS ${DRY_RUN ? '(DRY RUN — no changes made)' : ''}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`  Files scanned for conversion: ${stats.scanned}`);
  console.log(`  Converted to WebP:            ${stats.converted}`);
  console.log(`  Thumbnails created:            ${stats.thumbsCreated}`);
  console.log(`  Space freed:                   ${(stats.bytesFreed / 1024).toFixed(0)}KB`);

  if (stats.errors.length > 0) {
    console.log(`\n  ERRORS (${stats.errors.length}):`);
    stats.errors.forEach(e => console.log(`    - ${e.file}: ${e.error}`));
  }

  console.log('');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
