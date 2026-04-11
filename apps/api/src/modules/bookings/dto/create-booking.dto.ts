import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  IsIn,
  IsInt,
  Min,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateBookingDto {
  @ApiPropertyOptional({ description: 'ID del servicio (requerido si no hay productId)' })
  @ValidateIf((o) => !o.productId)
  @IsString()
  @IsNotEmpty({ message: 'serviceId o productId es requerido' })
  serviceId?: string;

  @ApiPropertyOptional({ description: 'ID del producto (requerido si no hay serviceId)' })
  @ValidateIf((o) => !o.serviceId)
  @IsString()
  @IsNotEmpty({ message: 'productId o serviceId es requerido' })
  productId?: string;

  @ApiPropertyOptional({ description: 'Cantidad (para bookings de producto)', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ description: 'ID de la sucursal' })
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiPropertyOptional({ description: 'ID del empleado asignado' })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiProperty({ example: '2024-01-15', description: 'Date in YYYY-MM-DD format' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format',
  })
  date: string;

  @ApiProperty({ example: '10:00', description: 'Time in HH:mm format' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Time must be in HH:mm format',
  })
  startTime: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  customerName: string;

  @ApiProperty({ example: '+5491112345678' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  customerPhone: string;

  @ApiPropertyOptional({ example: 'juan@email.com' })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiPropertyOptional({ example: 'Prefer fade style' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ example: 'online', description: 'Booking mode: presencial or online' })
  @IsOptional()
  @IsString()
  @IsIn(['presencial', 'online'])
  bookingMode?: string;
}
