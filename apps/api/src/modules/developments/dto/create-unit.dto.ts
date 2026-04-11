import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUnitDto {
  @ApiProperty()
  @IsString()
  unitIdentifier: string;

  @ApiPropertyOptional({ default: '2amb' })
  @IsOptional()
  @IsIn(['monoambiente', '1amb', '2amb', '3amb', 'local', 'cochera', 'baulera'])
  unitType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  floor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orientation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  area?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({ default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ default: 'available' })
  @IsOptional()
  @IsIn(['available', 'reserved', 'sold', 'escriturada'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  supCubierta?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  floorPlanUrl?: string;
}
