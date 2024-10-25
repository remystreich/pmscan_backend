import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthchecksService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private prisma: PrismaService,
  ) {}

  async getStatus(): Promise<{
    status: string;
    postgres: string;
    cache: string;
  }> {
    let dbStatus = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      dbStatus = 'error: ' + error.message;
    }
    //check redis
    await this.cacheManager.set('test', 'ok', 20);
    const cacheStatus = (await this.cacheManager.get('test')) as string;

    return {
      status: 'Application running',
      postgres: dbStatus,
      cache: cacheStatus || 'error',
    };
  }
}
