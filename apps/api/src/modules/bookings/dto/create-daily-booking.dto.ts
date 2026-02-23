import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsEmail,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateDailyBookingDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  serviceId: string;

  @ApiPropertyOptional({ description: 'ID de la sucursal' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiProperty({ example: '2024-03-10', description: 'Check-in date in YYYY-MM-DD format' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'checkInDate must be in YYYY-MM-DD format',
  })
  checkInDate: string;

  @ApiProperty({ example: '2024-03-13', description: 'Check-out date in YYYY-MM-DD format' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'checkOutDate must be in YYYY-MM-DD format',
  })
  checkOutDate: string;

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

  @ApiPropertyOptional({ example: 'Llegamos tarde, después de las 16hs' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
