import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProposalDto {
  @ApiProperty({ description: 'Puesto ofrecido' })
  @IsString()
  @MaxLength(200)
  role: string;

  @ApiProperty({ description: 'Mensaje del negocio' })
  @IsString()
  @MaxLength(2000)
  message: string;

  @ApiPropertyOptional({ description: 'Disponibilidad: full-time, part-time, freelance' })
  @IsOptional()
  @IsString()
  availability?: string;
}
