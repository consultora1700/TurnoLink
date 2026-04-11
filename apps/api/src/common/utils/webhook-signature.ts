import * as crypto from 'crypto';

/**
 * Verify MercadoPago webhook signature (HMAC-SHA256).
 * Returns true if signature is valid, or if webhookSecret is not configured (dev mode).
 */
export function verifyMercadoPagoSignature(
  xSignature: string | undefined,
  xRequestId: string | undefined,
  dataId: string,
  webhookSecret: string | undefined,
): boolean {
  // Reject webhooks if secret is not configured (all environments)
  if (!webhookSecret) {
    return false;
  }

  if (!xSignature || !xRequestId) return false;

  // Parse x-signature header: "ts=...,v1=..."
  const signatureParts = xSignature.split(',').reduce(
    (acc, part) => {
      const [key, value] = part.split('=');
      if (key && value) acc[key.trim()] = value;
      return acc;
    },
    {} as Record<string, string>,
  );

  const ts = signatureParts['ts'];
  const receivedSignature = signatureParts['v1'];

  if (!ts || !receivedSignature) return false;

  // Create manifest and calculate HMAC
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const hmac = crypto.createHmac('sha256', webhookSecret);
  hmac.update(manifest);
  const calculatedSignature = hmac.digest('hex');

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(calculatedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex'),
    );
  } catch {
    return false;
  }
}
