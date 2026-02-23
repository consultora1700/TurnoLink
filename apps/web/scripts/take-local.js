const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '../public/mockups');

async function screenshot(page, name) {
  const pngPath = path.join(OUTPUT_DIR, `${name}.png`);
  const webpPath = path.join(OUTPUT_DIR, `${name}.webp`);

  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = '*, *::before, *::after { animation: none !important; transition: none !important; }';
    document.head.appendChild(style);
  });

  await page.screenshot({
    path: pngPath,
    type: 'png',
    animations: 'disabled',
    timeout: 120000
  });

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
    reducedMotion: 'reduce',
  });

  const mobilePage = await mobile.newPage();

  // Login
  console.log('Login...');
  await mobilePage.goto(`${BASE_URL}/login`, { timeout: 60000 });
  await mobilePage.waitForTimeout(3000);
  await mobilePage.fill('input[type="email"]', 'info@bellaestetica.com');
  await mobilePage.fill('input[type="password"]', 'password123');
  await mobilePage.click('button[type="submit"]');
  await mobilePage.waitForTimeout(8000);
  console.log('Logged in');

  const urls = [
    ['mobile-dashboard', '/dashboard'],
    ['mobile-turnos', '/turnos'],
    ['mobile-servicios', '/servicios'],
    ['mobile-clientes', '/clientes'],
  ];

  for (const [name, url] of urls) {
    console.log(`${name}...`);
    await mobilePage.goto(`${BASE_URL}${url}`, { timeout: 60000 });
    await mobilePage.waitForTimeout(4000);

    // Light
    await mobilePage.evaluate(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    });
    await mobilePage.waitForTimeout(1000);
    await screenshot(mobilePage, `${name}-light`);

    // Dark
    await mobilePage.evaluate(() => {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    });
    await mobilePage.waitForTimeout(1000);
    await screenshot(mobilePage, `${name}-dark`);
  }

  // Public booking
  console.log('Public booking mobile...');
  const pubPage = await mobile.newPage();
  await pubPage.goto(`${BASE_URL}/bella-estetica`, { timeout: 60000 });
  await pubPage.waitForTimeout(5000);

  await pubPage.evaluate(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  });
  await pubPage.waitForTimeout(1000);
  await screenshot(pubPage, 'mobile-booking-services-light');

  await pubPage.evaluate(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  });
  await pubPage.waitForTimeout(1000);
  await screenshot(pubPage, 'mobile-booking-services-dark');

  // Desktop booking
  console.log('Desktop booking...');
  const desktop = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
  });
  const deskPage = await desktop.newPage();
  await deskPage.goto(`${BASE_URL}/bella-estetica`, { timeout: 60000 });
  await deskPage.waitForTimeout(5000);

  await deskPage.evaluate(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  });
  await deskPage.waitForTimeout(1000);
  await screenshot(deskPage, 'booking-services-light');

  await deskPage.evaluate(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  });
  await deskPage.waitForTimeout(1000);
  await screenshot(deskPage, 'booking-services-dark');

  await browser.close();
  console.log('\n✅ All done!');
}

main().catch(e => {
  console.error(e.message);
  process.exit(1);
});
