import { IsString, IsOptional, IsBoolean, IsNumber, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ description: 'Nombre del empleado' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Email del empleado' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Teléfono del empleado' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'URL de la imagen del empleado' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'Especialidad (ej: Colorista, Masajista)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  specialty?: string;

  @ApiPropertyOptional({ description: 'Biografía breve' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({ description: 'Credenciales profesionales (matrícula, colegio, etc.)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  credentials?: string;

  @ApiPropertyOptional({ description: 'Nivel de seniority (junior, semi_senior, senior, partner)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  seniority?: string;

  @ApiPropertyOptional({ description: 'Visible en la página pública' })
  @IsOptional()
  @IsBoolean()
  isPubliclyVisible?: boolean;

  @ApiPropertyOptional({ description: 'Estado activo/inactivo' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Orden de visualización' })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ description: 'Es repartidor de delivery' })
  @IsOptional()
  @IsBoolean()
  isDelivery?: boolean;

  @ApiPropertyOptional({ description: 'Vehículo del repartidor: moto, bici, auto, a_pie' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  deliveryVehicle?: string;

  @ApiPropertyOptional({ description: 'Zona de reparto del repartidor' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  deliveryZone?: string;
}
