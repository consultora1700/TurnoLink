import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TableSessionStatus } from '@prisma/client';

export class UpdateSessionStatusDto {
  @ApiProperty({ enum: TableSessionStatus })
  @IsEnum(TableSessionStatus)
  status: TableSessionStatus;
}
