import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsIn, IsUUID, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvestmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  unitId?: string;

  @ApiProperty()
  @IsString()
  investorName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  investorDni?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  investorPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  investorEmail?: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  totalAmount: number;

  @ApiPropertyOptional({ default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  totalInstallments?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  paymentPlanId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  downPaymentAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adjustmentType?: string;
}

export class MarkInvestmentPaymentDto {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  paidAmount: number;

  @ApiProperty()
  @IsIn(['transferencia', 'efectivo', 'cheque'])
  paymentMethod: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  paidDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receiptUrl?: string;
}
