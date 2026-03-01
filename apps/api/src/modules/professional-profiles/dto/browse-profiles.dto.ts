import { IsOptional, IsString, IsBoolean, IsInt, Min, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BrowseProfilesDto {
  @ApiPropertyOptional({ description: 'Buscar por nombre, titular o especialidad' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrar por especialidad' })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiPropertyOptional({ description: 'Filtrar por categoría predefinida' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filtrar por disponibilidad: full-time, part-time, freelance' })
  @IsOptional()
  @IsString()
  availability?: string;

  @ApiPropertyOptional({ description: 'Solo abiertos a oportunidades' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  openToWork?: boolean;

  @ApiPropertyOptional({ description: 'Filtrar por zona/ubicación (busca en preferredZones)' })
  @IsOptional()
  @IsString()
  zone?: string;

  @ApiPropertyOptional({ description: 'Experiencia mínima en años' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minExperience?: number;

  @ApiPropertyOptional({ description: 'Filtrar por habilidad (busca en skills)' })
  @IsOptional()
  @IsString()
  skills?: string;

  @ApiPropertyOptional({
    description: 'Ordenar por: recent (más recientes), experience (más experiencia), name (nombre)',
    default: 'recent',
  })
  @IsOptional()
  @IsString()
  @IsIn(['recent', 'experience', 'name'])
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Página', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Resultados por página', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
