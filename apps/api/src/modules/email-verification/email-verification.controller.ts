import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EmailVerificationService } from './email-verification.service';

@Controller('email-verification')
export class EmailVerificationController {
  constructor(private readonly emailVerificationService: EmailVerificationService) {}

  /**
   * Verify email with token (public endpoint)
   */
  @Get('verify')
  async verify(@Query('token') token: string) {
    return this.emailVerificationService.verifyEmail(token);
  }

  /**
   * Send verification email (authenticated)
   */
  @Post('send')
  @UseGuards(JwtAuthGuard)
  async sendVerification(@Request() req: any) {
    return this.emailVerificationService.sendVerificationEmail(req.user.id);
  }

  /**
   * Check verification status (authenticated)
   */
  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@Request() req: any) {
    const isVerified = await this.emailVerificationService.isEmailVerified(req.user.id);
    return { emailVerified: isVerified };
  }
}
