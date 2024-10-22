import { Module } from '@nestjs/common';
import { RecordsService } from './records.service';
import { RecordsController } from './records.controller';
import { RecordsRepository } from './records.repository';
import { PmscanModule } from '../pmscan/pmscan.module';

@Module({
  controllers: [RecordsController],
  providers: [RecordsService, RecordsRepository],
  imports: [PmscanModule],
})
export class RecordsModule {}
