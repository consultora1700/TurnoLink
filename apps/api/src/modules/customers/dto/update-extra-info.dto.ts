import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject } from 'class-validator';

export class UpdateExtraInfoDto {
  @ApiProperty({ example: 'fichaPaciente' })
  @IsString()
  section: string;

  @ApiProperty({ example: { peso: '75', altura: '170' } })
  @IsObject()
  data: Record<string, unknown>;
}
