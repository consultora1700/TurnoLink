import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsIn, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGuaranteeRecordDto {
  @ApiProperty()
  @IsString()
  contractId: string;

  @ApiProperty()
  @IsIn(['propietaria', 'caucion', 'bancaria', 'personal', 'seguro_caucion'])
  guaranteeType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  policyNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  guarantorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  guarantorDni?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  guarantorPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  guarantorEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  guarantorAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  coverageAmount?: number;

  @ApiPropertyOptional({ default: 'ARS' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documentUrl?: string;

  @ApiPropertyOptional({ default: 'active' })
  @IsOptional()
  @IsIn(['active', 'expired', 'released', 'claimed'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
