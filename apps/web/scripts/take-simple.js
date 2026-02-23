const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const BASE_URL = 'https://turnolink.mubitt.com';
const OUTPUT_DIR = path.join(__dirname, '../public/mockups');

async function screenshot(page, name) {
  const pngPath = path.join(OUTPUT_DIR, `${name}.png`);
  const webpPath = path.join(OUTPUT_DIR, `${name}.webp`);

  await page.screenshot({ path: pngPath, type: 'png', fullPage: false });
  execSync(`cwebp -q 90 "${pngPath}" -o "${webpPath}"`);
  fs.unlinkSync(pngPath);
  console.log(`✓ ${name}.webp`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // Mobile
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });

  const mobilePage = await mobile.newPage();

  // Login
  console.log('Login...');
  await mobilePage.goto(`${BASE_URL}/login`);
  await mobilePage.waitForTimeout(2000);
  await mobilePage.fill('input[type="email"]', 'info@bellaestetica.com');
  await mobilePage.fill('input[type="password"]', 'password123');
  await mobilePage.click('button[type="submit"]');
  await mobilePage.waitForTimeout(5000);

  const urls = [
    ['mobile-dashboard', '/dashboard'],
    ['mobile-turnos', '/turnos'],
    ['mobile-servicios', '/servicios'],
    ['mobile-clientes', '/clientes'],
  ];

  for (const [name, url] of urls) {
    console.log(`${name}...`);
    await mobilePage.goto(`${BASE_URL}${url}`);
    await mobilePage.waitForTimeout(3000);

    // Light
    await mobilePage.evaluate(() => {
      document.documentElement.classList.remove('dark');
    });
    await mobilePage.waitForTimeout(500);
    await screenshot(mobilePage, `${name}-light`);

    // Dark
    await mobilePage.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    await mobilePage.waitForTimeout(500);
    await screenshot(mobilePage, `${name}-dark`);
  }

  // Public booking
  console.log('Public booking...');
  const pubPage = await mobile.newPage();
  await pubPage.goto(`${BASE_URL}/bella-estetica`);
  await pubPage.waitForTimeout(4000);

  await pubPage.evaluate(() => document.documentElement.classList.remove('dark'));
  await pubPage.waitForTimeout(500);
  await screenshot(pubPage, 'mobile-booking-services-light');

  await pubPage.evaluate(() => document.documentElement.classList.add('dark'));
  await pubPage.waitForTimeout(500);
  await screenshot(pubPage, 'mobile-booking-services-dark');

  // Desktop booking
  console.log('Desktop booking...');
  const desktop = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  });
  const deskPage = await desktop.newPage();
  await deskPage.goto(`${BASE_URL}/bella-estetica`);
  await deskPage.waitForTimeout(4000);

  await deskPage.evaluate(() => document.documentElement.classList.remove('dark'));
  await deskPage.waitForTimeout(500);
  await screenshot(deskPage, 'booking-services-light');

  await deskPage.evaluate(() => document.documentElement.classList.add('dark'));
  await deskPage.waitForTimeout(500);
  await screenshot(deskPage, 'booking-services-dark');

  await browser.close();
  console.log('\nDone!');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
