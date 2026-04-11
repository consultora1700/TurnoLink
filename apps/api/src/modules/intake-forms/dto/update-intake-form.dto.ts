import { PartialType } from '@nestjs/swagger';
import { CreateIntakeFormDto } from './create-intake-form.dto';

export class UpdateIntakeFormDto extends PartialType(CreateIntakeFormDto) {}
