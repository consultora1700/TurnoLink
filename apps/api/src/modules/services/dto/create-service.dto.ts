import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsInt,
  IsOptional,
  IsBoolean,
  IsArray,
  IsIn,
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

  @ApiPropertyOptional({ example: 1, description: 'Max simultaneous bookings per time slot' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  capacity?: number;

  @ApiPropertyOptional({ example: 'presencial', description: 'Service mode: presencial, online, or ambos' })
  @IsOptional()
  @IsString()
  @IsIn(['presencial', 'online', 'ambos'])
  mode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
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

  @ApiPropertyOptional({ description: 'ID de la especialidad asociada' })
  @IsOptional()
  @IsString()
  specialtyId?: string;

  @ApiPropertyOptional({
    example: 'client_chooses',
    description: 'Modo de asignación: client_chooses, auto_assign, round_robin',
  })
  @IsOptional()
  @IsString()
  @IsIn(['client_chooses', 'auto_assign', 'round_robin'])
  assignmentMode?: string;

  @ApiPropertyOptional({ description: 'Visible en la página pública de reservas' })
  @IsOptional()
  @IsBoolean()
  visibleOnPublicPage?: boolean;

  @ApiPropertyOptional({ description: 'ID del formulario de admisión vinculado' })
  @IsOptional()
  @IsString()
  intakeFormId?: string;

  // Per-service check-in/out times (daily mode)
  @ApiPropertyOptional({ example: '14:00' }) @IsOptional() @IsString() @MaxLength(5) checkInTime?: string;
  @ApiPropertyOptional({ example: '10:00' }) @IsOptional() @IsString() @MaxLength(5) checkOutTime?: string;

  // Rich content per service
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) youtubeVideoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5000) amenities?: string;

  // Pack fields (daily mode only)
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPack?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() packCheckIn?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() packCheckOut?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) packNights?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) packOriginalPrice?: number;

  // Promotion fields
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) promoPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() promoStartDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() promoEndDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) promoMaxBookings?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) promoLabel?: string;
}
