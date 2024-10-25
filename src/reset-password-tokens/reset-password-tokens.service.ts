import { Injectable } from '@nestjs/common';
import { ResetPasswordTokensRepository } from './reset-password-tokens.repository';
import * as crypto from 'crypto';

@Injectable()
export class ResetPasswordTokensService {
  constructor(
    private resetPasswordTokensRepository: ResetPasswordTokensRepository,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async storeResetPasswordToken(
    tokenId: string,
    userId: number,
    resetPasswordToken: string,
  ): Promise<void> {
    const hashedToken = this.hashToken(resetPasswordToken);
    await this.resetPasswordTokensRepository.storeToken(
      `reset_password_token:${tokenId}`,
      { userId, token: hashedToken },
      60 * 60, // 1 heure en secondes
    );
  }

  async getResetPasswordTokenData(
    tokenId: string,
  ): Promise<{ userId: number; token: string } | null> {
    return this.resetPasswordTokensRepository.getToken(
      `reset_password_token:${tokenId}`,
    );
  }

  async deleteResetPasswordToken(tokenId: string): Promise<void> {
    await this.resetPasswordTokensRepository.deleteToken(
      `reset_password_token:${tokenId}`,
    );
  }
}
