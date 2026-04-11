import { Router, Request, Response } from 'express';
import { generateCopy, getCopyHistory } from '../services/ai-copy.service';

const router = Router();

// POST /api/creative/ai-copy/generate
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const {
      tenantId,
      businessType,
      businessName,
      services,
      targetAudience,
      tone,
      format,
      language,
      additionalContext,
      variants,
    } = req.body;

    if (!tenantId || !businessType || !businessName || !format) {
      res.status(400).json({
        error: 'tenantId, businessType, businessName, and format are required',
      });
      return;
    }

    const result = await generateCopy({
      tenantId,
      businessType,
      businessName,
      services,
      targetAudience,
      tone,
      format,
      language,
      additionalContext,
      variants,
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error('AI Copy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/creative/ai-copy/history
router.get('/history', async (req: Request, res: Response) => {
  try {
    const { tenantId, limit } = req.query;

    if (!tenantId) {
      res.status(400).json({ error: 'tenantId is required' });
      return;
    }

    const history = await getCopyHistory(
      tenantId as string,
      parseInt((limit as string) || '20')
    );

    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
