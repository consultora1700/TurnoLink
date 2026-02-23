const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '../public/mockups');

async function setTheme(page, isDark) {
  await page.evaluate((dark) => {
    if (dark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
    // Force repaint
    window.dispatchEvent(new Event('resize'));
  }, isDark);
  await page.waitForTimeout(1500);
}

async function screenshot(page, name) {
  const pngPath = path.join(OUTPUT_DIR, `${name}.png`);
  const webpPath = path.join(OUTPUT_DIR, `${name}.webp`);

  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = '*, *::before, *::after { animation: none !important; transition: none !important; }';
    document.head.appendChild(style);
  });
  await page.waitForTimeout(300);

  await page.screenshot({ path: pngPath, type: 'png', timeout: 60000 });

  execSync(`cwebp -q 90 "${pngPath}" -o "${webpPath}"`);
  fs.unlinkSync(pngPath);
  console.log(`  ✓ ${name}.webp`);
}

async function login(page) {
  await page.goto(`${BASE_URL}/login`);
  // Wait for form to render (client component)
  await page.waitForSelector('input#email', { timeout: 30000 });
  await page.waitForTimeout(1000);

  await page.fill('input#email', 'info@bellaestetica.com');
  await page.fill('input#password', 'password123');
  await page.click('button[type="submit"]');

  // Wait for navigation
  await page.waitForURL('**/dashboard', { timeout: 30000 });
  await page.waitForTimeout(2000);
}

async function main() {
  console.log('Starting screenshot capture...\n');
  const browser = await chromium.launch({ headless: true });

  // Desktop
  const desktop = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  });

  // Mobile
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });

  const deskPage = await desktop.newPage();
  const mobPage = await mobile.newPage();

  // Login both
  console.log('Logging in (desktop)...');
  await login(deskPage);
  console.log('Logged in desktop\n');

  console.log('Logging in (mobile)...');
  await login(mobPage);
  console.log('Logged in mobile\n');

  // Desktop pages
  const deskUrls = [
    ['dashboard', '/dashboard'],
    ['turnos', '/turnos'],
    ['servicios', '/servicios'],
    ['clientes', '/clientes'],
  ];

  for (const [name, url] of deskUrls) {
    console.log(`Desktop: ${name}`);
    await deskPage.goto(`${BASE_URL}${url}`);
    await deskPage.waitForTimeout(3000);

    await setTheme(deskPage, false);
    await screenshot(deskPage, `${name}-light`);

    await setTheme(deskPage, true);
    await screenshot(deskPage, `${name}-dark`);
  }

  // Mobile pages
  const mobUrls = [
    ['mobile-dashboard', '/dashboard'],
    ['mobile-turnos', '/turnos'],
    ['mobile-servicios', '/servicios'],
    ['mobile-clientes', '/clientes'],
  ];

  for (const [name, url] of mobUrls) {
    console.log(`Mobile: ${name}`);
    await mobPage.goto(`${BASE_URL}${url}`);
    await mobPage.waitForTimeout(3000);

    await setTheme(mobPage, false);
    await screenshot(mobPage, `${name}-light`);

    await setTheme(mobPage, true);
    await screenshot(mobPage, `${name}-dark`);
  }

  // Public booking - mobile
  console.log('Public booking (mobile)');
  const pubMob = await mobile.newPage();
  await pubMob.goto(`${BASE_URL}/bella-estetica`);
  await pubMob.waitForTimeout(5000);

  await setTheme(pubMob, false);
  await screenshot(pubMob, 'mobile-booking-services-light');

  await setTheme(pubMob, true);
  await screenshot(pubMob, 'mobile-booking-services-dark');

  // Public booking - desktop
  console.log('Public booking (desktop)');
  const pubDesk = await desktop.newPage();
  await pubDesk.goto(`${BASE_URL}/bella-estetica`);
  await pubDesk.waitForTimeout(5000);

  await setTheme(pubDesk, false);
  await screenshot(pubDesk, 'booking-services-light');

  await setTheme(pubDesk, true);
  await screenshot(pubDesk, 'booking-services-dark');

  await browser.close();
  console.log('\n✅ All screenshots completed!');
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
