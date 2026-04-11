import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsIn, IsUUID, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRentalContractDto {
  @ApiProperty()
  @IsUUID()
  propertyId: string;

  @ApiProperty()
  @IsUUID()
  rentalTenantId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contractNumber?: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  monthlyRent: number;

  @ApiPropertyOptional({ default: 'ARS' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  securityDeposit?: number;

  @ApiPropertyOptional({ default: 'ICL' })
  @IsOptional()
  @IsIn(['ICL', 'IPC', 'custom', 'none'])
  adjustmentIndex?: string;

  @ApiPropertyOptional({ default: 12 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  adjustmentFrequency?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customAdjustmentDesc?: string;

  @ApiPropertyOptional({ default: 'percentage' })
  @IsOptional()
  @IsIn(['percentage', 'fixed'])
  commissionType?: string;

  @ApiPropertyOptional({ default: 5 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  commissionValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['propietaria', 'caucion', 'bancaria', 'personal', 'seguro_caucion'])
  guaranteeType?: string;

  @ApiPropertyOptional({ default: 'active' })
  @IsOptional()
  @IsIn(['active', 'expired', 'terminated', 'draft'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
