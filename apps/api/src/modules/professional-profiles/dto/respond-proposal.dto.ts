import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RespondProposalDto {
  @ApiProperty({ description: 'Estado: ACCEPTED o REJECTED' })
  @IsString()
  @IsIn(['ACCEPTED', 'REJECTED'])
  status: 'ACCEPTED' | 'REJECTED';

  @ApiPropertyOptional({ description: 'Mensaje de respuesta' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  responseMessage?: string;
}
