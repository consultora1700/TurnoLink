import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsIn,
  MinLength,
  MaxLength,
  Matches,
  ValidateIf,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'My Barbershop' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  businessName?: string;

  @ApiPropertyOptional({ example: 'my-barbershop' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug can only contain lowercase letters, numbers, and hyphens',
  })
  businessSlug?: string;

  @ApiPropertyOptional({ example: 'BUSINESS', enum: ['BUSINESS', 'PROFESSIONAL'] })
  @IsOptional()
  @IsIn(['BUSINESS', 'PROFESSIONAL'])
  accountType?: 'BUSINESS' | 'PROFESSIONAL';

  @ApiPropertyOptional({ example: 'My Company' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  companyName?: string;

  @ApiPropertyOptional({ example: 'Estilista' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  specialty?: string;

  @ApiPropertyOptional({ example: 'estetica-belleza' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;
}
