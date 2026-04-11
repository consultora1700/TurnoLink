import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateJobPostingDto } from './create-job-posting.dto';

export class UpdateJobPostingDto extends PartialType(CreateJobPostingDto) {
  @ApiPropertyOptional({ description: 'Estado: OPEN, PAUSED, CLOSED' })
  @IsOptional()
  @IsString()
  @IsIn(['OPEN', 'PAUSED', 'CLOSED'])
  status?: string;
}
