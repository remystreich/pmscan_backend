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
  ],
})
export class AppModule {}
