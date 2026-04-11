import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'SHIPPED', 'ARRIVED', 'DELIVERED', 'CANCELLED'] as const;

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Nuevo estado del pedido',
    enum: ORDER_STATUSES,
    example: 'CONFIRMED',
  })
  @IsString()
  @IsIn(ORDER_STATUSES, { message: 'Estado inválido' })
  status: string;

  @ApiProperty({ description: 'Nota opcional sobre el cambio de estado', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
