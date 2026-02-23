import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const CONFIG = {
  baseUrl: 'https://turnolink.mubitt.com',
  credentials: {
    email: 'info@bellaestetica.com',
    password: 'password123'
  },
  publicSlug: 'bella-estetica',
  outputDir: path.join(__dirname, '../apps/web/public/screenshots'),

  // Viewports
  viewports: {
    desktop: { width: 1440, height: 900 },
    mobile: { width: 390, height: 844 } // iPhone 14 Pro
  }
};

// Pages to capture
const DASHBOARD_PAGES = [
  { name: 'dashboard', path: '/dashboard', waitFor: '[class*="gradient"]' },
  { name: 'turnos', path: '/turnos', waitFor: '[class*="gradient"]' },
  { name: 'servicios', path: '/servicios', waitFor: '[class*="gradient"]' },
  { name: 'clientes', path: '/clientes', waitFor: '[class*="gradient"]' },
  { name: 'empleados', path: '/empleados', waitFor: '[class*="gradient"]' },
  { name: 'horarios', path: '/horarios', waitFor: '[class*="gradient"]' },
  { name: 'configuracion', path: '/configuracion', waitFor: '[class*="gradient"]' },
  { name: 'pagos', path: '/pagos', waitFor: '[class*="gradient"]' },
];

const PUBLIC_PAGES = [
  { name: 'public-home', path: '', waitFor: '[class*="gradient"]' },
];

async function ensureOutputDir() {
  const dirs = [
    CONFIG.outputDir,
    path.join(CONFIG.outputDir, 'desktop'),
    path.join(CONFIG.outputDir, 'mobile'),
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureScreenshot(
  page: Page,
  name: string,
  viewport: 'desktop' | 'mobile'
) {
  const filename = `${name}-${viewport}.png`;
  const filepath = path.join(CONFIG.outputDir, viewport, filename);

  await page.screenshot({
    path: filepath,
    fullPage: false,
    type: 'png'
  });

  console.log(`  ✓ Captured: ${filename}`);
}

async function login(page: Page) {
  console.log('\n🔐 Logging in...');

  await page.goto(`${CONFIG.baseUrl}/login`);
  await page.waitForLoadState('networkidle');

  // Fill login form
  await page.fill('input[type="email"], input[name="email"]', CONFIG.credentials.email);
  await page.fill('input[type="password"], input[name="password"]', CONFIG.credentials.password);

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard**', { timeout: 30000 });
  await wait(2000); // Wait for animations

  console.log('  ✓ Login successful');
}

async function captureDashboardPages(browser: Browser) {
  console.log('\n📊 CAPTURING DASHBOARD PAGES');
  console.log('=' .repeat(50));

  for (const viewport of ['desktop', 'mobile'] as const) {
    const vp = CONFIG.viewports[viewport];
    console.log(`\n📱 Viewport: ${viewport} (${vp.width}x${vp.height})`);

    const context = await browser.newContext({
      viewport: vp,
      deviceScaleFactor: viewport === 'mobile' ? 3 : 2,
    });

    const page = await context.newPage();

    // Login first
    await login(page);

    // Capture each page
    for (const pageInfo of DASHBOARD_PAGES) {
      console.log(`\n  📄 ${pageInfo.name}...`);

      try {
        await page.goto(`${CONFIG.baseUrl}${pageInfo.path}`, {
          waitUntil: 'networkidle',
          timeout: 30000
        });

        // Wait for content to load
        await wait(2000);

        // Try to wait for specific element
        try {
          await page.waitForSelector(pageInfo.waitFor, { timeout: 5000 });
        } catch {
          // Continue anyway
        }

        // Extra wait for animations
        await wait(1000);

        await captureScreenshot(page, pageInfo.name, viewport);
      } catch (error) {
        console.log(`  ✗ Failed to capture ${pageInfo.name}: ${error}`);
      }
    }

    await context.close();
  }
}

async function capturePublicPages(browser: Browser) {
  console.log('\n🌐 CAPTURING PUBLIC BOOKING PAGES');
  console.log('=' .repeat(50));

  for (const viewport of ['desktop', 'mobile'] as const) {
    const vp = CONFIG.viewports[viewport];
    console.log(`\n📱 Viewport: ${viewport} (${vp.width}x${vp.height})`);

    const context = await browser.newContext({
      viewport: vp,
      deviceScaleFactor: viewport === 'mobile' ? 3 : 2,
    });

    const page = await context.newPage();

    // Public booking page
    console.log(`\n  📄 Public booking page...`);

    try {
      await page.goto(`${CONFIG.baseUrl}/${CONFIG.publicSlug}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      await wait(3000);

      // Capture initial state (services selection)
      await captureScreenshot(page, 'public-services', viewport);

      // Try to click on a service to show the next step
      try {
        const serviceCard = page.locator('[class*="service"], [class*="card"]').first();
        if (await serviceCard.isVisible()) {
          await serviceCard.click();
          await wait(2000);
          await captureScreenshot(page, 'public-calendar', viewport);
        }
      } catch {
        console.log('  ⚠ Could not capture calendar step');
      }

    } catch (error) {
      console.log(`  ✗ Failed to capture public page: ${error}`);
    }

    await context.close();
  }
}

async function captureLandingPage(browser: Browser) {
  console.log('\n🏠 CAPTURING LANDING PAGE');
  console.log('=' .repeat(50));

  for (const viewport of ['desktop', 'mobile'] as const) {
    const vp = CONFIG.viewports[viewport];
    console.log(`\n📱 Viewport: ${viewport} (${vp.width}x${vp.height})`);

    const context = await browser.newContext({
      viewport: vp,
      deviceScaleFactor: viewport === 'mobile' ? 3 : 2,
    });

    const page = await context.newPage();

    try {
      await page.goto(CONFIG.baseUrl, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      await wait(3000);
      await captureScreenshot(page, 'landing-hero', viewport);

    } catch (error) {
      console.log(`  ✗ Failed to capture landing: ${error}`);
    }

    await context.close();
  }
}

async function main() {
  console.log('🚀 TurnoLink Screenshot Capture Script');
  console.log('=' .repeat(50));
  console.log(`Base URL: ${CONFIG.baseUrl}`);
  console.log(`Output: ${CONFIG.outputDir}`);

  await ensureOutputDir();

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    // Capture all pages
    await captureLandingPage(browser);
    await capturePublicPages(browser);
    await captureDashboardPages(browser);

    console.log('\n' + '=' .repeat(50));
    console.log('✅ ALL SCREENSHOTS CAPTURED SUCCESSFULLY!');
    console.log(`📁 Output directory: ${CONFIG.outputDir}`);

    // List captured files
    const desktopFiles = fs.readdirSync(path.join(CONFIG.outputDir, 'desktop'));
    const mobileFiles = fs.readdirSync(path.join(CONFIG.outputDir, 'mobile'));

    console.log(`\n📊 Desktop screenshots (${desktopFiles.length}):`);
    desktopFiles.forEach(f => console.log(`   - ${f}`));

    console.log(`\n📱 Mobile screenshots (${mobileFiles.length}):`);
    mobileFiles.forEach(f => console.log(`   - ${f}`));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

main();
