import sharp from 'sharp';

export interface EffectOptions {
  blur?: number; // sigma
  brightness?: number; // multiplier, 1.0 = no change
  contrast?: number; // multiplier, 1.0 = no change
  saturation?: number; // multiplier, 1.0 = no change
  tint?: string; // hex color
  grayscale?: boolean;
  sepia?: boolean;
  sharpen?: boolean;
  negate?: boolean;
}

export async function applyEffects(
  input: Buffer | string,
  effects: EffectOptions
): Promise<Buffer> {
  let pipeline = sharp(input);

  if (effects.grayscale) {
    pipeline = pipeline.grayscale();
  }

  if (effects.blur && effects.blur > 0) {
    pipeline = pipeline.blur(Math.max(0.3, effects.blur));
  }

  if (effects.sharpen) {
    pipeline = pipeline.sharpen();
  }

  if (effects.negate) {
    pipeline = pipeline.negate();
  }

  if (effects.tint) {
    const rgb = hexToRgb(effects.tint);
    if (rgb) {
      pipeline = pipeline.tint(rgb);
    }
  }

  if (effects.brightness !== undefined || effects.contrast !== undefined || effects.saturation !== undefined) {
    pipeline = pipeline.modulate({
      brightness: effects.brightness,
      saturation: effects.saturation,
    });
    if (effects.contrast !== undefined) {
      pipeline = pipeline.linear(effects.contrast, -(128 * (effects.contrast - 1)));
    }
  }

  if (effects.sepia) {
    // Sepia: grayscale + warm tint
    pipeline = pipeline.grayscale().tint({ r: 112, g: 66, b: 20 });
  }

  return pipeline.toBuffer();
}

export async function addTextOverlay(
  input: Buffer | string,
  text: string,
  options: {
    x?: number;
    y?: number;
    fontSize?: number;
    color?: string;
    fontFamily?: string;
    gravity?: 'northwest' | 'north' | 'northeast' | 'west' | 'center' | 'east' | 'southwest' | 'south' | 'southeast';
  } = {}
): Promise<Buffer> {
  const {
    fontSize = 32,
    color = '#ffffff',
    fontFamily = 'Arial',
    gravity = 'center',
  } = options;

  const metadata = await sharp(input).metadata();
  const imgW = metadata.width || 800;
  const imgH = metadata.height || 600;

  const svgText = `
    <svg width="${imgW}" height="${imgH}">
      <text
        x="${options.x || imgW / 2}"
        y="${options.y || imgH / 2}"
        font-family="${fontFamily}"
        font-size="${fontSize}"
        fill="${color}"
        text-anchor="middle"
        dominant-baseline="middle"
      >${escapeXml(text)}</text>
    </svg>`;

  return sharp(input)
    .composite([{ input: Buffer.from(svgText), gravity }])
    .toBuffer();
}

export async function addWatermark(
  input: Buffer | string,
  watermarkPath: string,
  options: {
    opacity?: number;
    gravity?: 'southeast' | 'southwest' | 'northeast' | 'northwest' | 'center';
    scale?: number;
  } = {}
): Promise<Buffer> {
  const { opacity = 0.3, gravity = 'southeast', scale = 0.15 } = options;

  const metadata = await sharp(input).metadata();
  const imgW = metadata.width || 800;
  const wmWidth = Math.round(imgW * scale);

  const watermark = await sharp(watermarkPath)
    .resize(wmWidth)
    .ensureAlpha()
    .composite([{
      input: Buffer.from([255, 255, 255, Math.round(opacity * 255)]),
      raw: { width: 1, height: 1, channels: 4 },
      tile: true,
      blend: 'dest-in',
    }])
    .toBuffer();

  return sharp(input)
    .composite([{ input: watermark, gravity }])
    .toBuffer();
}

export async function addBorder(
  input: Buffer | string,
  options: {
    width?: number;
    color?: string;
    radius?: number;
  } = {}
): Promise<Buffer> {
  const { width: borderWidth = 4, color = '#000000' } = options;

  return sharp(input)
    .extend({
      top: borderWidth,
      bottom: borderWidth,
      left: borderWidth,
      right: borderWidth,
      background: color,
    })
    .toBuffer();
}

export async function addDropShadow(
  input: Buffer | string,
  options: {
    offsetX?: number;
    offsetY?: number;
    blur?: number;
    color?: string;
  } = {}
): Promise<Buffer> {
  const { offsetX = 5, offsetY = 5, blur = 10, color = '#00000066' } = options;

  const metadata = await sharp(input).metadata();
  const imgW = metadata.width || 800;
  const imgH = metadata.height || 600;

  const padding = Math.max(offsetX, offsetY) + blur * 2;

  // Create shadow (silhouette of image blurred)
  const shadow = await sharp(input)
    .ensureAlpha()
    .extractChannel(3) // alpha channel
    .toBuffer();

  const shadowLayer = await sharp({
    create: {
      width: imgW + padding * 2,
      height: imgH + padding * 2,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: await sharp(input)
          .tint(hexToRgb(color.slice(0, 7)) || { r: 0, g: 0, b: 0 })
          .blur(Math.max(0.3, blur))
          .toBuffer(),
        left: padding + offsetX,
        top: padding + offsetY,
      },
      {
        input: await sharp(input).toBuffer(),
        left: padding,
        top: padding,
      },
    ])
    .toBuffer();

  return shadowLayer;
}

export async function createGradientBackground(
  width: number,
  height: number,
  startColor: string,
  endColor: string,
  direction: 'horizontal' | 'vertical' | 'diagonal' = 'vertical'
): Promise<Buffer> {
  let x1 = 0, y1 = 0, x2 = 0, y2 = height;
  if (direction === 'horizontal') {
    x2 = width; y2 = 0;
  } else if (direction === 'diagonal') {
    x2 = width; y2 = height;
  }

  const svg = `
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="grad" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" gradientUnits="userSpaceOnUse">
          <stop offset="0%" style="stop-color:${startColor}"/>
          <stop offset="100%" style="stop-color:${endColor}"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)"/>
    </svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
