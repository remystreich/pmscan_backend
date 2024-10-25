import { Controller, Get } from '@nestjs/common';
import { HealthchecksService } from './healthchecks.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('healthchecks')
@Controller('healthchecks')
export class HealthchecksController {
  constructor(private readonly healthchecksService: HealthchecksService) {}

  @Get('')
  @ApiOperation({ summary: 'Get the status of the API' })
  @ApiResponse({ status: 200, description: 'API is running' })
  async getStatus() {
    return this.healthchecksService.getStatus();
  }
}
