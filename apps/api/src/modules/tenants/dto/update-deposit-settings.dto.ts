import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsString,
  IsIn,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

export class UpdateDepositSettingsDto {
  @ApiPropertyOptional({
    description: 'Whether deposits are required for bookings',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  requireDeposit?: boolean;

  @ApiPropertyOptional({
    description: 'Deposit percentage of the service price (1-100)',
    example: 30,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  depositPercentage?: number;

  @ApiPropertyOptional({
    description: 'Payment mode for deposits',
    enum: ['simulated', 'mercadopago'],
    example: 'mercadopago',
  })
  @IsOptional()
  @IsString()
  @IsIn(['simulated', 'mercadopago'])
  depositMode?: 'simulated' | 'mercadopago';

  @ApiPropertyOptional({
    description: 'TOTP code for 2FA verification (only required for sensitive MP operations)',
    example: '123456',
  })
  @IsOptional()
  @IsString()
  totpCode?: string;
}
