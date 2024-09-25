import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return status of PostgreSQL and Redis', async () => {
      jest
        .spyOn(appController, 'checkPostgres')
        .mockImplementation(async () => 'Mocked PostgreSQL Status');
      jest
        .spyOn(appController, 'checkRedis')
        .mockImplementation(async () => 'Mocked Redis Status');

      const result = await appController.getHello();
      expect(result).toContain('Hello World!');
      expect(result).toContain('PostgreSQL: Mocked PostgreSQL Status');
      expect(result).toContain('Redis: Mocked Redis Status');
    });
  });
});
