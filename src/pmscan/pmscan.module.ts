import { Module } from '@nestjs/common';
import { PmscanService } from './pmscan.service';
import { PmscanController } from './pmscan.controller';
import { PmscanRepository } from './pmscan.repository';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [PmscanController],
  providers: [PmscanService, PmscanRepository],
  imports: [UsersModule],
  exports: [PmscanService],
})
export class PmscanModule {}
