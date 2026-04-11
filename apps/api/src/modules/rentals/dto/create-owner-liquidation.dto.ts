import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOwnerLiquidationDto {
  @ApiProperty()
  @IsUUID()
  ownerId: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  periodMonth: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  periodYear: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class MarkLiquidationPaidDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
