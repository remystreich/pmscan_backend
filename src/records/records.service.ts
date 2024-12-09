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

  async findOne(id: number, userId: number) {
    const record = await this.recordsRepository.findOne(id);
    if (!record) {
      throw new NotFoundException('Record not found');
    }
    await this.checkOwnership(userId, record);
    return record;
  }

  private async checkOwnership(userId: number, record: Record) {
    const pmScan = await this.pmScansService.findOne(record.pmScanId, userId);
    if (!pmScan) {
      throw new ForbiddenException('You are not allowed to access this record');
    }
  }

  async create(
    createRecordDto: CreateRecordDto,
    pmScanId: number,
    userId: number,
  ) {
    const pmScan = await this.pmScansService.findOne(pmScanId, userId);
    if (!pmScan) {
      throw new NotFoundException('PMScan not found');
    }
    const nameDefault = `${pmScan.name}_${new Date().toISOString().split('.')[0]}`;
    const record = {
      data: Buffer.from(createRecordDto.data, 'base64'),
      name: createRecordDto.name || nameDefault,
      pmScan: { connect: { id: pmScanId } },
      type: createRecordDto.type,
    };
    return this.recordsRepository.create(record);
  }

  async updateName(id: number, name: string, userId: number) {
    const record = await this.recordsRepository.findOne(id);
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
    const record = await this.recordsRepository.findOne(id);
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

    // records.forEach((record) => {
    //   this.checkOwnership(userId, record);
    // });

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

  async appendData(id: number, newData: string, userId: number) {
    const record = await this.recordsRepository.findOne(id);
    if (!record) {
      throw new NotFoundException('Record not found');
    }
    await this.checkOwnership(userId, record);

    const newDataBuffer = Buffer.from(newData, 'base64');
    const updatedData = Buffer.concat([record.data, newDataBuffer]);
    const updatedRecord = {
      data: updatedData,
    };

    return this.recordsRepository.update(id, updatedRecord);
  }
}
