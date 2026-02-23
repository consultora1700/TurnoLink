import { IsString, IsOptional, IsBoolean, IsInt, IsArray, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Nombre' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Teléfono de contacto' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Titular del perfil' })
  @IsOptional()
  @IsString()
  headline?: string;

  @ApiPropertyOptional({ description: 'Biografía' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'Especialidad' })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiPropertyOptional({ description: 'Categoría predefinida' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'URL de imagen de perfil' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'URL de imagen de portada/banner' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: 'Template de header (vibrant, clinical, corporate, modern, minimal)' })
  @IsOptional()
  @IsString()
  headerTemplate?: string;

  @ApiPropertyOptional({ description: 'Años de experiencia' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60)
  yearsExperience?: number;

  @ApiPropertyOptional({ description: 'Habilidades (array JSON)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({ description: 'Certificaciones (array JSON)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiPropertyOptional({ description: 'Disponibilidad: full-time, part-time, freelance' })
  @IsOptional()
  @IsString()
  availability?: string;

  @ApiPropertyOptional({ description: 'Zonas preferidas (array JSON)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredZones?: string[];

  @ApiPropertyOptional({ description: 'Abierto a nuevas oportunidades' })
  @IsOptional()
  @IsBoolean()
  openToWork?: boolean;

  @ApiPropertyOptional({ description: 'Perfil visible para otros negocios' })
  @IsOptional()
  @IsBoolean()
  profileVisible?: boolean;
}
