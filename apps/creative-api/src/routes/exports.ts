import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { exportCreative, batchExport, getExportById } from '../services/export.service';

const router = Router();

// POST /api/creative/exports — Export a creative to a format
router.post('/', async (req: Request, res: Response) => {
  try {
    const { creativeId, format, width, height, quality, batch } = req.body;

    if (!creativeId) {
      res.status(400).json({ error: 'creativeId is required' });
      return;
    }

    // Batch export
    if (batch && Array.isArray(batch)) {
      const result = await batchExport(creativeId, batch);
      res.status(201).json(result);
      return;
    }

    // Single export
    if (!format) {
      res.status(400).json({ error: 'format is required' });
      return;
    }

    const result = await exportCreative({
      creativeId,
      format,
      width,
      height,
      quality,
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Export error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/creative/exports/:id — Export status
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const exportRecord = await getExportById(req.params.id);
    if (!exportRecord) {
      res.status(404).json({ error: 'Export not found' });
      return;
    }
    res.json(exportRecord);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/creative/exports/:id/download — Download export file
router.get('/:id/download', async (req: Request, res: Response) => {
  try {
    const exportRecord = await getExportById(req.params.id);
    if (!exportRecord || !exportRecord.outputPath) {
      res.status(404).json({ error: 'Export file not found' });
      return;
    }

    if (!fs.existsSync(exportRecord.outputPath)) {
      res.status(404).json({ error: 'File not found on disk' });
      return;
    }

    const filename = path.basename(exportRecord.outputPath);
    res.download(exportRecord.outputPath, filename);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
