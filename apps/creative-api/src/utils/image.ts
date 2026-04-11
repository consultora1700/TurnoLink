import sharp from 'sharp';

export interface ResizeOptions {
  width: number;
  height: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  background?: string;
}

export async function resizeImage(
  input: Buffer | string,
  options: ResizeOptions
): Promise<Buffer> {
  return sharp(input)
    .resize(options.width, options.height, {
      fit: options.fit || 'cover',
      background: options.background || '#ffffff',
    })
    .toBuffer();
}

export async function convertFormat(
  input: Buffer | string,
  format: 'png' | 'jpg' | 'webp',
  quality: number = 90
): Promise<Buffer> {
  let pipeline = sharp(input);

  switch (format) {
    case 'png':
      pipeline = pipeline.png({ quality: Math.min(quality, 100) });
      break;
    case 'jpg':
      pipeline = pipeline.jpeg({ quality });
      break;
    case 'webp':
      pipeline = pipeline.webp({ quality });
      break;
  }

  return pipeline.toBuffer();
}

export async function getImageMetadata(input: Buffer | string) {
  return sharp(input).metadata();
}

export async function compositeImages(
  base: Buffer | string,
  overlays: Array<{
    input: Buffer | string;
    left: number;
    top: number;
    width?: number;
    height?: number;
  }>
): Promise<Buffer> {
  const composites = await Promise.all(
    overlays.map(async (overlay) => {
      let input: Buffer;
      if (typeof overlay.input === 'string') {
        input = await sharp(overlay.input).toBuffer();
      } else {
        input = overlay.input;
      }

      if (overlay.width && overlay.height) {
        input = await sharp(input)
          .resize(overlay.width, overlay.height, { fit: 'fill' })
          .toBuffer();
      }

      return {
        input,
        left: overlay.left,
        top: overlay.top,
      };
    })
  );

  return sharp(base).composite(composites).toBuffer();
}
