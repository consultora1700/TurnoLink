import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { PlatformService } from './platform.service';

// Simple API key guard for admin endpoints
class AdminApiKeyGuard {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: any): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-admin-api-key'];
    const expectedKey = this.configService.get<string>('ADMIN_API_KEY');

    if (!expectedKey) {
      // If no admin key configured, check if localhost or specific admin user
      return false;
    }

    return apiKey === expectedKey;
  }
}

@Controller('platform')
export class PlatformController {
  private readonly logger = new Logger(PlatformController.name);

  constructor(
    private readonly platformService: PlatformService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get MercadoPago connection status
   * Public endpoint to show if payments are enabled
   */
  @Get('status')
  async getStatus() {
    return this.platformService.getStatus();
  }

  /**
   * Get OAuth URL to connect platform MercadoPago
   * This is for the platform owner to connect their account
   */
  @Get('oauth/url')
  async getOAuthUrl(
    @Query('admin_key') adminKey: string,
  ) {
    const expectedKey = this.configService.get<string>('ADMIN_API_KEY');

    if (!expectedKey || adminKey !== expectedKey) {
      throw new BadRequestException('Unauthorized');
    }

    const url = await this.platformService.getOAuthUrl();
    return { url };
  }

  /**
   * OAuth callback - handles MercadoPago redirect
   */
  @Get('oauth/callback')
  async handleOAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const webUrl = this.configService.get<string>('WEB_URL') || 'https://turnolink.mubitt.com';

    try {
      if (!code || !state) {
        throw new BadRequestException('Missing OAuth parameters');
      }

      await this.platformService.handleOAuthCallback(code, state);

      // Redirect to success page
      res.redirect(`${webUrl}/admin/configuracion?mp_connected=true`);
    } catch (error) {
      this.logger.error('OAuth callback error', error);
      res.redirect(`${webUrl}/admin/configuracion?mp_error=true`);
    }
  }

  /**
   * Disconnect MercadoPago (admin only)
   */
  @Post('disconnect')
  async disconnect(@Query('admin_key') adminKey: string) {
    const expectedKey = this.configService.get<string>('ADMIN_API_KEY');

    if (!expectedKey || adminKey !== expectedKey) {
      throw new BadRequestException('Unauthorized');
    }

    await this.platformService.disconnect();
    return { success: true, message: 'MercadoPago desconectado' };
  }
}
