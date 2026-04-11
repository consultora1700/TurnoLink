import { PrismaClient } from '../prisma';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

const prisma = new PrismaClient();

interface DeviceFrameData {
  name: string;
  category: string;
  width: number;
  height: number;
  screenX: number;
  screenY: number;
  screenW: number;
  screenH: number;
  cornerRadius: number;
  color: string; // Color of the frame for generation
}

const DEVICES: DeviceFrameData[] = [
  {
    name: 'iPhone 15 Pro',
    category: 'phone',
    width: 440,
    height: 882,
    screenX: 20,
    screenY: 20,
    screenW: 400,
    screenH: 842,
    cornerRadius: 40,
    color: '#1a1a1a',
  },
  {
    name: 'MacBook Air',
    category: 'laptop',
    width: 1200,
    height: 780,
    screenX: 130,
    screenY: 40,
    screenW: 940,
    screenH: 590,
    cornerRadius: 8,
    color: '#c0c0c0',
  },
  {
    name: 'iPad Pro',
    category: 'tablet',
    width: 640,
    height: 880,
    screenX: 30,
    screenY: 40,
    screenW: 580,
    screenH: 800,
    cornerRadius: 20,
    color: '#2d2d2d',
  },
  {
    name: 'Galaxy S24',
    category: 'phone',
    width: 420,
    height: 870,
    screenX: 16,
    screenY: 16,
    screenW: 388,
    screenH: 838,
    cornerRadius: 36,
    color: '#1a1a2e',
  },
  {
    name: 'Monitor generico',
    category: 'desktop',
    width: 1100,
    height: 720,
    screenX: 50,
    screenY: 40,
    screenW: 1000,
    screenH: 580,
    cornerRadius: 4,
    color: '#333333',
  },
];

function generateDeviceFrameSVG(device: DeviceFrameData): string {
  const { width, height, screenX, screenY, screenW, screenH, cornerRadius, color, category } = device;
  const screenRx = Math.max(cornerRadius - 4, 0);

  // Use SVG mask to create a transparent cutout for the screen area.
  // White = visible, Black = transparent hole
  const screenMask = `
    <defs>
      <mask id="screen-mask">
        <rect width="${width}" height="${height}" fill="white"/>
        <rect x="${screenX}" y="${screenY}" width="${screenW}" height="${screenH}" rx="${screenRx}" ry="${screenRx}" fill="black"/>
      </mask>
    </defs>`;

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  svg += screenMask;

  if (category === 'phone') {
    svg += `
      <g mask="url(#screen-mask)">
        <rect x="0" y="0" width="${width}" height="${height}" rx="${cornerRadius + 4}" ry="${cornerRadius + 4}" fill="${color}"/>
        <rect x="2" y="2" width="${width - 4}" height="${height - 4}" rx="${cornerRadius + 2}" ry="${cornerRadius + 2}" fill="${color}" stroke="#555" stroke-width="1"/>
      </g>
      <!-- Dynamic Island -->
      <rect x="${width / 2 - 40}" y="12" width="80" height="20" rx="10" fill="#000"/>
    `;
  } else if (category === 'laptop') {
    svg += `
      <g mask="url(#screen-mask)">
        <rect x="100" y="0" width="${width - 200}" height="${height - 80}" rx="12" fill="${color}"/>
      </g>
      <!-- Camera -->
      <circle cx="${width / 2}" cy="20" r="4" fill="#444"/>
      <!-- Base -->
      <path d="M 0 ${height - 80} Q 0 ${height - 60} 30 ${height - 60} L ${width - 30} ${height - 60} Q ${width} ${height - 60} ${width} ${height - 40} L ${width} ${height - 20} Q ${width} ${height} ${width - 20} ${height} L 20 ${height} Q 0 ${height} 0 ${height - 20} Z" fill="${color}"/>
      <!-- Trackpad line -->
      <rect x="${width / 2 - 80}" y="${height - 55}" width="160" height="4" rx="2" fill="#999" opacity="0.5"/>
    `;
  } else if (category === 'tablet') {
    svg += `
      <g mask="url(#screen-mask)">
        <rect x="0" y="0" width="${width}" height="${height}" rx="${cornerRadius + 8}" ry="${cornerRadius + 8}" fill="${color}"/>
      </g>
      <!-- Camera -->
      <circle cx="${width / 2}" cy="20" r="4" fill="#444"/>
    `;
  } else {
    // Desktop monitor
    svg += `
      <g mask="url(#screen-mask)">
        <rect x="0" y="0" width="${width}" height="${height - 100}" rx="12" fill="${color}"/>
      </g>
      <!-- Bezel bottom -->
      <rect x="0" y="${height - 140}" width="${width}" height="40" rx="0" fill="${color}"/>
      <!-- Stand neck -->
      <rect x="${width / 2 - 40}" y="${height - 100}" width="80" height="60" fill="#555"/>
      <!-- Stand base -->
      <ellipse cx="${width / 2}" cy="${height - 20}" rx="140" ry="22" fill="#444"/>
    `;
  }

  svg += '</svg>';
  return svg;
}

export async function seedDeviceFrames() {
  console.log('Seeding device frames...');

  const framesDir = config.paths.deviceFrames;
  if (!fs.existsSync(framesDir)) {
    fs.mkdirSync(framesDir, { recursive: true });
  }

  for (const device of DEVICES) {
    const framePath = path.join(framesDir, `${device.name.toLowerCase().replace(/\s+/g, '-')}.png`);

    // Always regenerate PNG (SVG may have changed)
    const svg = generateDeviceFrameSVG(device);
    await sharp(Buffer.from(svg))
      .png()
      .toFile(framePath);

    const existing = await prisma.deviceFrame.findFirst({
      where: { name: device.name },
    });

    if (existing) {
      await prisma.deviceFrame.update({
        where: { id: existing.id },
        data: {
          framePath,
          screenX: device.screenX,
          screenY: device.screenY,
          screenW: device.screenW,
          screenH: device.screenH,
          cornerRadius: device.cornerRadius,
        },
      });
      console.log(`  Updated "${device.name}"`);
    } else {
      await prisma.deviceFrame.create({
        data: {
          name: device.name,
          category: device.category,
          framePath,
          screenX: device.screenX,
          screenY: device.screenY,
          screenW: device.screenW,
          screenH: device.screenH,
          cornerRadius: device.cornerRadius,
        },
      });
      console.log(`  Created "${device.name}"`);
    }
  }

  console.log('Device frames seeded');
}
