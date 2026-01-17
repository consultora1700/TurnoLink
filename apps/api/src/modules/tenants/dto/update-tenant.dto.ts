import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsObject,
  MaxLength,
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
}

export class UpdateTenantDto {
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
  @IsObject()
  settings?: TenantSettingsDto;
}
