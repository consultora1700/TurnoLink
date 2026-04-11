import { ApiPropertyOptional } from '@nestjs/swagger';
import {
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
  ValidateIf,
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  order?: number;

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

  // Per-service check-in/out times (daily mode) — nullable for clearing
  @ApiPropertyOptional({ example: '14:00' }) @IsOptional() @ValidateIf((_o, v) => v !== null) @IsString() @MaxLength(5) checkInTime?: string | null;
  @ApiPropertyOptional({ example: '10:00' }) @IsOptional() @ValidateIf((_o, v) => v !== null) @IsString() @MaxLength(5) checkOutTime?: string | null;

  // Rich content per service — nullable for clearing
  @ApiPropertyOptional() @IsOptional() @ValidateIf((_o, v) => v !== null) @IsString() @MaxLength(500) youtubeVideoUrl?: string | null;
  @ApiPropertyOptional() @IsOptional() @ValidateIf((_o, v) => v !== null) @IsString() @MaxLength(5000) amenities?: string | null;

  // Pack fields (daily mode only) — nullable for clearing
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPack?: boolean;
  @ApiPropertyOptional() @IsOptional() @ValidateIf((_o, v) => v !== null) @IsString() packCheckIn?: string | null;
  @ApiPropertyOptional() @IsOptional() @ValidateIf((_o, v) => v !== null) @IsString() packCheckOut?: string | null;
  @ApiPropertyOptional() @IsOptional() @ValidateIf((_o, v) => v !== null) @IsInt() @Min(1) packNights?: number | null;
  @ApiPropertyOptional() @IsOptional() @ValidateIf((_o, v) => v !== null) @IsNumber() @Min(0) packOriginalPrice?: number | null;

  // Promotion fields — nullable for clearing
  @ApiPropertyOptional() @IsOptional() @ValidateIf((_o, v) => v !== null) @IsNumber() @Min(0) promoPrice?: number | null;
  @ApiPropertyOptional() @IsOptional() @ValidateIf((_o, v) => v !== null) @IsString() promoStartDate?: string | null;
  @ApiPropertyOptional() @IsOptional() @ValidateIf((_o, v) => v !== null) @IsString() promoEndDate?: string | null;
  @ApiPropertyOptional() @IsOptional() @ValidateIf((_o, v) => v !== null) @IsInt() @Min(1) promoMaxBookings?: number | null;
  @ApiPropertyOptional() @IsOptional() @ValidateIf((_o, v) => v !== null) @IsString() @MaxLength(50) promoLabel?: string | null;
}
