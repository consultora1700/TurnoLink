import { SetMetadata } from '@nestjs/common';

export const REQUIRE_2FA_KEY = 'require2FA';

/**
 * Decorator that marks an endpoint as requiring 2FA verification.
 * Must be used with Require2FAGuard.
 *
 * The request must include either:
 * - Header: X-TOTP-Code
 * - Body: totpCode
 *
 * If user doesn't have 2FA enabled, returns 403 with code: '2FA_NOT_ENABLED'
 * If 2FA code is missing or invalid, returns 403 with code: '2FA_CODE_REQUIRED' or '2FA_CODE_INVALID'
 */
export const Require2FA = () => SetMetadata(REQUIRE_2FA_KEY, true);
