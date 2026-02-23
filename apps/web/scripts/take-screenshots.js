const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const BASE_URL = 'https://turnolink.mubitt.com';
const OUTPUT_DIR = path.join(__dirname, '../public/mockups');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function takeScreenshot(page, name, theme) {
  const pngPath = path.join(OUTPUT_DIR, `${name}-${theme}.png`);
  const webpPath = path.join(OUTPUT_DIR, `${name}-${theme}.webp`);

  // Set theme
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
  await page.waitForTimeout(500);

  // Take PNG screenshot
  await page.screenshot({ path: pngPath, type: 'png' });

  // Convert to webp using cwebp if available, otherwise use sharp
  try {
    execSync(`cwebp -q 90 "${pngPath}" -o "${webpPath}"`, { stdio: 'pipe' });
    fs.unlinkSync(pngPath); // Remove PNG
  } catch {
    // If cwebp not available, keep as PNG and rename
    fs.renameSync(pngPath, webpPath.replace('.webp', '.png'));
    console.log(`  (kept as PNG - cwebp not available)`);
  }

  console.log(`  ✓ ${name}-${theme}.webp`);
}

async function takeScreenshots() {
  const browser = await chromium.launch({ headless: true });

  // Desktop viewport
  const desktopContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  });

  // Mobile viewport
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
  });

  const desktopPage = await desktopContext.newPage();
  const mobilePage = await mobileContext.newPage();

  // Login for dashboard screenshots
  console.log('Logging in...');
  await desktopPage.goto(`${BASE_URL}/login`);
  await desktopPage.waitForLoadState('networkidle');

  await desktopPage.fill('input[type="email"]', 'info@bellaestetica.com');
  await desktopPage.fill('input[type="password"]', 'password123');
  await desktopPage.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await desktopPage.waitForURL('**/dashboard', { timeout: 30000 });
  await desktopPage.waitForLoadState('networkidle');
  console.log('Logged in successfully');

  // Dashboard pages to capture
  const dashboardPages = [
    { name: 'dashboard', path: '/dashboard' },
    { name: 'turnos', path: '/turnos' },
    { name: 'servicios', path: '/servicios' },
    { name: 'clientes', path: '/clientes' },
  ];

  // Take desktop screenshots (light and dark)
  for (const pageInfo of dashboardPages) {
    console.log(`Capturing ${pageInfo.name}...`);

    await desktopPage.goto(`${BASE_URL}${pageInfo.path}`);
    await desktopPage.waitForLoadState('networkidle');
    await desktopPage.waitForTimeout(1500);

    await takeScreenshot(desktopPage, pageInfo.name, 'light');
    await takeScreenshot(desktopPage, pageInfo.name, 'dark');
  }

  // Mobile dashboard screenshots
  console.log('\nTaking mobile dashboard screenshots...');

  // Login on mobile
  await mobilePage.goto(`${BASE_URL}/login`);
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.fill('input[type="email"]', 'info@bellaestetica.com');
  await mobilePage.fill('input[type="password"]', 'password123');
  await mobilePage.click('button[type="submit"]');
  await mobilePage.waitForURL('**/dashboard', { timeout: 30000 });
  await mobilePage.waitForLoadState('networkidle');

  const mobileDashboardPages = [
    { name: 'mobile-dashboard', path: '/dashboard' },
    { name: 'mobile-turnos', path: '/turnos' },
    { name: 'mobile-servicios', path: '/servicios' },
    { name: 'mobile-clientes', path: '/clientes' },
  ];

  for (const pageInfo of mobileDashboardPages) {
    console.log(`Capturing ${pageInfo.name}...`);

    await mobilePage.goto(`${BASE_URL}${pageInfo.path}`);
    await mobilePage.waitForLoadState('networkidle');
    await mobilePage.waitForTimeout(1500);

    await takeScreenshot(mobilePage, pageInfo.name, 'light');
    await takeScreenshot(mobilePage, pageInfo.name, 'dark');
  }

  // Public booking page screenshots (mobile)
  console.log('\nTaking public booking page screenshots...');

  const publicMobilePage = await mobileContext.newPage();

  // Booking services page
  await publicMobilePage.goto(`${BASE_URL}/bella-estetica`);
  await publicMobilePage.waitForLoadState('networkidle');
  await publicMobilePage.waitForTimeout(3000); // Wait for loading to finish

  await takeScreenshot(publicMobilePage, 'mobile-booking-services', 'light');
  await takeScreenshot(publicMobilePage, 'mobile-booking-services', 'dark');

  // Desktop booking page
  console.log('\nTaking desktop booking page screenshots...');
  const publicDesktopPage = await desktopContext.newPage();
  await publicDesktopPage.goto(`${BASE_URL}/bella-estetica`);
  await publicDesktopPage.waitForLoadState('networkidle');
  await publicDesktopPage.waitForTimeout(3000);

  await takeScreenshot(publicDesktopPage, 'booking-services', 'light');
  await takeScreenshot(publicDesktopPage, 'booking-services', 'dark');

  await browser.close();
  console.log('\n✅ All screenshots taken successfully!');
}

takeScreenshots().catch(console.error);
