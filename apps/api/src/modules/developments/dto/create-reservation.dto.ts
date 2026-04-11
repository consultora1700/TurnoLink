import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty()
  @IsString()
  reservedByName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reservedByPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  reservedByEmail?: string;
}
