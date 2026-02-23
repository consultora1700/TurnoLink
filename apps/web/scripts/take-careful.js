const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '../public/mockups');

async function setTheme(page, isDark) {
  await page.evaluate((dark) => {
    // Force theme change
    if (dark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.style.colorScheme = 'dark';
      // Also set data attribute if used
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.style.colorScheme = 'light';
      document.documentElement.setAttribute('data-theme', 'light');
    }

    // Force body background color for dark mode
    if (dark) {
      document.body.style.backgroundColor = '';
      document.body.classList.add('dark');
    } else {
      document.body.style.backgroundColor = '';
      document.body.classList.remove('dark');
    }

    // Trigger a resize to force repaints
    window.dispatchEvent(new Event('resize'));
  }, isDark);

  // Wait for CSS transitions and repaints
  await page.waitForTimeout(1500);

  // Verify the theme was applied
  const appliedTheme = await page.evaluate(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });
  console.log(`    Theme applied: ${appliedTheme}`);
}

async function screenshot(page, name) {
  const pngPath = path.join(OUTPUT_DIR, `${name}.png`);
  const webpPath = path.join(OUTPUT_DIR, `${name}.webp`);

  // Disable animations
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.id = 'disable-animations';
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `;
    document.head.appendChild(style);
  });

  await page.waitForTimeout(500);

  await page.screenshot({
    path: pngPath,
    type: 'png',
    animations: 'disabled',
    timeout: 120000
  });

  // Remove the style after screenshot
  await page.evaluate(() => {
    const style = document.getElementById('disable-animations');
    if (style) style.remove();
  });

  execSync(`cwebp -q 90 "${pngPath}" -o "${webpPath}"`);
  fs.unlinkSync(pngPath);
  console.log(`  ✓ ${name}.webp`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // Mobile context
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    colorScheme: 'light', // Start with light
    reducedMotion: 'reduce',
  });

  // Desktop context
  const desktop = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
    colorScheme: 'light',
    reducedMotion: 'reduce',
  });

  const mobilePage = await mobile.newPage();
  const desktopPage = await desktop.newPage();

  // Login on desktop
  console.log('Desktop Login...');
  await desktopPage.goto(`${BASE_URL}/login`, { timeout: 60000 });
  await desktopPage.waitForTimeout(3000);
  await desktopPage.fill('input[type="email"]', 'info@bellaestetica.com');
  await desktopPage.fill('input[type="password"]', 'password123');
  await desktopPage.click('button[type="submit"]');
  await desktopPage.waitForTimeout(8000);
  console.log('Desktop logged in');

  // Login on mobile
  console.log('Mobile Login...');
  await mobilePage.goto(`${BASE_URL}/login`, { timeout: 60000 });
  await mobilePage.waitForTimeout(3000);
  await mobilePage.fill('input[type="email"]', 'info@bellaestetica.com');
  await mobilePage.fill('input[type="password"]', 'password123');
  await mobilePage.click('button[type="submit"]');
  await mobilePage.waitForTimeout(8000);
  console.log('Mobile logged in');

  // Desktop dashboard pages
  const desktopUrls = [
    ['dashboard', '/dashboard'],
    ['turnos', '/turnos'],
    ['servicios', '/servicios'],
    ['clientes', '/clientes'],
  ];

  for (const [name, url] of desktopUrls) {
    console.log(`Desktop: ${name}...`);
    await desktopPage.goto(`${BASE_URL}${url}`, { timeout: 60000 });
    await desktopPage.waitForTimeout(4000);

    // Light mode
    console.log('  Taking light...');
    await setTheme(desktopPage, false);
    await screenshot(desktopPage, `${name}-light`);

    // Dark mode - CAREFUL: wait extra time for all elements to update
    console.log('  Taking dark...');
    await setTheme(desktopPage, true);
    await desktopPage.waitForTimeout(1000); // Extra wait for dark mode
    await screenshot(desktopPage, `${name}-dark`);
  }

  // Mobile dashboard pages
  const mobileUrls = [
    ['mobile-dashboard', '/dashboard'],
    ['mobile-turnos', '/turnos'],
    ['mobile-servicios', '/servicios'],
    ['mobile-clientes', '/clientes'],
  ];

  for (const [name, url] of mobileUrls) {
    console.log(`Mobile: ${name}...`);
    await mobilePage.goto(`${BASE_URL}${url}`, { timeout: 60000 });
    await mobilePage.waitForTimeout(4000);

    // Light mode
    console.log('  Taking light...');
    await setTheme(mobilePage, false);
    await screenshot(mobilePage, `${name}-light`);

    // Dark mode
    console.log('  Taking dark...');
    await setTheme(mobilePage, true);
    await mobilePage.waitForTimeout(1000);
    await screenshot(mobilePage, `${name}-dark`);
  }

  // Public booking pages
  console.log('Public booking (mobile)...');
  const pubMobile = await mobile.newPage();
  await pubMobile.goto(`${BASE_URL}/bella-estetica`, { timeout: 60000 });
  await pubMobile.waitForTimeout(5000);

  console.log('  Taking light...');
  await setTheme(pubMobile, false);
  await screenshot(pubMobile, 'mobile-booking-services-light');

  console.log('  Taking dark...');
  await setTheme(pubMobile, true);
  await pubMobile.waitForTimeout(1000);
  await screenshot(pubMobile, 'mobile-booking-services-dark');

  console.log('Public booking (desktop)...');
  const pubDesktop = await desktop.newPage();
  await pubDesktop.goto(`${BASE_URL}/bella-estetica`, { timeout: 60000 });
  await pubDesktop.waitForTimeout(5000);

  console.log('  Taking light...');
  await setTheme(pubDesktop, false);
  await screenshot(pubDesktop, 'booking-services-light');

  console.log('  Taking dark...');
  await setTheme(pubDesktop, true);
  await pubDesktop.waitForTimeout(1000);
  await screenshot(pubDesktop, 'booking-services-dark');

  await browser.close();
  console.log('\n✅ All screenshots taken!');
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
