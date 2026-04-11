import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetVideoOAuthUrlDto {
  @ApiProperty({
    description: 'Video provider to connect',
    enum: ['zoom', 'google_meet'],
  })
  @IsString()
  @IsIn(['zoom', 'google_meet'])
  provider: string;
}
