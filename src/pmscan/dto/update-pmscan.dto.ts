import { PartialType } from '@nestjs/swagger';
import { CreatePmscanDto } from './create-pmscan.dto';

export class UpdatePmscanDto extends PartialType(CreatePmscanDto) {}
