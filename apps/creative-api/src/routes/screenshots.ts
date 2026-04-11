import { Router, Request, Response } from 'express';
import { PrismaClient } from '../prisma';
import { getQueue, QUEUE_NAMES } from '../queues/setup';

const router = Router();
const prisma = new PrismaClient();

// POST /api/creative/screenshots — Create screenshot job
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      tenantId,
      url,
      viewport,
      fullPage,
      selector,
      waitTime,
      format,
      quality,
      deviceScaleFactor,
      name,
    } = req.body;

    if (!tenantId || !url) {
      res.status(400).json({ error: 'tenantId and url are required' });
      return;
    }

    // Create creative record
    const creative = await prisma.creative.create({
      data: {
        tenantId,
        name: name || `Screenshot - ${new URL(url).hostname}`,
        type: 'screenshot',
        status: 'pending',
        inputData: JSON.stringify({ url, viewport, fullPage, selector, waitTime, format, quality, deviceScaleFactor }),
        format: format || 'png',
      },
    });

    // Enqueue job
    const queue = getQueue(QUEUE_NAMES.SCREENSHOT);
    const job = await queue.add('screenshot', {
      creativeId: creative.id,
      options: {
        url,
        tenantId,
        viewport: viewport || { width: 1440, height: 900 },
        fullPage: fullPage || false,
        selector,
        waitTime: waitTime || 2000,
        format: format || 'png',
        quality: quality || 90,
        deviceScaleFactor: deviceScaleFactor || 2,
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
      message: 'Screenshot job created',
    });
  } catch (error: any) {
    console.error('Screenshot error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/creative/screenshots — List screenshots
router.get('/', async (req: Request, res: Response) => {
  try {
    const { tenantId, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { type: 'screenshot' };
    if (tenantId) where.tenantId = tenantId;

    const [screenshots, total] = await Promise.all([
      prisma.creative.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.creative.count({ where }),
    ]);

    res.json({
      data: screenshots,
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

// GET /api/creative/screenshots/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const creative = await prisma.creative.findUnique({
      where: { id: req.params.id },
    });

    if (!creative || creative.type !== 'screenshot') {
      res.status(404).json({ error: 'Screenshot not found' });
      return;
    }

    res.json(creative);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
