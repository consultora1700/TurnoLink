import { Router, Request, Response } from 'express';
import { PrismaClient } from '../prisma';
import { getQueue, QUEUE_NAMES } from '../queues/setup';
import { renderComposition, CompositionData } from '../services/composition.service';
import * as templateService from '../services/template.service';

const router = Router();
const prisma = new PrismaClient();

function substituteVariables(layers: any[], vars: Record<string, string>): any[] {
  const json = JSON.stringify(layers);
  let result = json;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
  }
  return JSON.parse(result);
}

// POST /api/creative/render — Synchronous render from template + customizations
router.post('/render', async (req: Request, res: Response) => {
  try {
    const { templateId, tenantId, customizations, format, quality } = req.body;

    if (!templateId || !tenantId) {
      res.status(400).json({ error: 'templateId and tenantId are required' });
      return;
    }

    const template = await templateService.getTemplate(templateId);
    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    const layers = JSON.parse(template.layers);

    // Build substitution variables from customizations
    const vars: Record<string, string> = {
      businessName: customizations?.title || 'Tu Negocio',
      title: customizations?.title || 'Tu Negocio',
      subtitle: customizations?.subtitle || '',
      tagline: customizations?.subtitle || '',
      description: customizations?.description || '',
      primaryColor: customizations?.primaryColor || '#3F8697',
      secondaryColor: customizations?.secondaryColor || '#2D6B77',
      accentColor: customizations?.accentColor || '#10B981',
      cta: customizations?.cta || 'Reservar ahora',
      logoUrl: customizations?.logoUrl || '',
    };

    const resolvedLayers = substituteVariables(layers, vars);

    const compositionData: CompositionData = {
      width: template.width,
      height: template.height,
      backgroundColor: '#ffffff',
      layers: resolvedLayers,
    };

    const result = await renderComposition(
      compositionData,
      tenantId,
      format || 'png',
      quality || 90
    );

    // Save to DB
    await prisma.creative.create({
      data: {
        tenantId,
        templateId,
        name: `${template.name} - Render`,
        type: 'composition',
        status: 'completed',
        inputData: JSON.stringify(compositionData),
        outputPath: result.outputPath,
        outputUrl: result.outputUrl,
        format: result.format,
        width: result.width,
        height: result.height,
        fileSize: result.fileSize,
      },
    });

    res.json({
      outputUrl: result.outputUrl,
      width: result.width,
      height: result.height,
      fileSize: result.fileSize,
      format: result.format,
    });
  } catch (error: any) {
    console.error('Render error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/creative/compositions — Create composition
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      tenantId,
      templateId,
      name,
      data, // { width, height, backgroundColor, layers }
      format,
      quality,
      async: isAsync,
    } = req.body;

    if (!tenantId || !data) {
      res.status(400).json({ error: 'tenantId and data are required' });
      return;
    }

    const creative = await prisma.creative.create({
      data: {
        tenantId,
        templateId: templateId || null,
        name: name || 'Composition',
        type: 'composition',
        status: 'pending',
        inputData: JSON.stringify(data),
        format: format || 'png',
        width: data.width,
        height: data.height,
      },
    });

    if (isAsync === false) {
      // Render synchronously
      try {
        const result = await renderComposition(data, tenantId, format || 'png', quality || 90);
        await prisma.creative.update({
          where: { id: creative.id },
          data: {
            status: 'completed',
            outputPath: result.outputPath,
            outputUrl: result.outputUrl,
            width: result.width,
            height: result.height,
            fileSize: result.fileSize,
            format: result.format,
          },
        });

        const updated = await prisma.creative.findUnique({ where: { id: creative.id } });
        res.status(201).json(updated);
        return;
      } catch (error: any) {
        await prisma.creative.update({
          where: { id: creative.id },
          data: { status: 'failed', errorMsg: error.message },
        });
        res.status(500).json({ error: error.message });
        return;
      }
    }

    // Async via queue
    const queue = getQueue(QUEUE_NAMES.COMPOSITION);
    const job = await queue.add('composition', {
      creativeId: creative.id,
      data,
      tenantId,
      format: format || 'png',
      quality: quality || 90,
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
    console.error('Composition error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/creative/compositions/:id — Update composition data
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { data, name } = req.body;
    const updateData: any = {};

    if (data) {
      updateData.inputData = JSON.stringify(data);
      updateData.width = data.width;
      updateData.height = data.height;
    }
    if (name) updateData.name = name;

    const creative = await prisma.creative.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json(creative);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/creative/compositions — List
router.get('/', async (req: Request, res: Response) => {
  try {
    const { tenantId, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { type: 'composition' };
    if (tenantId) where.tenantId = tenantId;

    const [items, total] = await Promise.all([
      prisma.creative.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
        include: { template: true },
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

// GET /api/creative/compositions/:id — Detail with layers
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const creative = await prisma.creative.findUnique({
      where: { id: req.params.id },
      include: { template: true },
    });

    if (!creative) {
      res.status(404).json({ error: 'Composition not found' });
      return;
    }

    res.json({
      ...creative,
      inputData: JSON.parse(creative.inputData),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
