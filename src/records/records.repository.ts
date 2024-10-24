import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, Record } from '@prisma/client';

@Injectable()
export class RecordsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.RecordCreateInput): Promise<Record> {
    return this.prisma.record.create({
      data: {
        data: data.data,
        pmScan: { connect: { id: data.pmScan.connect.id } },
      },
    });
  }

  async findAll(): Promise<Record[]> {
    return this.prisma.record.findMany();
  }

  async findAllFromPmScan(pmScanId: number): Promise<Record[]> {
    return this.prisma.record.findMany({ where: { pmScanId } });
  }

  async findOne(id: number): Promise<Record | null> {
    return this.prisma.record.findUnique({ where: { id } });
  }

  async update(id: number, data: Prisma.RecordUpdateInput): Promise<Record> {
    return this.prisma.record.update({ where: { id }, data });
  }

  async delete(id: number): Promise<Record> {
    return this.prisma.record.delete({ where: { id } });
  }
}
