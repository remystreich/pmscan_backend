import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRecordDto {
  @ApiProperty({
    description: 'The data of the record',
    example:
      'MDEwMjAzMDQwNTA2MDcwODA5MEEwQjBDMEQwRTBGMTAxMTEyMTMxNDE1MTYxNzE4MTkxQTFCMUMxRDFFMUYyMDIxMjIyMzI0MjUyNjI3MjgyOTJBMkIyQzJEMkUyRjMwMzEzMjMzMzQzNTM2MzczODM5M0EzQjNDM0QzRTNGNDA=',
  })
  @IsNotEmpty()
  @IsString()
  data: string;

  @ApiProperty({
    description: 'The name of the record',
    example: 'Record 1',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'The type of the record',
    example: 'Datalogger record',
  })
  @IsString()
  type: string;
}
