import { Router, Request, Response } from 'express';
import { listScenes, getScene, generateSceneHtml, SceneParams } from '../services/marketing-scenes.service';
import { renderHtmlToImage } from '../services/html-renderer.service';
import sharp from 'sharp';

const router = Router();

// Preview cache (key → { buffer, timestamp })
const previewCache = new Map<string, { buffer: Buffer; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper: fetch tenant branding (same pattern as templates.ts)
async function getTenantBranding(tenantId: string, adminKey: string): Promise<SceneParams> {
  const defaults: SceneParams = {
    businessName: 'Tu Negocio',
    tagline: 'Servicios profesionales',
    primaryColor: '#3F8697',
    secondaryColor: '#2D6B77',
    accentColor: '#10B981',
  };

  if (!tenantId) return defaults;

  try {
    if (tenantId === 'platform') {
      return {
        businessName: 'TurnoLink',
        tagline: 'Turnos online para tu negocio',
        primaryColor: '#3F8697',
        secondaryColor: '#2D6B77',
        accentColor: '#10B981',
      };
    }

    const apiUrl = process.env.MAIN_API_URL || 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/api/admin/tenants/${tenantId}`, {
      headers: { 'X-Admin-Key': adminKey },
    });

    if (res.ok) {
      const tenant: any = await res.json();
      return {
        businessName: tenant.name || defaults.businessName,
        tagline: tenant.tagline || tenant.description || defaults.tagline,
        primaryColor: tenant.primaryColor || tenant.settings?.primaryColor || defaults.primaryColor,
        secondaryColor: tenant.secondaryColor || tenant.settings?.secondaryColor || defaults.secondaryColor,
        accentColor: tenant.accentColor || tenant.settings?.accentColor || defaults.accentColor,
        logoUrl: tenant.logoUrl || tenant.settings?.logoUrl || undefined,
        services: tenant.services?.map((s: any) => s.name) || undefined,
      };
    }
  } catch (e) {
    console.error('Failed to fetch tenant branding:', e);
  }

  return defaults;
}

// GET /api/creative/marketing/scenes — List all scenes
router.get('/scenes', (_req: Request, res: Response) => {
  res.json(listScenes());
});

// GET /api/creative/marketing/scenes/:id — Get scene info
router.get('/scenes/:id', (req: Request, res: Response) => {
  const scene = getScene(req.params.id);
  if (!scene) {
    res.status(404).json({ error: 'Scene not found' });
    return;
  }
  res.json(scene);
});

// GET /api/creative/marketing/scenes/:id/preview — Render preview PNG
router.get('/scenes/:id/preview', async (req: Request, res: Response) => {
  try {
    const { tenantId, width: previewWidth } = req.query;
    const scene = getScene(req.params.id);
    if (!scene) {
      res.status(404).json({ error: 'Scene not found' });
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

    const adminKey = (req.headers['x-admin-key'] as string) || '';
    const branding = await getTenantBranding(tenantId as string, adminKey);

    const result = generateSceneHtml(req.params.id, branding);
    if (!result) {
      res.status(500).json({ error: 'Failed to generate scene HTML' });
      return;
    }

    // Render to image
    const rendered = await renderHtmlToImage(
      { html: result.html, width: result.width, height: result.height, format: 'png', deviceScaleFactor: 1 },
      (tenantId as string) || 'preview'
    );

    // Resize to preview size
    const scale = targetWidth / result.width;
    const targetHeight = Math.round(result.height * scale);

    const previewBuffer = await sharp(rendered.outputPath)
      .resize(targetWidth, targetHeight, { fit: 'fill' })
      .png()
      .toBuffer();

    // Clean up full-size file
    const fs = await import('fs');
    try { fs.unlinkSync(rendered.outputPath); } catch {}

    // Cache
    previewCache.set(cacheKey, { buffer: previewBuffer, timestamp: Date.now() });

    // Evict old
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

// POST /api/creative/marketing/render — Render scene full-size
router.post('/render', async (req: Request, res: Response) => {
  try {
    const { sceneId, tenantId, customizations, format = 'png', quality = 90 } = req.body;

    if (!sceneId) {
      res.status(400).json({ error: 'sceneId is required' });
      return;
    }

    const scene = getScene(sceneId);
    if (!scene) {
      res.status(404).json({ error: 'Scene not found' });
      return;
    }

    const adminKey = (req.headers['x-admin-key'] as string) || '';
    const branding = await getTenantBranding(tenantId, adminKey);

    // Merge customizations over branding
    const params: SceneParams = {
      ...branding,
      ...customizations,
      businessName: customizations?.title || customizations?.businessName || branding.businessName,
      tagline: customizations?.subtitle || customizations?.tagline || branding.tagline,
      primaryColor: customizations?.primaryColor || branding.primaryColor,
      secondaryColor: customizations?.secondaryColor || branding.secondaryColor,
      accentColor: customizations?.accentColor || branding.accentColor,
    };

    const result = generateSceneHtml(sceneId, params);
    if (!result) {
      res.status(500).json({ error: 'Failed to generate scene HTML' });
      return;
    }

    const rendered = await renderHtmlToImage(
      { html: result.html, width: result.width, height: result.height, format, quality },
      tenantId || 'render'
    );

    res.json({
      outputUrl: rendered.outputUrl,
      width: rendered.width,
      height: rendered.height,
      fileSize: rendered.fileSize,
      format: rendered.format,
    });
  } catch (error: any) {
    console.error('Render error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/creative/marketing/batch — Render multiple scenes
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { sceneIds, tenantId, customizations, formats = ['png'] } = req.body;

    if (!sceneIds || !Array.isArray(sceneIds) || sceneIds.length === 0) {
      res.status(400).json({ error: 'sceneIds array is required' });
      return;
    }

    const adminKey = (req.headers['x-admin-key'] as string) || '';
    const branding = await getTenantBranding(tenantId, adminKey);

    const params: SceneParams = {
      ...branding,
      ...customizations,
      businessName: customizations?.title || customizations?.businessName || branding.businessName,
      tagline: customizations?.subtitle || customizations?.tagline || branding.tagline,
      primaryColor: customizations?.primaryColor || branding.primaryColor,
      secondaryColor: customizations?.secondaryColor || branding.secondaryColor,
      accentColor: customizations?.accentColor || branding.accentColor,
    };

    const results = [];

    for (const sceneId of sceneIds) {
      const scene = getScene(sceneId);
      if (!scene) continue;

      const html = generateSceneHtml(sceneId, params);
      if (!html) continue;

      for (const format of formats) {
        const rendered = await renderHtmlToImage(
          { html: html.html, width: html.width, height: html.height, format, quality: 90 },
          tenantId || 'batch'
        );
        results.push({
          sceneId,
          sceneName: scene.name,
          outputUrl: rendered.outputUrl,
          width: rendered.width,
          height: rendered.height,
          fileSize: rendered.fileSize,
          format: rendered.format,
        });
      }
    }

    res.json({ results });
  } catch (error: any) {
    console.error('Batch render error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
