import { Router, Request, Response } from 'express';
import { PrismaClient } from '../prisma';
import { getQueue, QUEUE_NAMES } from '../queues/setup';

const router = Router();
const prisma = new PrismaClient();

// POST /api/creative/animations — Create animation job
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      tenantId,
      type, // "slideshow", "kenburns", "fade"
      imageIds, // creative IDs to use as frames
      imagePaths, // direct file paths (alternative)
      duration,
      transition,
      outputFormat,
      width,
      height,
      fps,
      name,
    } = req.body;

    if (!tenantId || !type) {
      res.status(400).json({ error: 'tenantId and type are required' });
      return;
    }

    // Resolve image paths
    let images: string[] = imagePaths || [];
    if (imageIds && imageIds.length > 0) {
      const creatives = await prisma.creative.findMany({
        where: { id: { in: imageIds }, status: 'completed' },
      });
      images = creatives
        .filter((c) => c.outputPath)
        .map((c) => c.outputPath!);
    }

    if (images.length === 0) {
      res.status(400).json({ error: 'At least one image is required' });
      return;
    }

    const creative = await prisma.creative.create({
      data: {
        tenantId,
        name: name || `Animation - ${type}`,
        type: 'animation',
        status: 'pending',
        inputData: JSON.stringify({ type, imageIds, duration, transition, outputFormat, width, height, fps }),
        format: outputFormat || 'mp4',
        width: width || 1080,
        height: height || 1080,
      },
    });

    const queue = getQueue(QUEUE_NAMES.ANIMATION);
    const job = await queue.add('animation', {
      creativeId: creative.id,
      options: {
        tenantId,
        type,
        images,
        duration: duration || 3,
        transition: transition || 1,
        outputFormat: outputFormat || 'mp4',
        width: width || 1080,
        height: height || 1080,
        fps: fps || 30,
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
    });
  } catch (error: any) {
    console.error('Animation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/creative/animations — List
router.get('/', async (req: Request, res: Response) => {
  try {
    const { tenantId, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { type: 'animation' };
    if (tenantId) where.tenantId = tenantId;

    const [items, total] = await Promise.all([
      prisma.creative.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.creative.count({ where }),
    ]);

    res.json({
      data: items,
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

export default router;
