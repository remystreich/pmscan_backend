import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ResetPasswordTokensRepository {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async storeToken(key: string, value: any, ttl: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async getToken(key: string): Promise<any> {
    return this.cacheManager.get(key);
  }

  async deleteToken(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }
}
