import { Injectable } from '@nestjs/common';
import { RefreshTokensRepository } from './refresh-tokens.repository';
import * as crypto from 'crypto';

@Injectable()
export class RefreshTokensService {
  constructor(private refreshTokensRepository: RefreshTokensRepository) {}

  async storeRefreshToken(
    tokenId: string,
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const hashedToken = this.hashToken(refreshToken);
    await this.refreshTokensRepository.storeToken(
      `refresh_token:${tokenId}`,
      { userId, token: hashedToken },
      10 * 24 * 60 * 60 * 1000, // 10 jours ms
    );
  }

  async getRefreshTokenData(
    tokenId: string,
  ): Promise<{ userId: number; token: string } | null> {
    return this.refreshTokensRepository.getToken(`refresh_token:${tokenId}`);
  }

  async deleteRefreshToken(tokenId: string): Promise<void> {
    await this.refreshTokensRepository.deleteToken(`refresh_token:${tokenId}`);
  }

  public hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
