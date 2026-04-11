import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetOAuthUrlDto {
  @ApiPropertyOptional({
    description: 'Whether to use sandbox mode',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isSandbox?: boolean = false;

  @ApiPropertyOptional({
    description: 'TOTP code for 2FA verification (required only when reconnecting)',
    example: '123456',
  })
  @IsOptional()
  @IsString()
  totpCode?: string;
}

export class DisconnectMercadoPagoDto {
  @ApiPropertyOptional({
    description: 'TOTP code for 2FA verification (optional)',
    example: '123456',
  })
  @IsOptional()
  @IsString()
  totpCode?: string;
}

export class CreateDepositPreferenceDto {
  @ApiProperty({
    description: 'The booking ID to create a payment preference for',
  })
  @IsString()
  bookingId: string;

  @ApiPropertyOptional({
    description: 'URL to redirect after successful payment',
  })
  @IsOptional()
  @IsString()
  successUrl?: string;

  @ApiPropertyOptional({
    description: 'URL to redirect after failed payment',
  })
  @IsOptional()
  @IsString()
  failureUrl?: string;

  @ApiPropertyOptional({
    description: 'URL to redirect for pending payment',
  })
  @IsOptional()
  @IsString()
  pendingUrl?: string;
}
