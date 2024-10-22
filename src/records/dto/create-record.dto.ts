import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRecordDto {
  @IsNotEmpty()
  @IsString()
  data: string;

  @IsOptional()
  @IsString()
  name?: string;
}
