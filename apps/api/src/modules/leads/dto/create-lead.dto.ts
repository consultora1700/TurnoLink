import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsIn, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLeadDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dni?: string;

  @ApiPropertyOptional({ default: 'manual' })
  @IsOptional()
  @IsIn(['manual', 'whatsapp', 'web', 'referido', 'portal'])
  source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sourceDetail?: string;

  @ApiPropertyOptional({ default: 'nuevo' })
  @IsOptional()
  @IsIn(['nuevo', 'contactado', 'visita', 'oferta', 'reserva', 'escritura', 'cerrado', 'perdido'])
  stage?: string;

  @ApiPropertyOptional({ default: 'media' })
  @IsOptional()
  @IsIn(['baja', 'media', 'alta'])
  priority?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['compra', 'alquiler', 'inversion'])
  interestType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  interestDetail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unitId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  budget?: number;

  @ApiPropertyOptional({ default: 'USD' })
  @IsOptional()
  @IsString()
  budgetCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  nextFollowUpAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
