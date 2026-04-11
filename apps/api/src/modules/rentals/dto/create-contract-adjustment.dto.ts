import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsIn, IsUUID, IsDateString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContractAdjustmentDto {
  @ApiProperty()
  @IsUUID()
  contractId: string;

  @ApiProperty()
  @IsDateString()
  effectiveDate: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  newAmount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  adjustmentPercent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['ICL', 'IPC', 'custom'])
  indexUsed?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  indexValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isAutomatic?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
