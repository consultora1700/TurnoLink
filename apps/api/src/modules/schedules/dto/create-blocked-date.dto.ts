import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, Matches, MaxLength } from 'class-validator';

export class CreateBlockedDateDto {
  @ApiProperty({ example: '2024-01-15', description: 'Date in YYYY-MM-DD format' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format',
  })
  date: string;

  @ApiPropertyOptional({ example: 'Holiday' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reason?: string;
}
