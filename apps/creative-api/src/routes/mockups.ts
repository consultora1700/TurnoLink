import { Router, Request, Response } from 'express';
import { PrismaClient } from '../prisma';
import fs from 'fs';
import { getQueue, QUEUE_NAMES } from '../queues/setup';
import { getDeviceFrames } from '../services/mockup.service';

const router = Router();
const prisma = new PrismaClient();

// POST /api/creative/mockups — Create mockup
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      tenantId,
      screenshotId,
      deviceFrameId,
      background,
      shadow,
      scale,
      outputWidth,
      outputHeight,
      format,
      quality,
      name,
    } = req.body;

    if (!tenantId || !deviceFrameId) {
      res.status(400).json({ error: 'tenantId and deviceFrameId are required' });
      return;
    }

    // Get screenshot path if screenshotId provided
    let screenshotPath: string | undefined;
    if (screenshotId) {
      const screenshot = await prisma.creative.findUnique({
        where: { id: screenshotId },
      });
      if (!screenshot || !screenshot.outputPath) {
        res.status(404).json({ error: 'Screenshot not found or not ready' });
        return;
      }
      screenshotPath = screenshot.outputPath;
    }

    // Create creative record
    const creative = await prisma.creative.create({
      data: {
        tenantId,
        name: name || 'Device Mockup',
        type: 'mockup',
        status: 'pending',
        inputData: JSON.stringify({ screenshotId, deviceFrameId, background, shadow, scale, format, quality }),
        format: format || 'png',
      },
    });

    // Enqueue job
    const queue = getQueue(QUEUE_NAMES.MOCKUP);
    const job = await queue.add('mockup', {
      creativeId: creative.id,
      options: {
        screenshotPath,
        deviceFrameId,
        tenantId,
        background: background || { type: 'transparent' },
        shadow: shadow !== false,
        scale: scale || 1,
        outputWidth,
        outputHeight,
        format: format || 'png',
        quality: quality || 90,
      },
    });

    await prisma.creative.update({
      where: { id: creative.id },
      data: { jobId: job.id },
    });

    res.status(201).json({
      id: creative.id,
      jobId: job.id,
      status: 'pending',
      message: 'Mockup job created',
    });
  } catch (error: any) {
    console.error('Mockup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/creative/mockups — List mockups
router.get('/', async (req: Request, res: Response) => {
  try {
    const { tenantId, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { type: 'mockup' };
    if (tenantId) where.tenantId = tenantId;

    const [mockups, total] = await Promise.all([
      prisma.creative.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.creative.count({ where }),
    ]);

    res.json({
      data: mockups,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/creative/device-frames — List available frames
router.get('/device-frames', async (_req: Request, res: Response) => {
  try {
    const frames = await getDeviceFrames();
    res.json(frames);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
