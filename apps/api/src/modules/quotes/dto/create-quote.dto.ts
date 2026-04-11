import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  IsIn,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuoteItemDto {
  @ApiProperty({ description: 'Tipo de item', enum: ['SERVICE', 'PRODUCT', 'CUSTOM'] })
  @IsString()
  @IsIn(['SERVICE', 'PRODUCT', 'CUSTOM'])
  type: string;

  @ApiProperty({ description: 'ID del servicio (si type=SERVICE)', required: false })
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiProperty({ description: 'ID del producto (si type=PRODUCT)', required: false })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({ description: 'Nombre del item (requerido para CUSTOM, auto para SERVICE/PRODUCT)' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Descripción', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Cantidad', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Precio unitario' })
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateQuoteDto {
  @ApiProperty({ description: 'Nombre del cliente' })
  @IsString()
  customerName: string;

  @ApiProperty({ description: 'Teléfono del cliente', required: false })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiProperty({ description: 'Email del cliente', required: false })
  @IsOptional()
  @IsString()
  customerEmail?: string;

  @ApiProperty({ description: 'ID del cliente existente', required: false })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ description: 'Título del presupuesto', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Notas visibles para el cliente', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Notas internas', required: false })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiProperty({ description: 'Términos y condiciones', required: false })
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiProperty({ description: 'Descuento global', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiProperty({ description: 'Días de validez', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  validDays?: number;

  @ApiProperty({ description: 'Fecha de vencimiento', required: false })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiProperty({ description: 'Items del presupuesto', type: [CreateQuoteItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuoteItemDto)
  items: CreateQuoteItemDto[];
}
