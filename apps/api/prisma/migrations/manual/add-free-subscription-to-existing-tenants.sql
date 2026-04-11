-- Migration: Add free subscription to existing tenants without one
-- Run BEFORE deploying subscription guard changes
-- Safe to run multiple times (idempotent via NOT EXISTS)

INSERT INTO subscriptions ("id", "tenantId", "planId", "status", "billingPeriod", "currentPeriodEnd", "createdAt", "updatedAt")
SELECT gen_random_uuid(), t.id, p.id, 'ACTIVE', 'MONTHLY', NOW() + INTERVAL '100 years', NOW(), NOW()
FROM tenants t
CROSS JOIN subscription_plans p
WHERE p.slug = 'gratis'
AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s."tenantId" = t.id);
