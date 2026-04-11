import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { AdminKeyGuard } from '../admin/guards/admin-key.guard';
import { PromoCodesService } from './promo-codes.service';
import { Public } from '../../common/decorators/public.decorator';

// ============ ADMIN ENDPOINTS ============

@Controller('admin/promo-codes')
@Public()
@UseGuards(AdminKeyGuard)
export class AdminPromoCodesController {
  constructor(private readonly promoCodesService: PromoCodesService) {}

  @Get()
  async getAll() {
    return this.promoCodesService.getAllPromoCodes();
  }

  @Post()
  async create(
    @Body()
    body: {
      code: string;
      description?: string;
      discountPercent: number;
      planId: string;
      maxUses?: number;
      expiresAt?: string;
    },
  ) {
    return this.promoCodesService.createPromoCode(body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      description?: string;
      discountPercent?: number;
      planId?: string;
      maxUses?: number;
      isActive?: boolean;
      expiresAt?: string | null;
    },
  ) {
    return this.promoCodesService.updatePromoCode(id, body);
  }

  @Delete(':id')
  async deactivate(@Param('id') id: string) {
    return this.promoCodesService.deactivatePromoCode(id);
  }
}

// ============ USER ENDPOINTS ============

@Controller('subscriptions/promo-code')
export class PromoCodesController {
  constructor(private readonly promoCodesService: PromoCodesService) {}

  /**
   * Validate a promo code without redeeming it
   */
  @Post('validate')
  async validate(
    @Request() req: any,
    @Body('code') code: string,
  ) {
    if (!code) {
      throw new BadRequestException('El código es requerido');
    }
    return this.promoCodesService.validatePromoCode(code, req.user.tenantId);
  }

  /**
   * Redeem a promo code — applies discount to subscription
   */
  @Post('redeem')
  async redeem(
    @Request() req: any,
    @Body('code') code: string,
  ) {
    if (!code) {
      throw new BadRequestException('El código es requerido');
    }
    return this.promoCodesService.redeemPromoCode(code, req.user.tenantId);
  }
}
