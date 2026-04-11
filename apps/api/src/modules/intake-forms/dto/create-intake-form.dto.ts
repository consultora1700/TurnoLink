import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray, IsInt, MaxLength } from 'class-validator';

export class IntakeFormFieldDto {
  @IsString()
  id: string;

  @IsString()
  type: string; // text | textarea | select | checkbox | radio | date | phone | email | number

  @IsString()
  label: string;

  @IsBoolean()
  required: boolean;

  @IsOptional()
  @IsString()
  placeholder?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[]; // For select/radio/checkbox

  @IsOptional()
  @IsString()
  helpText?: string;
}

export class CreateIntakeFormDto {
  @ApiProperty({ example: 'Formulario de admisión' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ type: [IntakeFormFieldDto] })
  @IsArray()
  fields: IntakeFormFieldDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  order?: number;
}
