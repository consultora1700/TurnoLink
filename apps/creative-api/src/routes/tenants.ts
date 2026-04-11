import { Router, Request, Response } from 'express';
import { config } from '../config';

const router = Router();

// Hardcoded branding for the platform itself
const PLATFORM_BRANDING = {
  name: 'TurnoLink',
  primaryColor: '#3F8697',
  secondaryColor: '#2D6B77',
  accentColor: '#10B981',
  logoUrl: null,
  tagline: 'Turnos online para tu negocio',
  services: ['Turnos Online', 'Gestión de Clientes', 'Marketing Digital'],
};

// GET /api/creative/tenants/:id/branding
router.get('/:id/branding', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (id === 'platform') {
      res.json(PLATFORM_BRANDING);
      return;
    }

    // Fetch from main API
    const adminKey = req.headers['x-admin-key'] as string || '';
    const apiUrl = process.env.MAIN_API_URL || 'http://localhost:3001';

    const response = await fetch(`${apiUrl}/api/admin/tenants/${id}`, {
      headers: { 'X-Admin-Key': adminKey },
    });

    if (!response.ok) {
      res.status(response.status).json({ error: 'Failed to fetch tenant' });
      return;
    }

    const tenant: any = await response.json();

    // Extract branding info
    const branding = {
      name: tenant.name || 'Sin nombre',
      primaryColor: tenant.primaryColor || tenant.settings?.primaryColor || '#3F8697',
      secondaryColor: tenant.secondaryColor || tenant.settings?.secondaryColor || '#2D6B77',
      accentColor: tenant.accentColor || tenant.settings?.accentColor || '#10B981',
      logoUrl: tenant.logoUrl || tenant.settings?.logoUrl || null,
      tagline: tenant.tagline || tenant.description || '',
      services: tenant.services || [],
    };

    res.json(branding);
  } catch (error: any) {
    console.error('Error fetching tenant branding:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
