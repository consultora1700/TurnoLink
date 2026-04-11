/**
 * Sync all local uploads to R2, then update DB URLs from /uploads/ to /api/cdn/.
 * Safe: checks if key already exists in R2 before uploading. Idempotent.
 */
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const UPLOADS_DIR = path.resolve(__dirname, '..', 'uploads');
const BUCKET = 'turnolink-uploads';
const CDN_BASE = 'https://api.turnolink.com.ar/api/cdn';
const OLD_BASE = 'https://api.turnolink.com.ar/uploads';

const s3 = new S3Client({
  endpoint: 'https://9a5a5317277e4d67bec000c06570ea4c.r2.cloudflarestorage.com',
  region: 'auto',
  credentials: {
    accessKeyId: '1e4b2d0a629520310a90d8b4a6c060d9',
    secretAccessKey: 'd29dde9b69686b9ae49190ce64b826f26c35e177c8f9aef1d36164549229d826',
  },
});

const prisma = new PrismaClient();

function getAllFiles(dir: string, base = ''): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...getAllFiles(path.join(dir, entry.name), rel));
    } else {
      files.push(rel);
    }
  }
  return files;
}

async function existsInR2(key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function uploadFile(localPath: string, key: string) {
  const body = fs.readFileSync(localPath);
  const contentType = mime.lookup(localPath) || 'application/octet-stream';
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }));
}

async function main() {
  console.log('=== Phase 1: Sync local files to R2 ===');
  const files = getAllFiles(UPLOADS_DIR);
  console.log(`Found ${files.length} local files`);

  let uploaded = 0, skipped = 0, errors = 0;

  // Process in batches of 10 for concurrency
  for (let i = 0; i < files.length; i += 10) {
    const batch = files.slice(i, i + 10);
    await Promise.all(batch.map(async (relPath: string) => {
      const key = relPath; // R2 key = relative path from uploads/
      const localPath = path.join(UPLOADS_DIR, relPath);
      try {
        if (await existsInR2(key)) {
          skipped++;
        } else {
          await uploadFile(localPath, key);
          uploaded++;
        }
      } catch (e: any) {
        errors++;
        console.error(`  ERROR ${key}: ${e.message}`);
      }
    }));
    if ((i + 10) % 100 === 0 || i + 10 >= files.length) {
      console.log(`  Progress: ${Math.min(i + 10, files.length)}/${files.length} (uploaded: ${uploaded}, skipped: ${skipped}, errors: ${errors})`);
    }
  }
  console.log(`Sync done: ${uploaded} uploaded, ${skipped} already in R2, ${errors} errors\n`);

  console.log('=== Phase 2: Update DB URLs ===');

  // Update media table
  const mediaResult = await prisma.$executeRawUnsafe(
    `UPDATE "Media" SET
       url = REPLACE(url, '${OLD_BASE}', '${CDN_BASE}'),
       "thumbnailUrl" = REPLACE("thumbnailUrl", '${OLD_BASE}', '${CDN_BASE}')
     WHERE url LIKE '%${OLD_BASE}%'`
  );
  console.log(`Media records updated: ${mediaResult}`);

  // Update product_images table
  const piResult = await prisma.$executeRawUnsafe(
    `UPDATE "ProductImage" SET
       url = REPLACE(url, '${OLD_BASE}', '${CDN_BASE}'),
       "thumbnailUrl" = REPLACE("thumbnailUrl", '${OLD_BASE}', '${CDN_BASE}')
     WHERE url LIKE '%${OLD_BASE}%'`
  );
  console.log(`ProductImage records updated: ${piResult}`);

  // Check for any remaining old URLs
  const remaining = await prisma.media.count({ where: { url: { contains: '/uploads/' } } });
  const piRemaining = await prisma.productImage.count({ where: { url: { contains: '/uploads/' } } });
  console.log(`\nRemaining /uploads/ URLs — Media: ${remaining}, ProductImage: ${piRemaining}`);

  await prisma.$disconnect();
  console.log('\nDone! All images now served via R2 CDN proxy.');
}

main().catch(e => { console.error(e); process.exit(1); });
