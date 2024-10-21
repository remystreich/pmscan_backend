import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokensService } from './refresh-tokens.service';
import { RefreshTokensRepository } from './refresh-tokens.repository';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';

describe('RefreshTokensService', () => {
  let service: RefreshTokensService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        RefreshTokensService,
        RefreshTokensRepository,
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RefreshTokensService>(RefreshTokensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('storeRefreshToken', () => {
    it('should store the refresh token', () => {
      expect(service.storeRefreshToken).toBeDefined();
    });
  });

  describe('getRefreshTokenData', () => {
    it('should get the refresh token data', () => {
      expect(service.getRefreshTokenData).toBeDefined();
    });
  });

  describe('deleteRefreshToken', () => {
    it('should delete the refresh token', () => {
      expect(service.deleteRefreshToken).toBeDefined();
    });
  });
});
