import { IsString, IsOptional, IsArray, IsBoolean, IsNumber, IsEmail, IsIn, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  credentials?: string;
}

export class ScheduleItemDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty()
  @IsString()
  startTime: string;

  @ApiProperty()
  @IsString()
  endTime: string;

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}

export class UpdateAvailabilityDto {
  @ApiProperty({ type: [ScheduleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleItemDto)
  schedules: ScheduleItemDto[];
}

export class CreateBlockedDateDto {
  @ApiProperty()
  @IsString()
  date: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class InviteEmployeeDto {
  @ApiProperty()
  @IsString()
  employeeId: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsIn(['OWNER', 'MANAGER', 'STAFF', 'VIEWER'])
  role: 'OWNER' | 'MANAGER' | 'STAFF' | 'VIEWER';
}

export class ChangeRoleDto {
  @ApiProperty()
  @IsIn(['OWNER', 'MANAGER', 'STAFF', 'VIEWER'])
  role: 'OWNER' | 'MANAGER' | 'STAFF' | 'VIEWER';
}
