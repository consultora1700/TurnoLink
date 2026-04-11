#!/usr/bin/env node
/**
 * Migrate Akiabara product images to Moda Urbana BA demo tenant.
 * Downloads from akiabara.com, processes with Sharp (WebP + JPEG + thumb), saves locally.
 */

// Resolve modules from the api workspace where they're installed
const apiDir = require('path').join(__dirname, '..', 'apps', 'api');
const sharp = require(require.resolve('sharp', { paths: [apiDir] }));
const { v4: uuidv4 } = require(require.resolve('uuid', { paths: [apiDir] }));
const path = require('path');
const fs = require('fs/promises');
const https = require('https');
const http = require('http');

const TENANT_ID = '31bd1d81-2c5b-4313-b066-d1daff7bedc5';
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', TENANT_ID, 'products');
const API_URL = 'https://api.turnolink.com.ar';
const DB_CONN = {
  host: '127.0.0.1',
  user: 'turnolink_user',
  password: 'Tp6l5MpvJKYEVRDzJCDjRdghKqqBpdX01w9e9S3V4UU=',
  database: 'turnolink_db',
};

// Map each product ID to Akiabara image data
// Format: [productId, startImageId, sku, numImages]
// Images are sequential: startImageId, startImageId+1, etc.
const PRODUCT_IMAGES = [
  // === REMERAS ===
  ['p0000000-0001-0000-0000-000000000001', 121349, '136319', 5], // Remera ML Naomi
  ['p0000000-0002-0000-0000-000000000001', 121379, '136309', 5], // Remera MC Naomi
  ['p0000000-0003-0000-0000-000000000001', 121391, '131463', 5], // Polera Hudson
  ['p0000000-0004-0000-0000-000000000001', 121361, '131473', 5], // Remera Nina
  ['p0000000-0005-0000-0000-000000000001', 120993, '131078', 5], // Polera Cobain
  ['p0000000-0006-0000-0000-000000000001', 119420, '136897', 5], // Remera Cuello U Dylan
  ['p0000000-0007-0000-0000-000000000001', 119380, '131189', 5], // Remera Paul
  ['p0000000-0008-0000-0000-000000000001', 119129, '128814', 5], // Polera ML Prince

  // === BLUSAS Y CAMISAS ===
  ['p0000000-0009-0000-0000-000000000001', 119244, '136912', 5], // Blusa Natalie
  ['p0000000-0010-0000-0000-000000000001', 121177, '136920', 5], // Camisa Elton
  ['p0000000-0011-0000-0000-000000000001', 119017, '137031', 5], // Camisa Lennox
  ['p0000000-0012-0000-0000-000000000001', 119340, '137025', 5], // Blusa Marvin
  ['p0000000-0013-0000-0000-000000000001', 120940, '137016', 5], // Camisa Dylan
  ['p0000000-0014-0000-0000-000000000001', 118999, '136867', 5], // Blusa Francis
  ['p0000000-0015-0000-0000-000000000001', 121171, '136933', 5], // Camisa Iggy

  // === SWEATERS / TEJIDOS ===
  ['p0000000-0016-0000-0000-000000000001', 119175, '113974', 5], // Sweater Ella (using Kurt images)
  ['p0000000-0017-0000-0000-000000000001', 118633, '107651', 5], // Sweater Keys
  ['p0000000-0018-0000-0000-000000000001', 119396, '107428', 5], // Sweater Lee (using Tina images)
  ['p0000000-0019-0000-0000-000000000001', 121112, '118314', 5], // Polera Iggy (using Abbey images)
  ['p0000000-0020-0000-0000-000000000001', 121567, '118256', 5], // Sweater Mariah (using Parker images)
  ['p0000000-0021-0000-0000-000000000001', 121614, '128208', 5], // Polera Lewis (using Sienna images)
  ['p0000000-0022-0000-0000-000000000001', 121082, '118250', 5], // Sweater Tatum (using Powel images)
  ['p0000000-0023-0000-0000-000000000001', 121100, '118302', 5], // Sweater Taylor (using Jolie images)

  // === PANTALONES ===
  ['p0000000-0024-0000-0000-000000000001', 121643, '128613', 5], // Pantalón Iggy (Patti wide)
  ['p0000000-0025-0000-0000-000000000001', 115493, '128860', 5], // Pantalón Cargo Joni (Cargo Marvin)
  ['p0000000-0026-0000-0000-000000000001', 119169, '128869', 5], // Pantalón Nicks (Wide Leg Art)
  ['p0000000-0027-0000-0000-000000000001', 118562, '128610', 5], // Pantalón Bonnie (Chaleco denim)
  ['p0000000-0028-0000-0000-000000000001', 121935, '128859', 5], // Pantalón Patti (Wide Leg Amy)
  ['p0000000-0029-0000-0000-000000000001', 119549, '128644', 4], // Pantalón Nina (Pollera Smith)
  ['p0000000-0030-0000-0000-000000000001', 122005, '128645', 4], // Pantalón Franz (Pollera Smith v2)
  ['p0000000-0031-0000-0000-000000000001', 121261, '128870', 5], // Pantalón Clapton (Chaqueta Suzi)

  // === VESTIDOS Y POLLERAS ===
  ['p0000000-0032-0000-0000-000000000001', 118766, '118595', 5], // Vestido Largo Nicks
  ['p0000000-0033-0000-0000-000000000001', 118556, '118130', 5], // Pollera Larga Joplin
  ['p0000000-0034-0000-0000-000000000001', 118580, '118599', 5], // Pollera Corta Nicks
  ['p0000000-0035-0000-0000-000000000001', 121325, '136936', 5], // Pollera Elton
  ['p0000000-0036-0000-0000-000000000001', 121999, '136942', 5], // Pollera Larga Iggy
  ['p0000000-0037-0000-0000-000000000001', 121679, '137094', 5], // Pollera Franz

  // === ABRIGOS ===
  ['p0000000-0038-0000-0000-000000000001', 119051, '137120', 5], // Trench Iggy
  ['p0000000-0039-0000-0000-000000000001', 119431, '129025', 5], // Trench Bowie
  ['p0000000-0040-0000-0000-000000000001', 119362, '128580', 5], // Tapado Kate
  ['p0000000-0041-0000-0000-000000000001', 121255, '136947', 5], // Blazer Joni
  ['p0000000-0042-0000-0000-000000000001', 118964, '114568', 5], // Campera Nina
  ['p0000000-0043-0000-0000-000000000001', 119232, '130396', 5], // Campera Olivia
  ['p0000000-0044-0000-0000-000000000001', 118981, '136944', 5], // Saco Nina
  ['p0000000-0045-0000-0000-000000000001', 119414, '118012', 5], // Campera Max

  // === DENIM ===
  ['p0000000-0046-0000-0000-000000000001', 118721, '128974', 5], // Jean Wide Leg Billie
  ['p0000000-0047-0000-0000-000000000001', 122692, '137032', 5], // Campera Jimi Denim
  ['p0000000-0048-0000-0000-000000000001', 115379, '128626', 5], // Jean Skinny Nina
  ['p0000000-0049-0000-0000-000000000001', 115493, '128860', 4], // Jean Cargo Marvin
  ['p0000000-0050-0000-0000-000000000001', 118562, '128610', 4], // Chaleco Bonnie Denim

  // === CALZADO ===
  ['p0000000-0051-0000-0000-000000000001', 105776, '128364', 5], // Bota Abbey
  ['p0000000-0052-0000-0000-000000000001', 105870, '128419', 5], // Bota Monk
  ['p0000000-0053-0000-0000-000000000001', 103148, '118772', 5], // Bota Jolie
  ['p0000000-0054-0000-0000-000000000001', 93986, '118760', 5],  // Bota Camden
];

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Referer': 'https://akiabara.com/',
      },
      timeout: 15000,
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
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
  return `${API_URL}/uploads/${TENANT_ID}/products/${uuid}.webp`;
}

