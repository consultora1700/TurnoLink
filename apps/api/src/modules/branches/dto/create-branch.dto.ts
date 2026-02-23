import { IsString, IsOptional, IsBoolean, IsNumber, MaxLength, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty({ description: 'Nombre de la sucursal' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Slug único de la sucursal (URL-friendly)' })
  @IsString()
  @MaxLength(50)
  slug: string;

  @ApiPropertyOptional({ description: 'URL de la imagen de la sucursal' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  image?: string;

  @ApiPropertyOptional({ description: 'Dirección de la sucursal' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({ description: 'Ciudad' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'Teléfono de la sucursal' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: 'Email de la sucursal' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Es la sucursal principal' })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;

  @ApiPropertyOptional({ description: 'Estado activo/inactivo' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Orden de visualización' })
  @IsOptional()
  @IsNumber()
  order?: number;
}
