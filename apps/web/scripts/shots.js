const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '../public/mockups');

async function shot(page, name) {
  const png = path.join(OUTPUT_DIR, `${name}.png`);
  const webp = path.join(OUTPUT_DIR, `${name}.webp`);

  // Disable animations
  await page.addStyleTag({
    content: '*, *::before, *::after { animation: none !important; transition: none !important; }'
  });
  await page.waitForTimeout(300);

  await page.screenshot({ path: png, type: 'png', timeout: 120000 });

  execSync(`cwebp -q 90 "${png}" -o "${webp}"`);
  fs.unlinkSync(png);
  console.log(`  ✓ ${name}.webp`);
}

async function setTheme(page, isDark) {
  await page.evaluate((dark) => {
    if (dark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.style.colorScheme = 'dark';
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.style.colorScheme = 'light';
      document.body.classList.remove('dark');
    }
    window.dispatchEvent(new Event('resize'));
  }, isDark);
  await page.waitForTimeout(1000);
}

async function login(page) {
  await page.goto(BASE_URL + '/login');
  await page.waitForSelector('#email', { timeout: 30000 });
  await page.fill('#email', 'info@bellaestetica.com');
  await page.fill('#password', 'password123');
  await page.waitForTimeout(300);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 30000 });
  await page.waitForTimeout(2000);
}

(async () => {
  console.log('Starting screenshot capture...\n');
  const browser = await chromium.launch({ headless: true });

  // Desktop context (1x scale due to server memory limits)
  const desktop = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  // Mobile context
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
  });

  const dp = await desktop.newPage();
  const mp = await mobile.newPage();

  // Login desktop
  console.log('Login desktop...');
  await login(dp);
  console.log('Desktop logged in\n');

  // Login mobile
  console.log('Login mobile...');
  await login(mp);
  console.log('Mobile logged in\n');

  // Desktop dashboard pages
  const desktopPages = [
    ['dashboard', '/dashboard'],
    ['turnos', '/turnos'],
    ['servicios', '/servicios'],
    ['clientes', '/clientes'],
  ];

  for (const [name, url] of desktopPages) {
    console.log(`Desktop: ${name}`);
    await dp.goto(BASE_URL + url);
    await dp.waitForTimeout(3000);

    await setTheme(dp, false);
    await shot(dp, `${name}-light`);

    await setTheme(dp, true);
    await shot(dp, `${name}-dark`);
  }

  // Mobile dashboard pages
  const mobilePages = [
    ['mobile-dashboard', '/dashboard'],
    ['mobile-turnos', '/turnos'],
    ['mobile-servicios', '/servicios'],
    ['mobile-clientes', '/clientes'],
  ];

  for (const [name, url] of mobilePages) {
    console.log(`Mobile: ${name}`);
    await mp.goto(BASE_URL + url);
    await mp.waitForTimeout(3000);

    await setTheme(mp, false);
    await shot(mp, `${name}-light`);

    await setTheme(mp, true);
    await shot(mp, `${name}-dark`);
  }

  // Public booking - mobile
  console.log('Public booking (mobile)');
  const pubMob = await mobile.newPage();
  await pubMob.goto(BASE_URL + '/bella-estetica', { timeout: 60000 });
  await pubMob.waitForTimeout(4000);

  await setTheme(pubMob, false);
  await shot(pubMob, 'mobile-booking-services-light');

  await setTheme(pubMob, true);
  await shot(pubMob, 'mobile-booking-services-dark');

  // Public booking - desktop
  console.log('Public booking (desktop)');
  const pubDesk = await desktop.newPage();
  await pubDesk.goto(BASE_URL + '/bella-estetica', { timeout: 60000 });
  await pubDesk.waitForTimeout(4000);

  await setTheme(pubDesk, false);
  await shot(pubDesk, 'booking-services-light');

  await setTheme(pubDesk, true);
  await shot(pubDesk, 'booking-services-dark');

  await browser.close();
  console.log('\n✅ All screenshots completed!');
})();
