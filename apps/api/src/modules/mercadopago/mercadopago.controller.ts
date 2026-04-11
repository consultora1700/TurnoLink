import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoService } from './mercadopago.service';
import { TotpService } from '../totp/totp.service';
import { CurrentUser, CurrentTenant } from '../../common/decorators';
import { Public } from '../../common/decorators/public.decorator';
import { RequireFeature } from '../../common/decorators/require-feature.decorator';
import { GetOAuthUrlDto, DisconnectMercadoPagoDto } from './dto/connect-mercadopago.dto';
import { User, Tenant } from '@prisma/client';

@ApiTags('Mercado Pago')
@Controller('mercadopago')
@ApiBearerAuth()
@RequireFeature('mercadopago')
export class MercadoPagoController {
  private readonly logger = new Logger(MercadoPagoController.name);

  constructor(
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly configService: ConfigService,
    private readonly totpService: TotpService,
  ) {}

  @Get('status')
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get OAuth authorization URL' })
  @ApiResponse({ status: 200, description: 'OAuth URL generated' })
  async getOAuthUrl(
    @CurrentTenant() tenant: Tenant,
    @CurrentUser() user: User,
    @Body() dto: GetOAuthUrlDto,
  ) {
    // If tenant already has MP connected, require 2FA to reconnect
    const status = await this.mercadoPagoService.getStatus(tenant.id);
    if (status.isConnected) {
      if (!dto.totpCode) {
        throw new ForbiddenException({
          statusCode: 403,
          message: 'Se requiere código de verificación para reconectar Mercado Pago',
          code: '2FA_CODE_REQUIRED',
        });
      }
      const isValid = await this.totpService.verifyCode(user.id, dto.totpCode);
      if (!isValid) {
        throw new ForbiddenException({
          statusCode: 403,
          message: 'Código de verificación inválido',
          code: '2FA_CODE_INVALID',
        });
      }
    }

    const url = await this.mercadoPagoService.getOAuthUrl(tenant.id, dto.isSandbox);
    return {
      success: true,
      data: { url },
    };
  }

  @Public()
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
