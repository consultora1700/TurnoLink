import {
  Controller,
  Get,
  Post,
  Body,
  Query,

  Res,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { VideoIntegrationService } from './video-integration.service';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { CurrentTenant } from '../../common/decorators';
import { GetVideoOAuthUrlDto } from './dto/connect-video.dto';
import { Tenant } from '@prisma/client';

@ApiTags('Video Integration')
@Controller('video-integration')
export class VideoIntegrationController {
  private readonly logger = new Logger(VideoIntegrationController.name);

  constructor(
    private readonly videoIntegrationService: VideoIntegrationService,
    private readonly configService: ConfigService,
  ) {}

  @Get('status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get video integration connection status' })
  @ApiResponse({ status: 200, description: 'Connection status' })
  async getStatus(@CurrentTenant() tenant: Tenant) {
    const status = await this.videoIntegrationService.getStatus(tenant.id);
    return {
      success: true,
      data: status,
    };
  }

  @Post('oauth/url')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get OAuth authorization URL for video provider' })
  @ApiResponse({ status: 200, description: 'OAuth URL generated' })
  async getOAuthUrl(
    @CurrentTenant() tenant: Tenant,
    @Body() dto: GetVideoOAuthUrlDto,
  ) {
    const url = await this.videoIntegrationService.getOAuthUrl(tenant.id, dto.provider);
    return {
      success: true,
      data: { url },
    };
  }

  @Get('oauth/callback')
  @ApiOperation({ summary: 'OAuth callback handler for video providers' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with result' })
  async handleOAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const frontendUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';

    try {
      if (!code || !state) {
        throw new Error('Missing OAuth parameters');
      }

      const result = await this.videoIntegrationService.handleOAuthCallback(code, state);

      this.logger.log(`Video OAuth callback successful for tenant ${result.tenantId}`);

      return res.redirect(`${frontendUrl}/videollamadas?connected=true`);
    } catch (error) {
      this.logger.error(`Video OAuth callback failed: ${error.message}`);

      const errorMessage = encodeURIComponent(error.message || 'Error al conectar videollamadas');
      return res.redirect(`${frontendUrl}/videollamadas?error=${errorMessage}`);
    }
  }

  @Post('disconnect')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disconnect video integration' })
  @ApiResponse({ status: 200, description: 'Video integration disconnected' })
  async disconnect(@CurrentTenant() tenant: Tenant) {
    await this.videoIntegrationService.disconnect(tenant.id);

    this.logger.log(`Video integration disconnected for tenant ${tenant.id}`);

    return {
      success: true,
      message: 'Videollamadas desconectadas exitosamente',
    };
  }
}
