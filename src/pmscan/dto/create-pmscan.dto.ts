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
    description: 'The device id of the pmscan',
    example: 'FF:9C:95:3E:A9:F9',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/, {
    message:
      'deviceId must be in the format XX:XX:XX:XX:XX:XX where X is a hexadecimal digit',
  })
  deviceId: string;

  @ApiProperty({
    description: 'The device name of the pmscan',
    example: 'PMScan136476',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^PMScan\d{6}$/, {
    message: 'deviceName must start with "PMScan" followed by 6 digits',
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
