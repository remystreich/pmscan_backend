import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRecordDto } from './dto/create-record.dto';
import { RecordsRepository } from './records.repository';
import { ForbiddenException } from '@nestjs/common';
import { Record } from '@prisma/client';
import { PmscanService } from '../pmscan/pmscan.service';

@Injectable()
export class RecordsService {
  constructor(
    private readonly recordsRepository: RecordsRepository,
    private readonly pmScansService: PmscanService,
  ) {}

  private async findOne(id: number) {
    return this.recordsRepository.findOne(id);
  }

  private async checkOwnership(userId: number, record: Record) {
    const pmScan = await this.pmScansService.findOne(record.pmScanId, userId);
    if (!pmScan) {
      throw new ForbiddenException('You are not allowed to access this record');
    }
  }

  async create(createRecordDto: CreateRecordDto, pmScanId: number) {
    const record = {
      data: Buffer.from(createRecordDto.data, 'base64'),
      pmScan: { connect: { id: pmScanId } },
    };
    return this.recordsRepository.create(record);
  }

  async updateName(id: number, name: string, userId: number) {
    const record = await this.findOne(id);
    if (!record) {
      throw new NotFoundException('Record not found');
    }
    await this.checkOwnership(userId, record);
    const updatedRecord = {
      name,
    };
    return this.recordsRepository.update(id, updatedRecord);
  }

  async remove(id: number, userId: number) {
    const record = await this.findOne(id);
    if (!record) {
      throw new NotFoundException('Record not found');
    }
    await this.checkOwnership(userId, record);
    await this.recordsRepository.delete(id);
    return { message: 'Record deleted successfully' };
  }

  async findAllFromPmScan(
    pmScanId: number,
    userId: number,
    page: number = 1,
    limit: number = 10,
  ) {
    const pmScan = await this.pmScansService.findOne(pmScanId, userId);
    if (!pmScan) {
      throw new ForbiddenException(
        'You are not allowed to access these records',
      );
    }

    const skip = (page - 1) * limit;
    const { records, total } = await this.recordsRepository.findAllFromPmScan(
      pmScanId,
      skip,
      limit,
    );

    return {
      records,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
