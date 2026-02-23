import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Res,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoService } from './mercadopago.service';
import { JwtAuthGuard, TenantGuard, Require2FAGuard } from '../../common/guards';
import { CurrentUser, CurrentTenant, Require2FA } from '../../common/decorators';
import { GetOAuthUrlDto, DisconnectMercadoPagoDto } from './dto/connect-mercadopago.dto';
import { User, Tenant } from '@prisma/client';

@ApiTags('Mercado Pago')
@Controller('mercadopago')
export class MercadoPagoController {
  private readonly logger = new Logger(MercadoPagoController.name);

  constructor(
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly configService: ConfigService,
  ) {}

  @Get('status')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Mercado Pago connection status' })
  @ApiResponse({ status: 200, description: 'Connection status' })
  async getStatus(@CurrentTenant() tenant: Tenant) {
    const status = await this.mercadoPagoService.getStatus(tenant.id);
    return {
      success: true,
      data: status,
    };
  }

  @Post('oauth/url')
  @UseGuards(JwtAuthGuard, TenantGuard, Require2FAGuard)
  @Require2FA()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get OAuth authorization URL' })
  @ApiResponse({ status: 200, description: 'OAuth URL generated' })
  async getOAuthUrl(
    @CurrentTenant() tenant: Tenant,
    @Body() dto: GetOAuthUrlDto,
  ) {
    const url = await this.mercadoPagoService.getOAuthUrl(tenant.id, dto.isSandbox);
    return {
      success: true,
      data: { url },
    };
  }

  @Get('oauth/callback')
  @ApiOperation({ summary: 'OAuth callback handler' })
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

      const result = await this.mercadoPagoService.handleOAuthCallback(code, state);

      this.logger.log(`OAuth callback successful for tenant ${result.tenantId}`);

      // Redirect to frontend with success
      return res.redirect(`${frontendUrl}/pagos?mp_connected=true`);
    } catch (error) {
      this.logger.error(`OAuth callback failed: ${error.message}`);

      // Redirect to frontend with error
      const errorMessage = encodeURIComponent(error.message || 'Error al conectar Mercado Pago');
      return res.redirect(`${frontendUrl}/pagos?mp_error=${errorMessage}`);
    }
  }

  @Post('disconnect')
  @UseGuards(JwtAuthGuard, TenantGuard, Require2FAGuard)
  @Require2FA()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disconnect Mercado Pago account' })
  @ApiResponse({ status: 200, description: 'Account disconnected' })
  async disconnect(
    @CurrentTenant() tenant: Tenant,
    @CurrentUser() user: User,
    @Body() dto: DisconnectMercadoPagoDto,
  ) {
    await this.mercadoPagoService.disconnect(tenant.id);

    this.logger.log(`Mercado Pago disconnected by user ${user.id} for tenant ${tenant.id}`);

    return {
      success: true,
      message: 'Mercado Pago ha sido desconectado exitosamente',
    };
  }
}
