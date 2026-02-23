const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const BASE_URL = 'https://turnolink.mubitt.com';
const OUTPUT_DIR = path.join(__dirname, '../public/mockups');

async function takeScreenshot(page, name, theme) {
  const pngPath = path.join(OUTPUT_DIR, `${name}-${theme}.png`);
  const webpPath = path.join(OUTPUT_DIR, `${name}-${theme}.webp`);

  if (theme === 'dark') {
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    });
  } else {
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    });
  }
  await page.waitForTimeout(800);

  await page.screenshot({ path: pngPath, type: 'png', timeout: 60000 });

  try {
    execSync(`cwebp -q 90 "${pngPath}" -o "${webpPath}"`, { stdio: 'pipe' });
    fs.unlinkSync(pngPath);
  } catch (e) {
    console.log(`  Error converting: ${e.message}`);
  }

  console.log(`  ✓ ${name}-${theme}.webp`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // Mobile viewport
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });

  const mobilePage = await mobileContext.newPage();

  // Login on mobile
  console.log('Logging in mobile...');
  await mobilePage.goto(`${BASE_URL}/login`);
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.fill('input[type="email"]', 'info@bellaestetica.com');
  await mobilePage.fill('input[type="password"]', 'password123');
  await mobilePage.click('button[type="submit"]');
  await mobilePage.waitForURL('**/dashboard', { timeout: 60000 });
  console.log('Logged in');

  // Mobile dashboard pages
  const pages = [
    { name: 'mobile-dashboard', path: '/dashboard' },
    { name: 'mobile-turnos', path: '/turnos' },
    { name: 'mobile-servicios', path: '/servicios' },
    { name: 'mobile-clientes', path: '/clientes' },
  ];

  for (const p of pages) {
    // Skip if light already exists (continue from where we left)
    const lightExists = fs.existsSync(path.join(OUTPUT_DIR, `${p.name}-light.webp`));
    const darkExists = fs.existsSync(path.join(OUTPUT_DIR, `${p.name}-dark.webp`));

    if (lightExists && darkExists) {
      console.log(`Skipping ${p.name} (already exists)`);
      continue;
    }

    console.log(`Capturing ${p.name}...`);
    await mobilePage.goto(`${BASE_URL}${p.path}`);
    await mobilePage.waitForLoadState('networkidle');
    await mobilePage.waitForTimeout(2000);

    if (!lightExists) await takeScreenshot(mobilePage, p.name, 'light');
    if (!darkExists) await takeScreenshot(mobilePage, p.name, 'dark');
  }

  // Public booking page
  console.log('\nCapturing public booking page...');
  const publicPage = await mobileContext.newPage();
  await publicPage.goto(`${BASE_URL}/bella-estetica`);
  await publicPage.waitForLoadState('networkidle');
  await publicPage.waitForTimeout(3000);

  if (!fs.existsSync(path.join(OUTPUT_DIR, 'mobile-booking-services-light.webp'))) {
    await takeScreenshot(publicPage, 'mobile-booking-services', 'light');
  }
  if (!fs.existsSync(path.join(OUTPUT_DIR, 'mobile-booking-services-dark.webp'))) {
    await takeScreenshot(publicPage, 'mobile-booking-services', 'dark');
  }

  // Desktop booking
  console.log('\nCapturing desktop booking...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto(`${BASE_URL}/bella-estetica`);
  await desktopPage.waitForLoadState('networkidle');
  await desktopPage.waitForTimeout(3000);

  if (!fs.existsSync(path.join(OUTPUT_DIR, 'booking-services-light.webp'))) {
    await takeScreenshot(desktopPage, 'booking-services', 'light');
  }
  if (!fs.existsSync(path.join(OUTPUT_DIR, 'booking-services-dark.webp'))) {
    await takeScreenshot(desktopPage, 'booking-services', 'dark');
  }

  await browser.close();
  console.log('\n✅ Done!');
}

main().catch(console.error);
