import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TipType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  NONE = 'none',
}

export class TipPaymentDto {
  @ApiProperty({ enum: TipType })
  @IsEnum(TipType)
  tipType: TipType;

  @ApiProperty({ description: 'Tip amount (percentage value or fixed amount)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tipValue?: number;

  @ApiProperty({ description: 'Payment method', example: 'mercadopago' })
  @IsString()
  paymentMethod: string; // "mercadopago" | "cash"
}
