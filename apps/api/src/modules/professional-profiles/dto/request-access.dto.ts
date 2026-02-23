import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestAccessDto {
  @ApiProperty({ description: 'Email del empleado' })
  @IsEmail()
  email: string;
}
