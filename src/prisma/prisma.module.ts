import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IsEmailUniqueConstraint } from './isEmailUniqueConstraint.validator';

@Global()
@Module({
  providers: [PrismaService, IsEmailUniqueConstraint],
  exports: [PrismaService, IsEmailUniqueConstraint],
})
export class PrismaModule {}
