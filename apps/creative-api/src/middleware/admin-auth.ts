import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { config } from '../config';

export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const adminKey =
    req.headers['x-admin-key'] as string ||
    extractFromAuthHeader(req.headers.authorization) ||
    (req.query.admin_key as string);

  if (!adminKey || !config.adminApiKey) {
    res.status(401).json({ error: 'Unauthorized: Missing admin key' });
    return;
  }

  // Timing-safe comparison
  const keyBuffer = Buffer.from(adminKey);
  const expectedBuffer = Buffer.from(config.adminApiKey);

  if (keyBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(keyBuffer, expectedBuffer)) {
    res.status(401).json({ error: 'Unauthorized: Invalid admin key' });
    return;
  }

  next();
}

function extractFromAuthHeader(header: string | undefined): string | null {
  if (!header) return null;
  const match = header.match(/^AdminKey\s+(.+)$/i);
  return match ? match[1] : null;
}
