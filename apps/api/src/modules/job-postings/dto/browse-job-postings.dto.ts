import { IsOptional, IsString, IsInt, IsIn, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class BrowseJobPostingsDto {
  @ApiPropertyOptional({ description: 'Buscar por título o descripción' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrar por categoría' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filtrar por disponibilidad: full-time, part-time, freelance' })
  @IsOptional()
  @IsString()
  availability?: string;

  @ApiPropertyOptional({ description: 'Filtrar por zona' })
  @IsOptional()
  @IsString()
  zone?: string;

  @ApiPropertyOptional({ description: 'Filtrar por habilidad requerida' })
  @IsOptional()
  @IsString()
  skills?: string;

  @ApiPropertyOptional({ description: 'Experiencia máxima requerida (para filtrar ofertas alcanzables)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxExperienceRequired?: number;

  @ApiPropertyOptional({ description: 'Ordenar: recent, salary, deadline', default: 'recent' })
  @IsOptional()
  @IsString()
  @IsIn(['recent', 'salary', 'deadline'])
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
