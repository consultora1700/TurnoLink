import { IsString, IsOptional, IsBoolean, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExperienceDto {
  @ApiProperty({ description: 'Nombre del negocio' })
  @IsString()
  @MaxLength(200)
  businessName: string;

  @ApiProperty({ description: 'Rol/puesto' })
  @IsString()
  @MaxLength(200)
  role: string;

  @ApiProperty({ description: 'Fecha de inicio (ISO)' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ description: 'Fecha de fin (ISO)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Es el trabajo actual' })
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @ApiPropertyOptional({ description: 'Descripción del puesto' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
