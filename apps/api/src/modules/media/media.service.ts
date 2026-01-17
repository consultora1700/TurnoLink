import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class MediaService {
  private readonly uploadDir: string;
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch {
      // Directory already exists
    }
  }

  async upload(
    tenantId: string,
    file: Express.Multer.File,
    folder = 'general',
  ) {
    // Validate file
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only images are allowed');
    }

    // Generate unique filename
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const folderPath = path.join(this.uploadDir, tenantId, folder);
    const filePath = path.join(folderPath, filename);

    // Ensure tenant folder exists
    await fs.mkdir(folderPath, { recursive: true });

    // Process and save image
    try {
      await sharp(file.buffer)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toFile(filePath);
    } catch {
      throw new BadRequestException('Error processing image');
    }

    // Get file info
    const stats = await fs.stat(filePath);

    // Generate URL (in production, this would be S3/CDN URL)
    const baseUrl = this.configService.get<string>('API_URL') || 'http://localhost:3001';
    const url = `${baseUrl}/uploads/${tenantId}/${folder}/${filename}`;

    // Save to database
    const media = await this.prisma.media.create({
      data: {
        tenantId,
        filename,
        originalName: file.originalname,
        mimeType: 'image/jpeg',
        size: stats.size,
        url,
        folder,
      },
    });

    return media;
  }

  async findAll(tenantId: string, folder?: string) {
    const where: Record<string, unknown> = { tenantId };
    if (folder) {
      where.folder = folder;
    }

    return this.prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(tenantId: string, id: string) {
    const media = await this.prisma.media.findFirst({
      where: { id, tenantId },
    });

    if (!media) {
      throw new BadRequestException('Media not found');
    }

    // Delete file from disk
    const filePath = path.join(
      this.uploadDir,
      tenantId,
      media.folder || 'general',
      media.filename,
    );

    try {
      await fs.unlink(filePath);
    } catch {
      // File might not exist
    }

    // Delete from database
    return this.prisma.media.delete({ where: { id } });
  }

  // For S3 upload (production)
  async uploadToS3(
    _tenantId: string,
    _file: Express.Multer.File,
    _folder = 'general',
  ) {
    // TODO: Implement S3 upload
    // const s3 = new S3Client({ ... });
    // const command = new PutObjectCommand({ ... });
    // await s3.send(command);
    throw new BadRequestException('S3 upload not implemented');
  }
}
