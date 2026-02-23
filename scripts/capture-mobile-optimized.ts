import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const CONFIG = {
  baseUrl: 'https://turnolink.mubitt.com',
  publicSlug: 'bella-estetica',
  outputDir: path.join(__dirname, '../apps/web/public/screenshots/mobile'),
};

async function main() {
  console.log('📱 Capturing optimized mobile screenshot for iPhone mockup...\n');

  const browser = await chromium.launch({ headless: true });

  // iPhone 14 Pro viewport - pero con extra espacio arriba para compensar la isla
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
  });

  const page = await context.newPage();

  try {
    await page.goto(`${CONFIG.baseUrl}/${CONFIG.publicSlug}`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Esperar a que cargue
    await page.waitForTimeout(3000);

    // Ocultar el toggle de tema flotante si existe
    await page.evaluate(() => {
      // Buscar y ocultar el botón de toggle de tema flotante
      const themeToggles = document.querySelectorAll('[class*="theme"], [class*="toggle"], [aria-label*="tema"], [aria-label*="theme"]');
      themeToggles.forEach(el => {
        if (el instanceof HTMLElement &&
            (el.style.position === 'fixed' ||
             window.getComputedStyle(el).position === 'fixed' ||
             el.closest('[class*="float"]'))) {
          el.style.display = 'none';
        }
      });

      // También ocultar cualquier botón flotante en la esquina
      const floatingButtons = document.querySelectorAll('[class*="fixed"], [class*="Float"]');
      floatingButtons.forEach(el => {
        if (el instanceof HTMLElement) {
          const rect = el.getBoundingClientRect();
          // Si es un botón pequeño en las esquinas (probablemente toggle de tema)
          if (rect.width < 60 && rect.height < 60) {
            const classes = el.className.toLowerCase();
            if (classes.includes('theme') || classes.includes('toggle') || classes.includes('dark')) {
              el.style.display = 'none';
            }
          }
        }
      });
    });

    // Hacer un pequeño scroll para que el contenido se acomode mejor
    // considerando que la isla del iPhone tapa ~40px arriba
    await page.evaluate(() => {
      // Agregar padding-top al body para compensar la isla
      const header = document.querySelector('header') || document.querySelector('[class*="hero"]') || document.querySelector('[class*="header"]');
      if (header instanceof HTMLElement) {
        // El contenido ya debería tener padding, pero vamos a asegurarnos
        // de que no se tape información crítica
      }
    });

    await page.waitForTimeout(500);

    // Captura optimizada
    await page.screenshot({
      path: path.join(CONFIG.outputDir, 'public-mockup-optimized.png'),
      fullPage: false,
      type: 'png'
    });

    console.log('✓ Captured: public-mockup-optimized.png');

    // También capturar con un poco de scroll para ver el servicio completo
    await page.evaluate(() => window.scrollTo(0, 60));
    await page.waitForTimeout(300);

    await page.screenshot({
      path: path.join(CONFIG.outputDir, 'public-mockup-scrolled.png'),
      fullPage: false,
      type: 'png'
    });

    console.log('✓ Captured: public-mockup-scrolled.png');

    console.log('\n✅ Done! Converting to WebP...');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

main();
