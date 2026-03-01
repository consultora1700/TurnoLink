import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  MaxLength,
  MinLength,
  Matches,
  IsUrl,
} from 'class-validator';

class TenantSettingsDto {
  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  bookingBuffer?: number;

  @IsOptional()
  maxAdvanceBookingDays?: number;

  @IsOptional()
  minAdvanceBookingHours?: number;

  @IsOptional()
  allowCancellation?: boolean;

  @IsOptional()
  cancellationHoursLimit?: number;

  @IsOptional()
  showPrices?: boolean;

  @IsOptional()
  requirePhone?: boolean;

  @IsOptional()
  requireEmail?: boolean;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @IsOptional()
  @IsString()
  accentColor?: string;

  @IsOptional()
  enableDarkMode?: boolean;

  @IsOptional()
  @IsString()
  backgroundStyle?: string;

  @IsOptional()
  requireDeposit?: boolean;

  @IsOptional()
  depositPercentage?: number;

  @IsOptional()
  @IsString()
  depositMode?: string;

  @IsOptional()
  @IsBoolean()
  smartTimeSlots?: boolean;

  @IsOptional()
  @IsBoolean()
  embedEnabled?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  embedAllowedDomains?: string[];

  @IsOptional()
  @IsString()
  embedDisplayMode?: string;

  @IsOptional()
  @IsString()
  embedButtonText?: string;

  @IsOptional()
  @IsString()
  embedButtonColor?: string;
}

export class UpdateTenantDto {
  @ApiPropertyOptional({ example: 'mi-negocio' })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'La URL debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'La URL no puede exceder 50 caracteres' })
  @Matches(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, {
    message: 'Solo letras minúsculas, números y guiones. No puede empezar ni terminar con guión.',
  })
  slug?: string;

  @ApiPropertyOptional({ example: 'My Barbershop' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'The best barbershop in town' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: '+54 11 1234-5678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'contact@mybarbershop.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'Av. Corrientes 1234' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Buenos Aires' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: '@mybarbershop' })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional({ example: 'mybarbershop' })
  @IsOptional()
  @IsString()
  facebook?: string;

  @ApiPropertyOptional({ example: 'https://mybarbershop.com' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  settings?: string;
}
