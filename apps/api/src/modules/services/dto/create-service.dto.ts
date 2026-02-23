import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsArray,
  Min,
  Max,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'Corte de pelo' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

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

  @ApiProperty({ example: 2500 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 30, description: 'Duration in minutes' })
  @IsNumber()
  @Min(5)
  @Max(480)
  duration: number;

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
}
