import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import sharp from 'sharp';
import { config } from '../config';
import { getTenantDir, getFileUrl } from '../utils/storage';

const router = Router();

// Multer config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// POST /api/creative/assets/upload — Upload image/logo
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.body;
    if (!tenantId) {
      res.status(400).json({ error: 'tenantId is required' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const dir = getTenantDir('assets', tenantId);
    const ext = path.extname(req.file.originalname) || '.png';
    const filename = `${uuid().slice(0, 12)}${ext}`;
    const filePath = path.join(dir, filename);

    // Optimize with Sharp (skip SVG)
    if (req.file.mimetype !== 'image/svg+xml') {
      await sharp(req.file.buffer)
        .png({ quality: 90 })
        .toFile(filePath);
    } else {
      fs.writeFileSync(filePath, req.file.buffer);
    }

    const metadata = req.file.mimetype !== 'image/svg+xml'
      ? await sharp(filePath).metadata()
      : { width: 0, height: 0 };

    res.status(201).json({
      filename,
      path: filePath,
      url: getFileUrl(`assets/${tenantId}`, filename),
      width: metadata.width || 0,
      height: metadata.height || 0,
      size: fs.statSync(filePath).size,
      mimetype: req.file.mimetype,
    });
  } catch (error: any) {
    console.error('Asset upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/creative/assets — List assets for a tenant
router.get('/', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.query;
    if (!tenantId) {
      res.status(400).json({ error: 'tenantId is required' });
      return;
    }

    const dir = path.join(config.paths.assets, tenantId as string);
    if (!fs.existsSync(dir)) {
      res.json([]);
      return;
    }

    const files = fs.readdirSync(dir).map((filename) => {
      const filePath = path.join(dir, filename);
      const stat = fs.statSync(filePath);
      return {
        filename,
        path: filePath,
        url: getFileUrl(`assets/${tenantId}`, filename),
        size: stat.size,
        createdAt: stat.birthtime,
      };
    });

    res.json(files.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