async function main() {
  // Ensure upload directory
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const { Client } = require('pg');
  const client = new Client(DB_CONN);
  await client.connect();

  let totalImages = 0;
  let failedImages = 0;

  for (const [productId, startImgId, sku, numImages] of PRODUCT_IMAGES) {
    const productName = await client.query('SELECT name FROM products WHERE id = $1', [productId]);
    const name = productName.rows[0]?.name || productId;
    process.stdout.write(`\n📦 ${name} (${numImages} imgs): `);

    for (let i = 0; i < numImages; i++) {
      const imgId = startImgId + i;
      const url = `https://akiabara.com/${imgId}-big_default/${sku}.jpg`;
      const uuid = uuidv4();
      const isPrimary = i === 0;

      try {
        const buffer = await downloadImage(url);

        if (buffer.length < 1000) {
          // Too small, probably an error page
          process.stdout.write('⚠');
          failedImages++;
          continue;
        }

        const savedUrl = await processAndSave(buffer, uuid, UPLOAD_DIR);

        await client.query(
          `INSERT INTO product_images (id, "productId", url, alt, "order", "isPrimary", "createdAt")
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [uuidv4(), productId, savedUrl, `${name} - foto ${i + 1}`, i, isPrimary]
        );

        totalImages++;
        process.stdout.write('✓');
      } catch (err) {
        // Try thickbox_default as fallback
        try {
          const fallbackUrl = `https://akiabara.com/${imgId}-thickbox_default/${sku}.jpg`;
          const buffer = await downloadImage(fallbackUrl);

          if (buffer.length < 1000) {
            process.stdout.write('⚠');
            failedImages++;
            continue;
          }

          const savedUrl = await processAndSave(buffer, uuid, UPLOAD_DIR);

          await client.query(
            `INSERT INTO product_images (id, "productId", url, alt, "order", "isPrimary", "createdAt")
             VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
            [uuidv4(), productId, savedUrl, `${name} - foto ${i + 1}`, i, isPrimary]
          );

          totalImages++;
          process.stdout.write('✓');
        } catch {
          process.stdout.write('✗');
          failedImages++;
        }
      }

      // Small delay to be polite to akiabara servers
      await new Promise(r => setTimeout(r, 200));
    }
  }

  // Also update the products table `images` array with the primary image URL
  const products = await client.query(
    `SELECT p.id, pi.url FROM products p
     JOIN product_images pi ON pi."productId" = p.id AND pi."isPrimary" = true
     WHERE p."tenantId" = $1`,
    [TENANT_ID]
  );

  for (const row of products.rows) {
    await client.query(
      `UPDATE products SET images = $1 WHERE id = $2`,
      [JSON.stringify([row.url]), row.id]
    );
  }

  await client.end();

  console.log(`\n\n✅ Done! ${totalImages} images saved, ${failedImages} failed`);
  console.log(`📁 Files in: ${UPLOAD_DIR}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
