import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsIn, IsUUID, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRentalPaymentDto {
  @ApiProperty()
  @IsUUID()
  contractId: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  periodMonth: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  periodYear: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  expectedAmount: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  paidAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['transferencia', 'efectivo', 'cheque', 'deposito'])
  paymentMethod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receiptNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class MarkPaymentDto {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  paidAmount: number;

  @ApiProperty()
  @IsIn(['transferencia', 'efectivo', 'cheque', 'deposito'])
  paymentMethod: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receiptNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
