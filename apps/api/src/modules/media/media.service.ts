import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs/promises';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly uploadDir: string;
  private readonly maxFileSize = 50 * 1024 * 1024; // 50MB — original nunca se guarda, Sharp comprime a ~200-400KB WebP
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
  ];
  private s3Client: S3Client | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadDir();
    this.initS3Client();
  }

  private initS3Client() {
    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('S3_SECRET_ACCESS_KEY');

    if (endpoint && accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        endpoint,
        region: this.configService.get<string>('S3_REGION', 'auto'),
        credentials: { accessKeyId, secretAccessKey },
      });
      this.logger.log('S3/R2 client initialized');
    }
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
      throw new BadRequestException('El archivo excede el límite de 50MB');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only images are allowed');
    }

    // Validate file content by checking magic bytes (not just MIME header)
    if (!this.validateImageMagicBytes(file.buffer)) {
      throw new BadRequestException('File content does not match an image format');
    }

    // Sanitize folder to prevent path traversal
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');

    const uuid = uuidv4();
    const folderPath = path.join(this.uploadDir, tenantId, safeFolder);

    // Ensure tenant folder exists
    await fs.mkdir(folderPath, { recursive: true });

    // Higher quality settings for covers/logos (displayed full-width)
    const isHeroImage = ['covers', 'logos', 'branding'].includes(safeFolder);
    const maxDim = isHeroImage ? 3840 : 2000;
    const webpQuality = isHeroImage ? 90 : 82;

    // Process 2 variants in parallel: WebP (primary) + thumbnail WebP
    // JPEG fallback removed — WebP has 97%+ browser support since 2020
    try {
      // For logos, ensure alpha channel is preserved (PNG transparency → WebP)
      const isLogo = safeFolder === 'logos';
      const pipeline = (maxD: number, q: number) => {
        let p = sharp(file.buffer)
          .rotate() // auto-rotate based on EXIF orientation (fixes rotated phone photos)
          .resize(maxD, maxD, { fit: 'inside', withoutEnlargement: true });
        if (isLogo) p = p.ensureAlpha();
        return p.webp({ quality: q, alphaQuality: 100 });
      };

      await Promise.all([
        pipeline(maxDim, webpQuality)
          .toFile(path.join(folderPath, `${uuid}.webp`)),
        pipeline(400, 75)
          .toFile(path.join(folderPath, `${uuid}-thumb.webp`)),
      ]);
    } catch {
      throw new BadRequestException('Error processing image');
    }

    // Get primary file size
    const stats = await fs.stat(path.join(folderPath, `${uuid}.webp`));

    // Generate URLs
    const baseUrl = this.configService.get<string>('API_URL') || 'http://localhost:3001';
    const urlBase = `${baseUrl}/uploads/${tenantId}/${safeFolder}`;
    const url = `${urlBase}/${uuid}.webp`;
    const thumbnailUrl = `${urlBase}/${uuid}-thumb.webp`;

    // Save to database
    const media = await this.prisma.media.create({
      data: {
        tenantId,
        filename: `${uuid}.webp`,
        originalName: file.originalname,
        mimeType: 'image/webp',
        size: stats.size,
        url,
        thumbnailUrl,
        folder: safeFolder,
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

  /**
   * Delete media with atomic tenant isolation.
   * Cleans up files from both local disk AND S3/R2, then removes DB record.
   */
  async delete(tenantId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      // Verify ownership atomically
      const media = await tx.media.findFirst({
        where: { id, tenantId },
      });

      if (!media) {
        throw new BadRequestException('Media not found');
      }

      const baseName = media.filename.replace(/\.[^.]+$/, '');
      const safeFolder = media.folder || 'general';

      // Delete from local disk (all variants including legacy .jpg)
      const folderDir = path.join(this.uploadDir, tenantId, safeFolder);
      const filesToDelete = [
        path.join(folderDir, `${baseName}.webp`),
        path.join(folderDir, `${baseName}.jpg`),
        path.join(folderDir, `${baseName}-thumb.webp`),
        path.join(folderDir, media.filename),
      ];
      await Promise.allSettled(filesToDelete.map((f) => fs.unlink(f)));

      // Delete from S3/R2
      if (this.s3Client) {
        const bucket = this.configService.get<string>('S3_BUCKET_NAME', 'turnero-uploads');
        const keyBase = `${tenantId}/${safeFolder}/${baseName}`;
        await Promise.allSettled([
          this.s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: `${keyBase}.webp` })),
          this.s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: `${keyBase}.jpg` })),
          this.s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: `${keyBase}-thumb.webp` })),
        ]);
      }

      // Delete from database
      return tx.media.delete({ where: { id } });
    });
  }

  /**
   * Upload to S3/Cloudflare R2 — processes in memory (no disk).
   * Generates WebP + JPEG fallback + thumbnail in parallel.
   */
  async uploadToS3(
    tenantId: string,
    file: Express.Multer.File,
    folder = 'general',
  ) {
    if (!this.s3Client) {
      throw new BadRequestException('S3 storage is not configured');
    }

    // Validate file
    if (!file) throw new BadRequestException('No file provided');
    if (file.size > this.maxFileSize) throw new BadRequestException('El archivo excede el límite de 50MB');
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only images are allowed');
    }

    // Validate file content by checking magic bytes
    if (!this.validateImageMagicBytes(file.buffer)) {
      throw new BadRequestException('File content does not match an image format');
    }

    const uuid = uuidv4();
    const bucket = this.configService.get<string>('S3_BUCKET_NAME', 'turnero-uploads');
    const cdnUrl = this.configService.get<string>('CDN_URL', '');
    const cacheControl = 'public, max-age=31536000, immutable';

    // Higher quality settings for covers/logos (displayed full-width)
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
    const isHeroImage = ['covers', 'logos', 'branding'].includes(safeFolder);
    const maxDim = isHeroImage ? 3840 : 2000;
    const webpQuality = isHeroImage ? 90 : 82;

    // Process 2 variants in memory: WebP + thumbnail (no JPEG fallback)
    let webpBuffer: Buffer;
    let thumbBuffer: Buffer;

    try {
      [webpBuffer, thumbBuffer] = await Promise.all([
        sharp(file.buffer)
          .rotate()
          .resize(maxDim, maxDim, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: webpQuality })
          .toBuffer(),
        sharp(file.buffer)
          .rotate()
          .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 75 })
          .toBuffer(),
      ]);
    } catch {
      throw new BadRequestException('Error processing image');
    }

    const keyBase = `${tenantId}/${safeFolder}/${uuid}`;

    // Upload 2 files in parallel to S3/R2
    await Promise.all([
      this.s3Client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: `${keyBase}.webp`,
        Body: webpBuffer,
        ContentType: 'image/webp',
        CacheControl: cacheControl,
      })),
      this.s3Client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: `${keyBase}-thumb.webp`,
        Body: thumbBuffer,
        ContentType: 'image/webp',
        CacheControl: cacheControl,
      })),
    ]);

    // Generate URLs (CDN or fallback to API URL)
    const urlBase = cdnUrl
      ? `${cdnUrl}/${keyBase}`
      : `${this.configService.get<string>('API_URL', 'http://localhost:3001')}/uploads/${tenantId}/${safeFolder}/${uuid}`;
    const url = `${urlBase}.webp`;
    const thumbnailUrl = `${urlBase}-thumb.webp`;

    // Save to database
    const media = await this.prisma.media.create({
      data: {
        tenantId,
        filename: `${uuid}.webp`,
        originalName: file.originalname,
        mimeType: 'image/webp',
        size: webpBuffer.length,
        url,
        thumbnailUrl,
        folder: safeFolder,
      },
    });

    return media;
  }

  /**
   * Get the appropriate storage driver based on env config.
   */
  get storageDriver(): 'local' | 's3' {
    return (this.configService.get<string>('STORAGE_DRIVER', 'local') as 'local' | 's3');
  }

  /**
   * Stream a file from S3/R2 by key.
   * Returns { stream, contentType, contentLength } or null if not found.
   */
  async streamFromS3(key: string): Promise<{ stream: Readable; contentType: string; contentLength: number } | null> {
    if (!this.s3Client) return null;
    try {
      const bucket = this.configService.get<string>('S3_BUCKET_NAME', 'turnolink-uploads');
      const res = await this.s3Client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
      return {
        stream: res.Body as Readable,
        contentType: res.ContentType || 'application/octet-stream',
        contentLength: res.ContentLength || 0,
      };
    } catch {
      return null;
    }
  }

  /**
   * Validate image magic bytes to prevent MIME type spoofing.
   * Checks the first bytes of the file against known image signatures.
   */
  private validateImageMagicBytes(buffer: Buffer): boolean {
    if (buffer.length < 4) return false;

    // JPEG: FF D8 FF
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true;

    // PNG: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return true;

    // GIF: 47 49 46 38
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return true;

    // WebP: RIFF....WEBP
    if (buffer.length >= 12 &&
        buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
        buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return true;

    // HEIF/HEIC: ....ftyp (at offset 4)
    if (buffer.length >= 12 &&
        buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) return true;

    return false;
  }
}
