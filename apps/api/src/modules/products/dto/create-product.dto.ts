import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsInt,
  IsOptional,
  IsBoolean,
  IsIn,
  IsArray,
  ValidateNested,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductAttributeDto {
  @IsString()
  key: string;

  @IsString()
  label: string;

  @IsString()
  value: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  unit?: string;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Remera Oversize Algodón' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Remera oversize 100% algodón, disponible en varios talles' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ example: 'Remera oversize algodón' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  shortDescription?: string;

  @ApiProperty({ example: 18500 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 22000, description: 'Precio original (para mostrar tachado)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @ApiPropertyOptional({ example: 8000, description: 'Precio de costo (interno, no visible al público)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional({ description: 'Precio diferenciado para delivery (null = usa precio base)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceDelivery?: number;

  @ApiPropertyOptional({ description: 'Precio diferenciado para takeaway (null = usa precio base)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceTakeaway?: number;

  @ApiPropertyOptional({ example: 'USD', description: 'Moneda del precio (null = default del negocio). Ej: ARS, USD' })
  @IsOptional()
  @IsString()
  @IsIn(['ARS', 'USD', 'BRL', 'EUR'])
  currency?: string;

  @ApiPropertyOptional({ example: 'REM-OVS-001' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9999)
  lowStockThreshold?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean;

  @ApiPropertyOptional({ example: 'PHYSICAL', description: 'PHYSICAL, DIGITAL, SERVICE' })
  @IsOptional()
  @IsString()
  @IsIn(['PHYSICAL', 'DIGITAL', 'SERVICE'])
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  digitalFileUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    example: [{ key: 'ambientes', label: 'Ambientes', value: '3', type: 'number' }],
    description: 'Ficha técnica — atributos estructurados del producto',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeDto)
  attributes?: ProductAttributeDto[];
}
