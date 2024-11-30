import { IsString, IsNotEmpty, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePmscanDto {
  @ApiProperty({
    description: 'The name of the pmscan',
    example: 'PMScan 1',
  })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({
    description: 'The device name of the pmscan',
    example: 'PMScan136476',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^PMScan[A-Za-z0-9]{6}$/, {
    message:
      'deviceName must start with "PMScan" followed by 6 alphanumeric characters',
  })
  deviceName: string;

  @ApiProperty({
    description: 'The display settings of the LEDs of the pmscan',
    example: 'lgAsAfQBIAP//w==',
  })
  @IsNotEmpty()
  @IsString()
  display: string;
}
