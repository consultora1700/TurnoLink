import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsIn,
  IsEmail,
  ValidateNested,
  ValidateIf,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'ID del producto' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'ID de la variante (opcional)', required: false })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty({ description: 'Cantidad', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Opciones del item (gastro)', required: false })
  @IsOptional()
  @IsString()
  options?: string; // JSON: [{ label: "Guarnición", value: "Papas fritas" }]

  @ApiProperty({ description: 'Notas del item (gastro)', required: false })
  @IsOptional()
  @IsString()
  itemNotes?: string;
}

export class CreateOrderCustomerDto {
  @ApiProperty({ description: 'Nombre completo del cliente' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: 'Email del cliente', required: false })
  @IsOptional()
  @ValidateIf((o) => o.email !== '' && o.email != null)
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Teléfono del cliente' })
  @IsString()
  @MinLength(6)
  phone: string;

  @ApiProperty({ description: 'DNI/CUIT (opcional)', required: false })
  @IsOptional()
  @IsString()
  dni?: string;
}

export class CreateOrderShippingDto {
  @ApiProperty({ description: 'Método de envío', enum: ['retiro', 'envio', 'punto_encuentro'] })
  @IsString()
  @IsIn(['retiro', 'envio', 'punto_encuentro'])
  method: 'retiro' | 'envio' | 'punto_encuentro';

  @ApiProperty({ description: 'Dirección de envío', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Ciudad', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'Código postal', required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ description: 'Provincia', required: false })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiProperty({ description: 'Dirección formateada por Google Places', required: false })
  @IsOptional()
  @IsString()
  formattedAddress?: string;

  @ApiProperty({ description: 'Latitud', required: false })
  @IsOptional()
  lat?: number;

  @ApiProperty({ description: 'Longitud', required: false })
  @IsOptional()
  lng?: number;

  @ApiProperty({ description: 'Place ID de Google', required: false })
  @IsOptional()
  @IsString()
  placeId?: string;
}

const PAYMENT_METHODS = ['mercadopago', 'transferencia', 'efectivo'] as const;
const ORDER_TYPES = ['DINE_IN', 'TAKE_AWAY', 'DELIVERY'] as const;

export class CreateOrderDto {
  @ApiProperty({ description: 'Items del pedido', type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiProperty({ description: 'Datos del cliente' })
  @ValidateNested()
  @Type(() => CreateOrderCustomerDto)
  customer: CreateOrderCustomerDto;

  @ApiProperty({ description: 'Datos de envío', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateOrderShippingDto)
  shipping?: CreateOrderShippingDto;

  @ApiProperty({ description: 'Método de pago (opcional para gastro: se elige tras aceptación)', enum: PAYMENT_METHODS, required: false })
  @IsOptional()
  @IsString()
  @IsIn(PAYMENT_METHODS)
  paymentMethod?: 'mercadopago' | 'transferencia' | 'efectivo';

  @ApiProperty({ description: 'Tipo de pedido gastro', enum: ORDER_TYPES, required: false })
  @IsOptional()
  @IsString()
  @IsIn(ORDER_TYPES)
  orderType?: 'DINE_IN' | 'TAKE_AWAY' | 'DELIVERY';

  @ApiProperty({ description: 'Número de mesa (dine-in)', required: false })
  @IsOptional()
  @IsString()
  tableNumber?: string;

  @ApiProperty({ description: 'Código de cupón', required: false })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiProperty({ description: 'Notas del cliente', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
