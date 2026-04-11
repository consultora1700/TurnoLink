import { Page } from 'playwright';
import path from 'path';
import { v4 as uuid } from 'uuid';
import sharp from 'sharp';
import { config } from '../config';
import { getOutputPath, getFileUrl, getFileSize } from '../utils/storage';
import { getSharedBrowser, closeSharedBrowser } from '../utils/browser-pool';

export interface ScreenshotOptions {
  url: string;
  tenantId: string;
  viewport?: { width: number; height: number };
  fullPage?: boolean;
  selector?: string;
  waitTime?: number;
  format?: 'png' | 'jpg' | 'webp';
  quality?: number;
  deviceScaleFactor?: number;
}

export interface ScreenshotResult {
  outputPath: string;
  outputUrl: string;
  width: number;
  height: number;
  fileSize: number;
  format: string;
}

export async function takeScreenshot(options: ScreenshotOptions): Promise<ScreenshotResult> {
  const {
    url,
    tenantId,
    viewport = { width: 1440, height: 900 },
    fullPage = false,
    selector,
    waitTime = 2000,
    format = 'png',
    quality = 90,
    deviceScaleFactor = 2,
  } = options;

  const br = await getSharedBrowser();
  const context = await br.newContext({
    viewport,
    deviceScaleFactor,
  });

  const page: Page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Scroll incrementally to trigger lazy-loaded images
    if (fullPage) {
      await page.evaluate(`(async () => {
        const delay = (ms) => new Promise(r => setTimeout(r, ms));
        const height = document.body.scrollHeight;
        const step = window.innerHeight;
        for (let y = 0; y < height; y += step) {
          window.scrollTo(0, y);
          await delay(300);
        }
        window.scrollTo(0, 0);
        await delay(500);
      })()`);
      await page.waitForLoadState('networkidle');
    }

    if (waitTime > 0) {
      await page.waitForTimeout(Math.min(waitTime, 10000));
    }

    const filename = `${tenantId}-${uuid().slice(0, 8)}.${format}`;
    const outputPath = getOutputPath('screenshots', filename);

    let screenshotBuffer: Buffer;

    if (selector) {
      const element = await page.$(selector);
      if (!element) {
        throw new Error(`Selector "${selector}" not found on page`);
      }
      screenshotBuffer = await element.screenshot({ type: format === 'jpg' ? 'jpeg' : 'png' });
    } else {
      screenshotBuffer = await page.screenshot({
        fullPage,
        type: format === 'jpg' ? 'jpeg' : 'png',
      });
    }

    // Convert format if needed
    let pipeline = sharp(screenshotBuffer);
    switch (format) {
      case 'jpg':
        pipeline = pipeline.jpeg({ quality });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality });
        break;
      case 'png':
        pipeline = pipeline.png();
        break;
    }

    await pipeline.toFile(outputPath);

    const metadata = await sharp(outputPath).metadata();

    return {
      outputPath,
      outputUrl: getFileUrl('screenshots', filename),
      width: metadata.width || viewport.width,
      height: metadata.height || viewport.height,
      fileSize: getFileSize(outputPath),
      format,
    };
  } finally {
    await context.close();
  }
}

export async function closeBrowser(): Promise<void> {
  await closeSharedBrowser();
}
