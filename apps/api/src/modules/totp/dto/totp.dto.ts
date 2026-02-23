import { IsString, Length } from 'class-validator';

export class VerifyTotpDto {
  @IsString()
  @Length(6, 6)
  code: string;
}

export class Login2FADto {
  @IsString()
  tempToken: string;

  @IsString()
  @Length(6, 8) // 6 for TOTP, 8 for backup codes
  code: string;
}

export class DisableTotpDto {
  @IsString()
  @Length(6, 8) // 6 for TOTP, 8 for backup codes
  code: string;
}
