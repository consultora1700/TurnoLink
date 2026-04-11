import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsDateString, MaxLength } from 'class-validator';

export class CreateSorteoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowPublicRegistration?: boolean;

  @ApiPropertyOptional({ description: 'JSON array: [{name, description, color, weight}]' })
  @IsOptional()
  @IsString()
  prizes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  drawDate?: string;
}
