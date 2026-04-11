import { v4 as uuid } from 'uuid';
import sharp from 'sharp';
import { getSharedBrowser } from '../utils/browser-pool';
import { getOutputPath, getFileUrl, getFileSize } from '../utils/storage';

export interface HtmlRenderOptions {
  html: string;
  width: number;
  height: number;
  format?: 'png' | 'jpg' | 'webp';
  quality?: number;
  deviceScaleFactor?: number;
}

export interface HtmlRenderResult {
  outputPath: string;
  outputUrl: string;
  width: number;
  height: number;
  fileSize: number;
  format: string;
}

export async function renderHtmlToImage(
  options: HtmlRenderOptions,
  tenantId: string
): Promise<HtmlRenderResult> {
  const {
    html,
    width,
    height,
    format = 'png',
    quality = 90,
    deviceScaleFactor = 2,
  } = options;

  const br = await getSharedBrowser();
  const context = await br.newContext({
    viewport: { width, height },
    deviceScaleFactor,
  });

  try {
    const page = await context.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });

    const screenshotBuffer = await page.screenshot({ type: 'png' });

    const ext = format === 'jpg' ? 'jpg' : format;
    const filename = `${tenantId}-${uuid().slice(0, 8)}.${ext}`;
    const outputPath = getOutputPath('marketing' as any, filename);

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
      outputUrl: getFileUrl('marketing', filename),
      width: metadata.width || width,
      height: metadata.height || height,
      fileSize: getFileSize(outputPath),
      format,
    };
  } finally {
    await context.close();
  }
}
