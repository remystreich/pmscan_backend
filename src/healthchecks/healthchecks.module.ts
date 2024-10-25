import { Module } from '@nestjs/common';
import { HealthchecksService } from './healthchecks.service';
import { HealthchecksController } from './healthchecks.controller';

@Module({
  controllers: [HealthchecksController],
  providers: [HealthchecksService],
})
export class HealthchecksModule {}
