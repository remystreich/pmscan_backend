import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { RefreshTokensModule } from './refresh-tokens/refresh-tokens.module';
import { PmscanModule } from './pmscan/pmscan.module';
import { RecordsModule } from './records/records.module';
import { HealthchecksModule } from './healthchecks/healthchecks.module';
import { EmailModule } from './email/email.module';
import { ResetPasswordTokensModule } from './reset-password-tokens/reset-password-tokens.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'redis',
            port: parseInt(process.env.REDIS_PORT || '6379'),
          },
          password: process.env.REDIS_PASSWORD,
        }),
      }),
    }),
    AuthModule,
    UsersModule,
    PrismaModule,
    RefreshTokensModule,
    PmscanModule,
    RecordsModule,
    HealthchecksModule,
    EmailModule,
    ResetPasswordTokensModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
