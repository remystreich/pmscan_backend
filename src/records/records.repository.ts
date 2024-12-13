import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, Record } from '@prisma/client';

type RecordData = Omit<Record, 'data'> & { measuresCount: number };
@Injectable()
export class RecordsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.RecordCreateInput): Promise<Record> {
    return this.prisma.record.create({
      data: {
        data: data.data,
        name: data.name,
        pmScan: { connect: { id: data.pmScan.connect.id } },
        type: data.type,
      },
    });
  }

  async findAll(): Promise<Record[]> {
    return this.prisma.record.findMany();
  }

  async findAllFromPmScan(
    pmScanId: number,
    skip: number,
    take: number,
    date?: Date,
  ): Promise<{
    records: RecordData[];
    total: number;
  }> {
    const where = {
      pmScanId,
      ...(date && {
        createdAt: {
          // Filtre pour obtenir les records de la journée spécifiée
          gte: date,
          lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        },
      }),
    };
    const [records, total] = await Promise.all([
      this.prisma.record
        .findMany({
          where,
          select: {
            id: true,
            name: true,
            pmScanId: true,
            createdAt: true,
            updatedAt: true,
            data: true,
            type: true,
          },
          skip,
          take,
        })
        .then((records) =>
          records.map((record) => ({
            ...record,
            measuresCount: record.data.length / 20,
            data: undefined,
          })),
        ),
      this.prisma.record.count({ where: { pmScanId } }),
    ]);

    return { records, total };
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

  async findDistinctDatesForUser(userId: number): Promise<Date[]> {
    const records = await this.prisma.record.findMany({
      where: {
        pmScan: {
          userId: userId,
        },
      },
      select: {
        createdAt: true,
      },
      distinct: ['createdAt'],
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Créer un Set pour dédupliquer les dates
    const uniqueDates = new Set(
      records.map((record) => {
        const date = new Date(record.createdAt);
        date.setHours(0, 0, 0, 0);
        return date.toISOString().split('T')[0]; // Convertir en format YYYY-MM-DD
      }),
    );

    // Convertir le Set en tableau de dates triées
    return Array.from(uniqueDates)
      .map((dateStr) => new Date(dateStr))
      .sort((a, b) => b.getTime() - a.getTime()); // Tri décroissant
  }
}
