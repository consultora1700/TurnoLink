#!/usr/bin/env node
/**
 * Cleanup orphan files — files on disk/R2 with no corresponding DB record.
 *
 * Scans the uploads directory and checks each file against:
 * - media table (url, thumbnailUrl)
 * - product_images table (url)
 * - services table (image)
 *
 * Safe: dry-run by default. Only deletes with --execute flag.
 * Designed to run as a weekly cron job.
 *
 * Usage:
 *   node scripts/cleanup-orphan-files.js          # dry run
 *   node scripts/cleanup-orphan-files.js --execute # delete orphans
 */

const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');

const apiDir = path.join(__dirname, '..', 'apps', 'api');
const { S3Client, DeleteObjectCommand } = require(
  require.resolve('@aws-sdk/client-s3', { paths: [apiDir] }),
);

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const BUCKET = 'turnolink-uploads';
const DRY_RUN = !process.argv.includes('--execute');
// Skip files newer than 1 hour (may still be in upload process)
const MIN_AGE_MS = 60 * 60 * 1000;

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
  try {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...await walkDir(fullPath));
      } else {
        files.push(fullPath);
      }
    }
  } catch {
    // Directory may not exist
  }
  return files;
}

async function main() {
  console.log(DRY_RUN
    ? '🔍 DRY RUN — scanning for orphans (no deletions)'
    : '🗑️  EXECUTE MODE — deleting orphan files',
  );

  // Load all known URLs from DB
  const { Client } = require('pg');
  const client = new Client({
    host: '127.0.0.1',
    user: 'turnolink_user',
    password: 'Tp6l5MpvJKYEVRDzJCDjRdghKqqBpdX01w9e9S3V4UU=',
    database: 'turnolink_db',
  });
  await client.connect();

  console.log('\n📋 Loading known URLs from database...');

  // Collect all URLs referenced in DB
  const knownPaths = new Set();

  // media table
  const mediaRows = await client.query(
    `SELECT url, "thumbnailUrl" FROM media WHERE url IS NOT NULL`,
  );
  for (const row of mediaRows.rows) {
    if (row.url) extractPath(row.url, knownPaths);
    if (row.thumbnailUrl) extractPath(row.thumbnailUrl, knownPaths);
  }

  // product_images table
  const piRows = await client.query(
    `SELECT url FROM product_images WHERE url LIKE '%/uploads/%'`,
  );
  for (const row of piRows.rows) {
    extractPath(row.url, knownPaths);
  }

  // services table
  const svcRows = await client.query(
    `SELECT image FROM services WHERE image LIKE '%/uploads/%'`,
  );
  for (const row of svcRows.rows) {
    extractPath(row.image, knownPaths);
  }

  console.log(`   ${knownPaths.size} unique file paths referenced in DB`);

  await client.end();

  // Scan local files
  const allFiles = await walkDir(UPLOADS_DIR);
  const now = Date.now();

  let orphanCount = 0;
  let orphanBytes = 0;
  let keptCount = 0;
  let tooNewCount = 0;
  let deletedR2 = 0;
  let errors = 0;

  console.log(`\n🔎 Scanning ${allFiles.length} local files...\n`);

  for (const filePath of allFiles) {
    const relativePath = path.relative(UPLOADS_DIR, filePath);

    // Skip files that are too new (may be mid-upload)
    const stat = await fsp.stat(filePath);
    if (now - stat.mtimeMs < MIN_AGE_MS) {
      tooNewCount++;
      continue;
    }

    // Check if this file is referenced
    if (knownPaths.has(relativePath)) {
      keptCount++;
      continue;
    }

    // Also check if this is a thumbnail/fallback of a known file
    const baseName = relativePath.replace(/-thumb\.webp$/, '.webp').replace(/\.jpg$/, '.webp');
    if (baseName !== relativePath && knownPaths.has(baseName)) {
      keptCount++;
      continue;
    }

    // Orphan found
    orphanCount++;
    orphanBytes += stat.size;

    if (!DRY_RUN) {
      try {
        await fsp.unlink(filePath);
      } catch (err) {
        errors++;
      }

      // Also delete from R2
      try {
        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: relativePath }));
        deletedR2++;
      } catch {
        // best-effort
      }
    }

    if (orphanCount <= 20) {
      console.log(`   ${DRY_RUN ? '👻' : '🗑️ '} ${relativePath} (${(stat.size / 1024).toFixed(0)}KB)`);
    } else if (orphanCount % 100 === 0) {
      process.stdout.write(`   ${orphanCount} orphans...\n`);
    }
  }

  const freedMB = (orphanBytes / 1024 / 1024).toFixed(1);
  console.log(`\n📊 Results:`);
  console.log(`   Referenced (kept): ${keptCount}`);
  console.log(`   Too new (skipped): ${tooNewCount}`);
  console.log(`   Orphans ${DRY_RUN ? 'found' : 'deleted'}: ${orphanCount} (${freedMB}MB)`);
  if (!DRY_RUN) console.log(`   R2 deletions: ${deletedR2}`);
  if (errors) console.log(`   Errors: ${errors}`);
}

function extractPath(url, set) {
  const match = url.match(/\/uploads\/(.+)$/);
  if (match) set.add(match[1]);
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
