#!/usr/bin/env node
/**
 * Migrate MEL Propiedades images to Russo Inmobiliarias demo tenant.
 * Downloads from admin.melpropiedades.com.ar, processes with Sharp, saves locally.
 */

const apiDir = require('path').join(__dirname, '..', 'apps', 'api');
const sharp = require(require.resolve('sharp', { paths: [apiDir] }));
const { v4: uuidv4 } = require(require.resolve('uuid', { paths: [apiDir] }));
const path = require('path');
const fs = require('fs/promises');
const https = require('https');
const http = require('http');

const TENANT_ID = '9753e4de-83b9-4a2f-92ff-ca8bbcfd1e12';
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', TENANT_ID, 'products');
const API_URL = 'https://api.turnolink.com.ar';
const DB_CONN = {
  host: '127.0.0.1',
  user: 'turnolink_user',
  password: 'Tp6l5MpvJKYEVRDzJCDjRdghKqqBpdX01w9e9S3V4UU=',
  database: 'turnolink_db',
};

const imageMap = require('/tmp/russo-images.json');

const { execSync } = require('child_process');

function downloadImage(url) {
  // Use curl to avoid Cloudflare rate-limiting Node's http client
  const tmpFile = `/tmp/russo-img-${Date.now()}.tmp`;
  try {
    execSync(`curl -sL -A 'Mozilla/5.0' --max-time 20 -o '${tmpFile}' '${url}'`, { stdio: 'pipe' });
    const buffer = require('fs').readFileSync(tmpFile);
    require('fs').unlinkSync(tmpFile);
    return Promise.resolve(buffer);
  } catch (e) {
    try { require('fs').unlinkSync(tmpFile); } catch {}
    return Promise.reject(new Error(`curl failed for ${url}`));
  }
}

async function processAndSave(buffer, uuid, folderPath) {
  await Promise.all([
    sharp(buffer)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(folderPath, `${uuid}.webp`)),
    sharp(buffer)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(path.join(folderPath, `${uuid}.jpg`)),
    sharp(buffer)
      .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(path.join(folderPath, `${uuid}-thumb.webp`)),
  ]);
  return {
    url: `${API_URL}/uploads/${TENANT_ID}/products/${uuid}.webp`,
    thumbnailUrl: `${API_URL}/uploads/${TENANT_ID}/products/${uuid}-thumb.webp`,
    fallbackUrl: `${API_URL}/uploads/${TENANT_ID}/products/${uuid}.jpg`,
  };
}

async function main() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const { Client } = require('pg');
  const client = new Client(DB_CONN);
  await client.connect();

  let totalImages = 0;
  let failedImages = 0;

  for (const [productId, productName, urls] of imageMap) {
    // Skip products that already have images
    const existing = await client.query(
      'SELECT COUNT(*) as c FROM product_images WHERE "productId" = $1', [productId]
    );
    if (parseInt(existing.rows[0].c) > 0) {
      process.stdout.write(`\n⏭ ${productName} (already has images)`);
      continue;
    }

    process.stdout.write(`\n📦 ${productName} (${urls.length} imgs): `);

    for (let i = 0; i < urls.length; i++) {
      const uuid = uuidv4();
      const isPrimary = i === 0;

      // Retry up to 3 times with backoff
      let success = false;
      for (let attempt = 0; attempt < 3 && !success; attempt++) {
        try {
          if (attempt > 0) await new Promise(r => setTimeout(r, 1000 * attempt));
          const buffer = await downloadImage(urls[i]);

          if (buffer.length < 1000) {
            process.stdout.write('⚠');
            failedImages++;
            success = true; // don't retry tiny files
            continue;
          }

          const saved = await processAndSave(buffer, uuid, UPLOAD_DIR);

          await client.query(
            `INSERT INTO product_images (id, "productId", url, alt, "order", "isPrimary", "createdAt")
             VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
            [uuidv4(), productId, saved.url, `${productName} - foto ${i + 1}`, i, isPrimary]
          );

          totalImages++;
          process.stdout.write('✓');
          success = true;
        } catch (err) {
          if (attempt === 2) {
            process.stdout.write(`✗(${err.message.substring(0,40)})`);
            failedImages++;
          }
        }
      }

      // 500ms delay between images to avoid Cloudflare rate limit
      await new Promise(r => setTimeout(r, 500));
    }
  }

  await client.end();
  console.log(`\n\n🏁 Done: ${totalImages} images inserted, ${failedImages} errors`);

  const diskUsage = await fs.readdir(UPLOAD_DIR);
  console.log(`📁 ${diskUsage.length} files in ${UPLOAD_DIR}`);
}

main().catch(console.error);
