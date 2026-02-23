import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class PushSubscriptionDto {
  @IsUrl()
  @IsNotEmpty()
  endpoint: string;

  @IsString()
  @IsNotEmpty()
  p256dh: string;

  @IsString()
  @IsNotEmpty()
  auth: string;
}
