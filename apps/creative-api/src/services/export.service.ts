import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import archiver from 'archiver';
import { PrismaClient } from '../prisma';
import { config } from '../config';
import { getOutputPath, getFileUrl, getFileSize, ensureDir } from '../utils/storage';

const prisma = new PrismaClient();

export interface ExportOptions {
  creativeId: string;
  format: 'png' | 'jpg' | 'webp' | 'pdf';
  width?: number;
  height?: number;
  quality?: number;
}

export interface ExportResult {
  id: string;
  outputPath: string;
  outputUrl: string;
  width: number;
  height: number;
  fileSize: number;
  format: string;
}

export async function exportCreative(options: ExportOptions): Promise<ExportResult> {
  const creative = await prisma.creative.findUnique({
    where: { id: options.creativeId },
  });

  if (!creative) throw new Error('Creative not found');
  if (!creative.outputPath || !fs.existsSync(creative.outputPath)) {
    throw new Error('Creative output file not found');
  }

  const { format, quality = 90 } = options;
  const filename = `${creative.tenantId}-export-${uuid().slice(0, 8)}.${format}`;
  const outputPath = getOutputPath('exports', filename);

  let pipeline = sharp(creative.outputPath);

  // Resize if specified
  if (options.width || options.height) {
    pipeline = pipeline.resize(options.width, options.height, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    });
  }

  // Convert format
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
    case 'pdf':
      // For PDF we just save as PNG (proper PDF generation would need a dedicated lib)
      pipeline = pipeline.png();
      break;
  }

  await pipeline.toFile(outputPath);

  const metadata = await sharp(outputPath).metadata();
  const fileSize = getFileSize(outputPath);

  // Save export record
  const exportRecord = await prisma.export.create({
    data: {
      creativeId: creative.id,
      format,
      width: metadata.width || options.width || creative.width || 0,
      height: metadata.height || options.height || creative.height || 0,
      quality,
      outputPath,
      status: 'completed',
    },
  });

  return {
    id: exportRecord.id,
    outputPath,
    outputUrl: getFileUrl('exports', filename),
    width: metadata.width || 0,
    height: metadata.height || 0,
    fileSize,
    format,
  };
}

export async function batchExport(
  creativeId: string,
  formats: Array<{ format: 'png' | 'jpg' | 'webp'; width?: number; height?: number; quality?: number }>
): Promise<{ zipPath: string; zipUrl: string; exports: ExportResult[] }> {
  const results: ExportResult[] = [];

  for (const fmt of formats) {
    const result = await exportCreative({
      creativeId,
      format: fmt.format,
      width: fmt.width,
      height: fmt.height,
      quality: fmt.quality,
    });
    results.push(result);
  }

  // Create ZIP
  const zipFilename = `batch-${uuid().slice(0, 8)}.zip`;
  const zipPath = getOutputPath('exports', zipFilename);

  await createZip(
    results.map((r) => r.outputPath),
    zipPath
  );

  return {
    zipPath,
    zipUrl: getFileUrl('exports', zipFilename),
    exports: results,
  };
}

function createZip(filePaths: string[], outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve());
    archive.on('error', reject);

    archive.pipe(output);

    for (const filePath of filePaths) {
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: path.basename(filePath) });
      }
    }

    archive.finalize();
  });
}

export async function getExportById(id: string) {
  return prisma.export.findUnique({
    where: { id },
    include: { creative: true },
  });
}
