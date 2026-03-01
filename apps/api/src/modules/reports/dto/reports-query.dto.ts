import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn, Matches } from 'class-validator';

export class ReportsQueryDto {
  @ApiPropertyOptional({ enum: ['7d', '30d', '90d', 'custom'], default: '30d' })
  @IsOptional()
  @IsIn(['7d', '30d', '90d', 'custom'])
  period?: '7d' | '30d' | '90d' | 'custom' = '30d';

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate must be YYYY-MM-DD' })
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-01-31' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'endDate must be YYYY-MM-DD' })
  endDate?: string;

  @ApiPropertyOptional({ description: 'Branch ID for filtering (complete_reports only)' })
  @IsOptional()
  @IsString()
  branchId?: string;
}
