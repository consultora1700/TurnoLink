import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { config } from '../config';
import { getOutputPath, getFileUrl, getFileSize } from '../utils/storage';
import { PrismaClient } from '../prisma';

const prisma = new PrismaClient();

export interface MockupOptions {
  screenshotPath?: string;
  screenshotUrl?: string;
  screenshotBuffer?: Buffer;
  deviceFrameId: string;
  tenantId: string;
  background?: {
    type: 'solid' | 'gradient' | 'transparent';
    color?: string;
    gradientStart?: string;
    gradientEnd?: string;
  };
  shadow?: boolean;
  scale?: number;
  outputWidth?: number;
  outputHeight?: number;
  format?: 'png' | 'jpg' | 'webp';
  quality?: number;
}

export interface MockupResult {
  outputPath: string;
  outputUrl: string;
  width: number;
  height: number;
  fileSize: number;
  format: string;
}

export async function generateMockup(options: MockupOptions): Promise<MockupResult> {
  const {
    deviceFrameId,
    tenantId,
    background = { type: 'transparent' },
    shadow = true,
    scale = 1,
    format = 'png',
    quality = 90,
  } = options;

  // Get device frame info
  const frame = await prisma.deviceFrame.findUnique({ where: { id: deviceFrameId } });
  if (!frame) {
    throw new Error(`Device frame "${deviceFrameId}" not found`);
  }

  // Get screenshot buffer
  let screenshotBuffer: Buffer;
  if (options.screenshotBuffer) {
    screenshotBuffer = options.screenshotBuffer;
  } else if (options.screenshotPath) {
    screenshotBuffer = fs.readFileSync(options.screenshotPath);
  } else {
    throw new Error('No screenshot source provided');
  }

  // Resize screenshot to fit the device screen area
  const resizedScreenshot = await sharp(screenshotBuffer)
    .resize(frame.screenW, frame.screenH, { fit: 'cover' })
    .toBuffer();

  // Apply corner radius if needed
  let maskedScreenshot = resizedScreenshot;
  if (frame.cornerRadius > 0) {
    const mask = Buffer.from(
      `<svg width="${frame.screenW}" height="${frame.screenH}">
        <rect x="0" y="0" width="${frame.screenW}" height="${frame.screenH}"
              rx="${frame.cornerRadius}" ry="${frame.cornerRadius}" fill="white"/>
      </svg>`
    );
    maskedScreenshot = await sharp(resizedScreenshot)
      .composite([{ input: mask, blend: 'dest-in' }])
      .toBuffer();
  }

  // Load device frame
  const frameMeta = await sharp(frame.framePath).metadata();
  const frameWidth = frameMeta.width || 800;
  const frameHeight = frameMeta.height || 1000;

  // Create background
  let baseImage: sharp.Sharp;
  const outputW = options.outputWidth || Math.round(frameWidth * scale + 100);
  const outputH = options.outputHeight || Math.round(frameHeight * scale + 100);

  if (background.type === 'solid' && background.color) {
    baseImage = sharp({
      create: {
        width: outputW,
        height: outputH,
        channels: 4,
        background: background.color,
      },
    });
  } else if (background.type === 'transparent') {
    baseImage = sharp({
      create: {
        width: outputW,
        height: outputH,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    });
  } else {
    baseImage = sharp({
      create: {
        width: outputW,
        height: outputH,
        channels: 4,
        background: background.gradientStart || '#ffffff',
      },
    });
  }

  // Scale the device frame
  const scaledFrameW = Math.round(frameWidth * scale);
  const scaledFrameH = Math.round(frameHeight * scale);
  const scaledFrame = await sharp(frame.framePath)
    .resize(scaledFrameW, scaledFrameH)
    .toBuffer();

  // Scale screen position
  const scaledScreenX = Math.round(frame.screenX * scale);
  const scaledScreenY = Math.round(frame.screenY * scale);
  const scaledScreenW = Math.round(frame.screenW * scale);
  const scaledScreenH = Math.round(frame.screenH * scale);

  // Resize screenshot to scaled dimensions
  const scaledScreenshot = await sharp(maskedScreenshot)
    .resize(scaledScreenW, scaledScreenH, { fit: 'fill' })
    .toBuffer();

  // Center the frame on the background
  const frameLeft = Math.round((outputW - scaledFrameW) / 2);
  const frameTop = Math.round((outputH - scaledFrameH) / 2);

  // Compose: background + screenshot + frame
  const composites: sharp.OverlayOptions[] = [
    {
      input: scaledScreenshot,
      left: frameLeft + scaledScreenX,
      top: frameTop + scaledScreenY,
    },
    {
      input: scaledFrame,
      left: frameLeft,
      top: frameTop,
    },
  ];

  const filename = `${tenantId}-mockup-${uuid().slice(0, 8)}.${format}`;
  const outputPath = getOutputPath('mockups', filename);

  let pipeline = baseImage.composite(composites);

  switch (format) {
    case 'jpg':
      pipeline = pipeline.jpeg({ quality });
      break;
    case 'webp':
      pipeline = pipeline.webp({ quality });
      break;
    default:
      pipeline = pipeline.png();
  }

  await pipeline.toFile(outputPath);

  const outputMeta = await sharp(outputPath).metadata();

  return {
    outputPath,
    outputUrl: getFileUrl('mockups', filename),
    width: outputMeta.width || outputW,
    height: outputMeta.height || outputH,
    fileSize: getFileSize(outputPath),
    format,
  };
}

export async function getDeviceFrames() {
  return prisma.deviceFrame.findMany({
    orderBy: { category: 'asc' },
  });
}
