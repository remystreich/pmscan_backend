import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRecordDto } from './dto/create-record.dto';
import { RecordsRepository } from './records.repository';
import { ForbiddenException } from '@nestjs/common';
import { Record } from '@prisma/client';
import { PmscanService } from '../pmscan/pmscan.service';
import * as fastcsv from 'fast-csv';
import * as fs from 'fs';
import * as path from 'path';

interface ExportResult {
  filePath: string;
  fileName: string;
}

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
    console.log(record);
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

  async exportToCsv(id: number, userId: number) {
    const record = await this.findOne(id, userId);

    const fileName = `${record.name}.csv`;
    const filePath = path.join(process.cwd(), 'exports', fileName);
    if (!fs.existsSync('exports')) {
      fs.mkdirSync('exports');
    }

    const parsedData = this.parseBuffer(record.data);
    return new Promise<ExportResult>((resolve, reject) => {
      fastcsv
        .writeToPath(filePath, parsedData, { headers: true })
        .on('error', (error) => {
          reject(error);
        })
        .on('finish', () => {
          resolve({ filePath, fileName });
        });
    });
  }

  private parseBuffer(data: Buffer): any[] {
    const dt2000 = 946684800;
    const recordSize = 20;
    const parsedRecords = [];

    for (let i = 0; i < data.length; i += recordSize) {
      const rawData = data.subarray(i, i + recordSize);

      if (rawData.length < recordSize) break;

      const ts2000 =
        ((rawData[3] & 0xff) << 24) |
        ((rawData[2] & 0xff) << 16) |
        ((rawData[1] & 0xff) << 8) |
        (rawData[0] & 0xff);
      const measuredAt = new Date((ts2000 + dt2000) * 1000);

      const record = {
        timestamp: ts2000 + dt2000,
        measuredAt: measuredAt.toISOString(),
        status: rawData[4],
        command: rawData[5],
        pm10pl: (((rawData[7] & 0xff) << 8) | (rawData[6] & 0xff)) / 10,
        pm1gm: (((rawData[9] & 0xff) << 8) | (rawData[8] & 0xff)) / 10,
        pm25gm: (((rawData[11] & 0xff) << 8) | (rawData[10] & 0xff)) / 10,
        pm10gm: (((rawData[13] & 0xff) << 8) | (rawData[12] & 0xff)) / 10,
        temperature: (((rawData[15] & 0xff) << 8) | (rawData[14] & 0xff)) / 10,
        humidity: (((rawData[17] & 0xff) << 8) | (rawData[16] & 0xff)) / 10,
      };

      parsedRecords.push(record);
    }

    return parsedRecords;
  }
}
