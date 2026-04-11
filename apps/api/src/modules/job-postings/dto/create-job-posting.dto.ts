import { IsString, IsOptional, IsInt, IsNumber, MaxLength, Min, Max, IsIn, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

const VALID_CATEGORIES = [
  'estetica-belleza',
  'barberia',
  'peluqueria',
  'spa-masajes',
  'fitness-deporte',
  'salud-bienestar',
  'gastronomia',
  'educacion-capacitacion',
  'consultoria',
  'tecnologia',
  'servicios-profesionales',
  'otros',
];

export class CreateJobPostingDto {
  @ApiProperty({ description: 'Título de la oferta', example: 'Peluquero/a con experiencia' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Descripción completa de la oferta' })
  @IsString()
  @MaxLength(5000)
  description: string;

  @ApiProperty({ description: 'Categoría de la oferta', enum: VALID_CATEGORIES })
  @IsString()
  @IsIn(VALID_CATEGORIES)
  category: string;

  @ApiPropertyOptional({ description: 'Habilidades requeridas (JSON string array)' })
  @IsOptional()
  @IsString()
  requiredSkills?: string;

  @ApiPropertyOptional({ description: 'Disponibilidad: full-time, part-time, freelance' })
  @IsOptional()
  @IsString()
  @IsIn(['full-time', 'part-time', 'freelance'])
  availability?: string;

  @ApiPropertyOptional({ description: 'Años mínimos de experiencia' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(50)
  minExperience?: number;

  @ApiPropertyOptional({ description: 'Zona de trabajo' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  zone?: string;

  @ApiPropertyOptional({ description: 'Salario mínimo' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salaryMin?: number;

  @ApiPropertyOptional({ description: 'Salario máximo' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salaryMax?: number;

  @ApiPropertyOptional({ description: 'Moneda del salario', default: 'ARS' })
  @IsOptional()
  @IsString()
  salaryCurrency?: string;

  @ApiPropertyOptional({ description: 'Periodo salarial: monthly, hourly, project' })
  @IsOptional()
  @IsString()
  @IsIn(['monthly', 'hourly', 'project'])
  salaryPeriod?: string;

  @ApiPropertyOptional({ description: 'Fecha límite (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional({ description: 'Máximo de postulaciones' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxApplications?: number;
}
