import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, IsIn, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRentalPropertyDto {
  @ApiProperty()
  @IsUUID()
  ownerId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ default: 'departamento' })
  @IsOptional()
  @IsIn(['departamento', 'casa', 'local', 'oficina', 'ph', 'cochera', 'terreno', 'galpon'])
  propertyType?: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  floor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  area?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  rooms?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  bathrooms?: number;

  @ApiPropertyOptional({ default: 'percentage' })
  @IsOptional()
  @IsIn(['percentage', 'fixed'])
  commissionType?: string;

  @ApiPropertyOptional({ default: 5 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  commissionValue?: number;

  @ApiPropertyOptional({ default: 'available' })
  @IsOptional()
  @IsIn(['available', 'rented', 'maintenance', 'reserved'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
