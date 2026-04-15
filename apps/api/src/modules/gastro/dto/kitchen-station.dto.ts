import { IsString, IsOptional, IsBoolean, IsInt, Min, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKitchenStationDto {
  @ApiProperty({ example: 'Cocina Caliente' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'COCINA CALIENTE' })
  @IsString()
  displayName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  printerId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  printerName?: string;
}

export class UpdateKitchenStationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  printerId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  printerName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class RegisterPrintersDto {
  @ApiProperty()
  printers: {
    id: string;
    name: string;
    type: 'usb' | 'network';
    address?: string;
    online: boolean;
  }[];
}

export class UpdateComandaStatusDto {
  @ApiProperty({ example: 'ACCEPTED' })
  @IsString()
  status: string; // ACCEPTED, PREPARING, READY, CANCELLED
}

export class AssignProductStationDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  kitchenStationId?: string | null;
}

export class BulkAssignStationDto {
  @ApiProperty({ type: [AssignProductStationDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AssignProductStationDto)
  assignments: AssignProductStationDto[];
}
