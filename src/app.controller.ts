import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
@ApiTags('status')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get the status of the API' })
  @ApiResponse({ status: 200, description: 'API is running' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/status')
  @ApiOperation({ summary: 'Get the status of the API' })
  @ApiResponse({ status: 200, description: 'API is running' })
  async getStatus() {
    return this.appService.getStatus();
  }
}
