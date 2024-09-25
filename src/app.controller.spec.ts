import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return status of PostgreSQL and Redis', async () => {
      const result = await appController.getHello();
      expect(result).toContain('Hello World!');
      expect(result).toContain('PostgreSQL:');
      expect(result).toContain('Redis:');
    });
  });
});
