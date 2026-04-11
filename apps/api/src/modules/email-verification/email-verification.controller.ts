import {
  Controller,
  Get,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { EmailVerificationService } from './email-verification.service';

@Controller('email-verification')
export class EmailVerificationController {
  constructor(private readonly emailVerificationService: EmailVerificationService) {}

  /**
   * Verify email with token (public endpoint)
   */
  @Get('verify')
  @Public()
  async verify(@Query('token') token: string) {
    return this.emailVerificationService.verifyEmail(token);
  }

  /**
   * Send verification email (authenticated — global JwtAuthGuard applies)
   */
  @Post('send')
  async sendVerification(@Request() req: any) {
    return this.emailVerificationService.sendVerificationEmail(req.user.id);
  }

  /**
   * Check verification status (authenticated — global JwtAuthGuard applies)
   */
  @Get('status')
  async getStatus(@Request() req: any) {
    const isVerified = await this.emailVerificationService.isEmailVerified(req.user.id);
    return { emailVerified: isVerified };
  }
}
