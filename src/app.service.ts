import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AppService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly dataSource: DataSource,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getStatus(): Promise<{
    status: string;
    postgres: string;
    cache: string;
  }> {
    let dbStatus = 'ok';
    try {
      await this.dataSource.query('SELECT 1');
    } catch (error) {
      dbStatus = 'error: ' + error.message;
    }

    await this.cacheManager.set('test', 'ok', 20);
    const cacheStatus = (await this.cacheManager.get('test')) as string;

    return {
      status: 'Application running',
      postgres: dbStatus,
      cache: cacheStatus || 'error',
    };
  }
}
