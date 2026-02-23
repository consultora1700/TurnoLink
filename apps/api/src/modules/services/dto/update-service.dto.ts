import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsArray,
  Min,
  Max,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';

export class UpdateServiceDto {
  @ApiPropertyOptional({ example: 'Corte de pelo' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'Corte clásico con máquina y tijera' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'Lavado, secado, productos premium' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  includes?: string;

  @ApiPropertyOptional({ example: 2500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 30, description: 'Duration in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(480)
  duration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ example: [], description: 'Additional gallery image URLs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5)
  images?: string[];

  @ApiPropertyOptional({ example: 'cover', description: 'Image display mode: cover or contain' })
  @IsOptional()
  @IsString()
  imageDisplayMode?: string;

  @ApiPropertyOptional({ description: 'Service variations as JSON string' })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  variations?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  order?: number;
}
