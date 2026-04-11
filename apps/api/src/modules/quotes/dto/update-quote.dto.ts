import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateQuoteStatusDto {
  @ApiProperty({
    description: 'Nuevo estado',
    enum: ['SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
  })
  @IsString()
  @IsIn(['SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'])
  status: string;
}

export class PublicQuoteResponseDto {
  @ApiProperty({ description: 'Acción del cliente', enum: ['ACCEPTED', 'REJECTED'] })
  @IsString()
  @IsIn(['ACCEPTED', 'REJECTED'])
  action: string;

  @ApiProperty({ description: 'Mensaje del cliente', required: false })
  @IsOptional()
  @IsString()
  message?: string;
}
