import { createCanvas, loadImage } from 'canvas';
type Ctx = ReturnType<ReturnType<typeof createCanvas>['getContext']>;
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { config } from '../config';
import { getOutputPath, getFileUrl, getFileSize } from '../utils/storage';

export interface KonvaLayer {
  type: string; // 'text', 'rect', 'circle', 'image', 'group'
  attrs: Record<string, any>;
  children?: KonvaLayer[];
}

export interface CompositionData {
  width: number;
  height: number;
  backgroundColor?: string;
  layers: KonvaLayer[];
}

export interface CompositionResult {
  outputPath: string;
  outputUrl: string;
  width: number;
  height: number;
  fileSize: number;
  format: string;
}

// Cache for URL-fetched images
const imageCache = new Map<string, Buffer>();

async function fetchImageBuffer(url: string): Promise<Buffer> {
  if (imageCache.has(url)) {
    return imageCache.get(url)!;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${url}`);
  const arrayBuf = await res.arrayBuffer();
  const buf = Buffer.from(arrayBuf);
  imageCache.set(url, buf);
  // Evict old entries if cache grows too large
  if (imageCache.size > 50) {
    const firstKey = imageCache.keys().next().value;
    if (firstKey) imageCache.delete(firstKey);
  }
  return buf;
}

export async function renderComposition(
  data: CompositionData,
  tenantId: string,
  format: 'png' | 'jpg' | 'webp' = 'png',
  quality: number = 90
): Promise<CompositionResult> {
  const { width, height, backgroundColor } = data;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fill background
  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }

  // Render each layer
  for (const layer of data.layers) {
    await renderNode(ctx, layer, width, height);
  }

  // Export to buffer
  const buffer = canvas.toBuffer('image/png');

  const filename = `${tenantId}-comp-${uuid().slice(0, 8)}.${format}`;
  const outputPath = getOutputPath('compositions', filename);

  let pipeline = sharp(buffer);
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

  return {
    outputPath,
    outputUrl: getFileUrl('compositions', filename),
    width,
    height,
    fileSize: getFileSize(outputPath),
    format,
  };
}

async function renderNode(
  ctx: Ctx,
  node: KonvaLayer,
  canvasWidth?: number,
  canvasHeight?: number
): Promise<void> {
  const { type, attrs, children } = node;

  ctx.save();

  // Apply transforms
  if (attrs.x || attrs.y) {
    ctx.translate(attrs.x || 0, attrs.y || 0);
  }
  if (attrs.rotation) {
    ctx.rotate((attrs.rotation * Math.PI) / 180);
  }
  if (attrs.scaleX || attrs.scaleY) {
    ctx.scale(attrs.scaleX || 1, attrs.scaleY || 1);
  }
  if (attrs.opacity !== undefined) {
    ctx.globalAlpha = attrs.opacity;
  }

  // Apply shadows
  if (attrs.shadowColor) {
    ctx.shadowColor = attrs.shadowColor;
    ctx.shadowBlur = attrs.shadowBlur || 0;
    ctx.shadowOffsetX = attrs.shadowOffsetX || 0;
    ctx.shadowOffsetY = attrs.shadowOffsetY || 0;
  }

  switch (type) {
    case 'rect':
      await renderRect(ctx, attrs);
      break;

    case 'circle':
      renderCircle(ctx, attrs);
      break;

    case 'text':
      renderText(ctx, attrs);
      break;

    case 'image':
      await renderImage(ctx, attrs);
      break;

    case 'group':
    case 'layer':
      // Container — just render children
      break;
  }

  // Reset shadows before rendering children
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Render children
  if (children) {
    for (const child of children) {
      await renderNode(ctx, child, canvasWidth, canvasHeight);
    }
  }

  ctx.restore();
}

async function renderRect(ctx: Ctx, attrs: Record<string, any>): Promise<void> {
  const w = attrs.width || 100;
  const h = attrs.height || 100;
  const r = attrs.cornerRadius || 0;

  // Determine fill style (solid or gradient)
  let fillStyle: any = attrs.fill || '#000000';

  if (attrs.fillLinearGradient) {
    const g = attrs.fillLinearGradient;
    const gradient = ctx.createLinearGradient(
      g.start?.x ?? 0,
      g.start?.y ?? 0,
      g.end?.x ?? w,
      g.end?.y ?? h
    );
    const stops: Array<{ offset: number; color: string }> = g.colorStops || [];
    for (const stop of stops) {
      gradient.addColorStop(stop.offset, stop.color);
    }
    fillStyle = gradient;
  }

  if (r > 0) {
    roundRect(ctx, 0, 0, w, h, r);
    ctx.fillStyle = fillStyle;
    ctx.fill();
  } else {
    ctx.fillStyle = fillStyle;
    ctx.fillRect(0, 0, w, h);
  }

  if (attrs.stroke) {
    ctx.strokeStyle = attrs.stroke;
    ctx.lineWidth = attrs.strokeWidth || 1;
    if (r > 0) {
      roundRect(ctx, 0, 0, w, h, r);
      ctx.stroke();
    } else {
      ctx.strokeRect(0, 0, w, h);
    }
  }
}

function renderCircle(ctx: Ctx, attrs: Record<string, any>): void {
  const radius = attrs.radius || 50;
  let fillStyle: any = attrs.fill || '#000000';

  if (attrs.fillRadialGradient) {
    const g = attrs.fillRadialGradient;
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    const stops: Array<{ offset: number; color: string }> = g.colorStops || [];
    for (const stop of stops) {
      gradient.addColorStop(stop.offset, stop.color);
    }
    fillStyle = gradient;
  }

  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  if (attrs.stroke) {
    ctx.strokeStyle = attrs.stroke;
    ctx.lineWidth = attrs.strokeWidth || 1;
    ctx.stroke();
  }
}

function renderText(ctx: Ctx, attrs: Record<string, any>): void {
  const fontSize = attrs.fontSize || 16;
  const fontFamily = attrs.fontFamily || 'Arial';
  const fontWeight = attrs.fontWeight || (attrs.fontStyle === 'bold' ? 'bold' : 'normal');
  const fontStyle = (attrs.fontStyle === 'italic' || attrs.fontStyle === 'bold italic') ? 'italic' : 'normal';

  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = attrs.fill || '#000000';
  ctx.textAlign = attrs.align || 'left';

  const text = attrs.text || '';
  const lineHeight = attrs.lineHeight || 1.2;
  const maxWidth = attrs.width || undefined;

  // Split by explicit newlines first, then word-wrap each line
  const explicitLines = text.split('\n');
  const allLines: string[] = [];

  for (const line of explicitLines) {
    if (maxWidth && maxWidth > 0) {
      const wrapped = wrapText(ctx, line, maxWidth);
      allLines.push(...wrapped);
    } else {
      allLines.push(line);
    }
  }

  // Text shadow
  if (attrs.textShadowColor) {
    ctx.save();
    ctx.shadowColor = attrs.textShadowColor;
    ctx.shadowBlur = attrs.textShadowBlur || 4;
    ctx.shadowOffsetX = attrs.textShadowOffsetX || 0;
    ctx.shadowOffsetY = attrs.textShadowOffsetY || 2;
  }

  allLines.forEach((line: string, i: number) => {
    const yOffset = fontSize + i * fontSize * lineHeight;
    ctx.fillText(line, 0, yOffset);
  });

  if (attrs.textShadowColor) {
    ctx.restore();
  }
}

function wrapText(ctx: Ctx, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [''];
}

async function renderImage(ctx: Ctx, attrs: Record<string, any>): Promise<void> {
  let imgBuffer: Buffer | null = null;

  // Load from URL or file path
  if (attrs.imageUrl) {
    try {
      imgBuffer = await fetchImageBuffer(attrs.imageUrl);
    } catch (e) {
      console.error('Failed to load image from URL:', attrs.imageUrl);
      return;
    }
  } else if (attrs.imageSrc) {
    try {
      imgBuffer = fs.readFileSync(attrs.imageSrc);
    } catch (e) {
      console.error('Failed to load image from file:', attrs.imageSrc);
      return;
    }
  }

  if (!imgBuffer) return;

  try {
    const w = attrs.width || undefined;
    const h = attrs.height || undefined;
    const resized = await sharp(imgBuffer)
      .resize(w, h, { fit: attrs.fit || 'cover' })
      .toBuffer();

    const image = await loadImage(resized);
    const drawW = attrs.width || image.width;
    const drawH = attrs.height || image.height;

    // Clip with corner radius if needed
    if (attrs.cornerRadius) {
      ctx.save();
      roundRect(ctx, 0, 0, drawW, drawH, attrs.cornerRadius);
      ctx.clip();
      ctx.drawImage(image, 0, 0, drawW, drawH);
      ctx.restore();
    } else {
      ctx.drawImage(image, 0, 0, drawW, drawH);
    }
  } catch (e) {
    console.error('Failed to process image:', e);
  }
}

function roundRect(
  ctx: Ctx,
  x: number, y: number, w: number, h: number, r: number
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
