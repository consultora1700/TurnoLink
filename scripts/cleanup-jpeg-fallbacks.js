#!/usr/bin/env node
/**
 * Cleanup JPEG fallback files from local disk and R2.
 *
 * These .jpg files were generated as browser fallbacks but are never used —
 * the frontend uses WebP exclusively via Next.js Image.
 *
 * Safe: only deletes .jpg files that have a corresponding .webp (i.e., generated pairs).
 * Does NOT touch standalone .jpg files (e.g., user-uploaded originals stored as .jpg).
 *
 * Usage:
 *   node scripts/cleanup-jpeg-fallbacks.js          # dry run (default)
 *   node scripts/cleanup-jpeg-fallbacks.js --execute # actually delete
 */

const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');

const apiDir = path.join(__dirname, '..', 'apps', 'api');
const { S3Client, DeleteObjectCommand, HeadObjectCommand } = require(
  require.resolve('@aws-sdk/client-s3', { paths: [apiDir] }),
);

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const BUCKET = 'turnolink-uploads';
const DRY_RUN = !process.argv.includes('--execute');

const s3 = new S3Client({
  endpoint: 'https://9a5a5317277e4d67bec000c06570ea4c.r2.cloudflarestorage.com',
  region: 'auto',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '1e4b2d0a629520310a90d8b4a6c060d9',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'd29dde9b69686b9ae49190ce64b826f26c35e177c8f9aef1d36164549229d826',
  },
});

async function walkDir(dir) {
  const files = [];
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkDir(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  console.log(DRY_RUN
    ? '🔍 DRY RUN — no files will be deleted. Use --execute to delete.'
    : '🗑️  EXECUTE MODE — deleting files!',
  );

  const allFiles = await walkDir(UPLOADS_DIR);
  const jpgFiles = allFiles.filter(f => f.endsWith('.jpg'));

  let deletedLocal = 0;
  let deletedR2 = 0;
  let skipped = 0;
  let freedBytes = 0;
  let errors = 0;

  console.log(`\nFound ${jpgFiles.length} .jpg files to evaluate\n`);

  for (const jpgPath of jpgFiles) {
    const webpPath = jpgPath.replace(/\.jpg$/, '.webp');

    // Only delete if corresponding .webp exists (= it's a generated pair)
    if (!fs.existsSync(webpPath)) {
      skipped++;
      continue;
    }

    const stat = await fsp.stat(jpgPath);
    const relativePath = path.relative(UPLOADS_DIR, jpgPath);
    freedBytes += stat.size;

    if (DRY_RUN) {
      deletedLocal++;
      continue;
    }

    // Delete from local disk
    try {
      await fsp.unlink(jpgPath);
      deletedLocal++;
    } catch (err) {
      errors++;
      console.error(`  ❌ Local: ${relativePath}: ${err.message}`);
    }

    // Delete from R2
    try {
      await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: relativePath }));
      deletedR2++;
    } catch (err) {
      // R2 delete is best-effort — file may not exist there
    }

    if (deletedLocal % 200 === 0) {
      process.stdout.write(`  ${deletedLocal}..`);
    }
  }

  // Also clean fallbackUrl from DB
  if (!DRY_RUN) {
    const { Client } = require('pg');
    const client = new Client({
      host: '127.0.0.1',
      user: 'turnolink_user',
      password: 'Tp6l5MpvJKYEVRDzJCDjRdghKqqBpdX01w9e9S3V4UU=',
      database: 'turnolink_db',
    });
    await client.connect();

    const result = await client.query(
      `UPDATE media SET "fallbackUrl" = NULL WHERE "fallbackUrl" IS NOT NULL`,
    );
    console.log(`\n  🗃️  Cleared ${result.rowCount} fallbackUrl values from media table`);

    await client.end();
  }

  const freedMB = (freedBytes / 1024 / 1024).toFixed(1);
  console.log(`\n\n${DRY_RUN ? '📊 Would delete' : '✅ Deleted'}:`);
  console.log(`   Local: ${deletedLocal} .jpg files (${freedMB}MB ${DRY_RUN ? 'to free' : 'freed'})`);
  if (!DRY_RUN) console.log(`   R2: ${deletedR2} .jpg files deleted`);
  console.log(`   Skipped: ${skipped} (standalone .jpg without .webp pair)`);
  if (errors) console.log(`   Errors: ${errors}`);
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
