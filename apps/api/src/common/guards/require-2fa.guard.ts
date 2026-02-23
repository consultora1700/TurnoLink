import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_2FA_KEY } from '../decorators/require-2fa.decorator';
import { TotpService } from '../../modules/totp/totp.service';

export interface Require2FAError {
  statusCode: number;
  message: string;
  code: '2FA_NOT_ENABLED' | '2FA_CODE_REQUIRED' | '2FA_CODE_INVALID';
}

@Injectable()
export class Require2FAGuard implements CanActivate {
  private readonly logger = new Logger(Require2FAGuard.name);

  constructor(
    private reflector: Reflector,
    @Inject(TotpService) private totpService: TotpService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if endpoint requires 2FA
    const require2FA = this.reflector.getAllAndOverride<boolean>(REQUIRE_2FA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!require2FA) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.id) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'User not authenticated',
        code: '2FA_CODE_REQUIRED',
      } as Require2FAError);
    }

    // Check if user has 2FA enabled
    const is2FAEnabled = await this.totpService.is2FAEnabled(user.id);

    if (!is2FAEnabled) {
      this.logger.warn(`User ${user.id} attempted protected action without 2FA enabled`);
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Two-factor authentication must be enabled to perform this action. Please set up 2FA in your security settings.',
        code: '2FA_NOT_ENABLED',
      } as Require2FAError);
    }

    // Get TOTP code from header or body
    const totpCode = this.getTotpCode(request);

    if (!totpCode) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Two-factor authentication code is required. Please provide your 2FA code.',
        code: '2FA_CODE_REQUIRED',
      } as Require2FAError);
    }

    // Verify the code
    const isValid = await this.totpService.verifyCode(user.id, totpCode);

    if (!isValid) {
      this.logger.warn(`Invalid 2FA code attempt for user ${user.id}`);
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Invalid two-factor authentication code. Please try again.',
        code: '2FA_CODE_INVALID',
      } as Require2FAError);
    }

    this.logger.debug(`2FA verification successful for user ${user.id}`);
    return true;
  }

  private getTotpCode(request: any): string | undefined {
    // Priority 1: Header X-TOTP-Code
    const headerCode = request.headers['x-totp-code'];
    if (headerCode) {
      return String(headerCode).trim();
    }

    // Priority 2: Body totpCode
    const bodyCode = request.body?.totpCode;
    if (bodyCode) {
      return String(bodyCode).trim();
    }

    return undefined;
  }
}
