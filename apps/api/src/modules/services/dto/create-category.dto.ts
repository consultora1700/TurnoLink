import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Cortes' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}
