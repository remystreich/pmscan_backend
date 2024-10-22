import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, PMScan } from '@prisma/client';

@Injectable()
export class PmscanRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.PMScanCreateInput): Promise<PMScan> {
    return this.prisma.pMScan.create({
      data: {
        name: data.name,
        deviceId: data.deviceId,
        deviceName: data.deviceName,
        display: data.display,
        user: { connect: { id: data.user.connect.id } },
      },
    });
  }

  async findAll(): Promise<PMScan[]> {
    return this.prisma.pMScan.findMany();
  }

  async findAllFromUser(userId: number): Promise<PMScan[]> {
    return this.prisma.pMScan.findMany({ where: { userId } });
  }

  async findOne(id: number): Promise<PMScan | null> {
    return this.prisma.pMScan.findUnique({ where: { id } });
  }

  async update(id: number, data: Prisma.PMScanUpdateInput): Promise<PMScan> {
    return this.prisma.pMScan.update({ where: { id }, data });
  }

  async delete(id: number): Promise<PMScan> {
    return this.prisma.pMScan.delete({ where: { id } });
  }
}
