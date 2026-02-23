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

  @ApiProperty({
    description: 'TOTP code for 2FA verification',
    example: '123456',
  })
  @IsString()
  totpCode: string;
}

export class DisconnectMercadoPagoDto {
  @ApiProperty({
    description: 'TOTP code for 2FA verification',
    example: '123456',
  })
  @IsString()
  totpCode: string;
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
