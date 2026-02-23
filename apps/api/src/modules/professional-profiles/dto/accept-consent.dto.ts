import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptConsentDto {
  @ApiProperty({ description: 'Si el empleado está abierto a nuevas oportunidades' })
  @IsBoolean()
  openToWork: boolean;
}
