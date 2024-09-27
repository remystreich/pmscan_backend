import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { DataSource } from 'typeorm';

describe('App', () => {
  let appController: AppController;
  let appService: AppService;
  let cacheManager: any;
  let dataSource: any;

  beforeEach(async () => {
    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    dataSource = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  describe('AppController', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });

    it('should return status', async () => {
      const mockStatus = {
        status: 'Application running',
        postgres: 'ok',
        cache: 'ok',
      };
      jest.spyOn(appService, 'getStatus').mockResolvedValue(mockStatus);

      const result = await appController.getStatus();
      expect(result).toEqual(mockStatus);
    });
  });

  describe('AppService', () => {
    it('should return "Hello World!"', () => {
      expect(appService.getHello()).toBe('Hello World!');
    });

    it('should return status with postgres and cache ok', async () => {
      dataSource.query.mockResolvedValue([]);
      cacheManager.set.mockResolvedValue(undefined);
      cacheManager.get.mockResolvedValue('ok');

      const result = await appService.getStatus();
      expect(result).toEqual({
        status: 'Application running',
        postgres: 'ok',
        cache: 'ok',
      });
    });

    it('should return status with postgres error', async () => {
      dataSource.query.mockRejectedValue(new Error('DB error'));
      cacheManager.set.mockResolvedValue(undefined);
      cacheManager.get.mockResolvedValue('ok');

      const result = await appService.getStatus();
      expect(result).toEqual({
        status: 'Application running',
        postgres: 'error: DB error',
        cache: 'ok',
      });
    });

    it('should return status with cache error', async () => {
      dataSource.query.mockResolvedValue([]);
      cacheManager.set.mockResolvedValue(undefined);
      cacheManager.get.mockResolvedValue(null);

      const result = await appService.getStatus();
      expect(result).toEqual({
        status: 'Application running',
        postgres: 'ok',
        cache: 'error',
      });
    });
  });
});
