import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsNumber, IsBoolean, IsIn, Min, Max } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class CreatePaymentPlanDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ default: 30 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  downPaymentPercent?: number;

  @ApiPropertyOptional({ default: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  installments?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @ApiPropertyOptional({ default: 'fixed_usd' })
  @IsOptional()
  @IsIn(['fixed_usd', 'fixed_ars', 'cac', 'uva', 'dolar_linked'])
  adjustmentType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdatePaymentPlanDto extends PartialType(CreatePaymentPlanDto) {}
