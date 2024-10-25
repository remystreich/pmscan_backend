import { Module } from '@nestjs/common';
import { ResetPasswordTokensService } from './reset-password-tokens.service';
import { ResetPasswordTokensRepository } from './reset-password-tokens.repository';

@Module({
  providers: [ResetPasswordTokensService, ResetPasswordTokensRepository],
  exports: [ResetPasswordTokensService],
})
export class ResetPasswordTokensModule {}
