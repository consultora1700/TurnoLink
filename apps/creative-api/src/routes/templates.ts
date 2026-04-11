import { Router, Request, Response } from 'express';
import * as templateService from '../services/template.service';
import { renderComposition, CompositionData } from '../services/composition.service';
import sharp from 'sharp';
import { config } from '../config';

const router = Router();

// Simple in-memory preview cache (key → { buffer, timestamp })
const previewCache = new Map<string, { buffer: Buffer; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function substituteVariables(layers: any[], vars: Record<string, string>): any[] {
  const json = JSON.stringify(layers);
  let result = json;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
  }
  return JSON.parse(result);
}

// GET /api/creative/templates/:id/preview — Render template preview image
router.get('/:id/preview', async (req: Request, res: Response) => {
  try {
    const { tenantId, width: previewWidth } = req.query;
    const template = await templateService.getTemplate(req.params.id);
    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    const targetWidth = parseInt(previewWidth as string) || 400;
    const cacheKey = `${req.params.id}-${tenantId || 'none'}-${targetWidth}`;

    // Check cache
    const cached = previewCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.set('Content-Type', 'image/png');
      res.set('Cache-Control', 'public, max-age=300');
      res.send(cached.buffer);
      return;
    }

    const layers = JSON.parse(template.layers);

    // Fetch branding if tenantId provided
    let vars: Record<string, string> = {
      businessName: 'Tu Negocio',
      title: 'Tu Negocio',
      subtitle: 'Servicios profesionales',
      tagline: 'Servicios profesionales',
      description: 'La mejor calidad para tu negocio',
      primaryColor: '#3F8697',
      secondaryColor: '#2D6B77',
      accentColor: '#10B981',
      cta: 'Reservar ahora',
      logoUrl: '',
    };

    if (tenantId) {
      try {
        const adminKey = req.headers['x-admin-key'] as string || '';
        // Use internal call to branding endpoint
        if (tenantId === 'platform') {
          vars.businessName = 'TurnoLink';
          vars.title = 'TurnoLink';
          vars.subtitle = 'Turnos online para tu negocio';
          vars.tagline = 'Turnos online para tu negocio';
          vars.primaryColor = '#3F8697';
          vars.secondaryColor = '#2D6B77';
          vars.accentColor = '#10B981';
        } else {
          const apiUrl = process.env.MAIN_API_URL || 'http://localhost:3001';
          const brandingRes = await fetch(`${apiUrl}/api/admin/tenants/${tenantId}`, {
            headers: { 'X-Admin-Key': adminKey },
          });
          if (brandingRes.ok) {
            const tenant: any = await brandingRes.json();
            vars.businessName = tenant.name || vars.businessName;
            vars.title = tenant.name || vars.title;
            vars.subtitle = tenant.tagline || tenant.description || vars.subtitle;
            vars.tagline = tenant.tagline || tenant.description || vars.tagline;
            vars.primaryColor = tenant.primaryColor || tenant.settings?.primaryColor || vars.primaryColor;
            vars.secondaryColor = tenant.secondaryColor || tenant.settings?.secondaryColor || vars.secondaryColor;
            vars.accentColor = tenant.accentColor || tenant.settings?.accentColor || vars.accentColor;
            vars.logoUrl = tenant.logoUrl || tenant.settings?.logoUrl || '';
          }
        }
      } catch (e) {
        console.error('Failed to fetch branding for preview:', e);
      }
    }

    // Substitute variables in layers
    const resolvedLayers = substituteVariables(layers, vars);

    const compositionData: CompositionData = {
      width: template.width,
      height: template.height,
      backgroundColor: '#ffffff',
      layers: resolvedLayers,
    };

    // Render full-size
    const result = await renderComposition(compositionData, 'preview', 'png', 90);

    // Resize to preview size
    const scale = targetWidth / template.width;
    const targetHeight = Math.round(template.height * scale);

    const previewBuffer = await sharp(result.outputPath)
      .resize(targetWidth, targetHeight, { fit: 'fill' })
      .png()
      .toBuffer();

    // Clean up full-size file
    const fs = await import('fs');
    try { fs.unlinkSync(result.outputPath); } catch {}

    // Cache the preview
    previewCache.set(cacheKey, { buffer: previewBuffer, timestamp: Date.now() });

    // Evict old entries
    for (const [key, val] of previewCache) {
      if (Date.now() - val.timestamp > CACHE_TTL) {
        previewCache.delete(key);
      }
    }

    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=300');
    res.send(previewBuffer);
  } catch (error: any) {
    console.error('Preview error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/creative/templates
router.get('/', async (req: Request, res: Response) => {
  try {
    const { tenantId, category } = req.query;
    let templates = await templateService.listTemplates(tenantId as string);

    if (category) {
      templates = templates.filter((t) => t.category === category);
    }

    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/creative/templates/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const template = await templateService.getTemplate(req.params.id);
    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }
    res.json({
      ...template,
      layers: JSON.parse(template.layers),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/creative/templates
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, category, width, height, layers, thumbnail, isSystem, tenantId } = req.body;

    if (!name || !category || !width || !height || !layers) {
      res.status(400).json({ error: 'name, category, width, height, and layers are required' });
      return;
    }

    const template = await templateService.createTemplate({
      name, category, width, height, layers, thumbnail, isSystem, tenantId,
    });

    res.status(201).json(template);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/creative/templates/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const template = await templateService.updateTemplate(req.params.id, req.body);
    res.json(template);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/creative/templates/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await templateService.deleteTemplate(req.params.id);
    res.json({ message: 'Template deleted' });
  } catch (error: any) {
    if (error.message.includes('system')) {
      res.status(403).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// POST /api/creative/templates/:id/duplicate
router.post('/:id/duplicate', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.body;
    const template = await templateService.duplicateTemplate(req.params.id, tenantId);
    res.status(201).json(template);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
