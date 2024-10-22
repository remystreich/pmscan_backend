import { Test, TestingModule } from '@nestjs/testing';
import { PmscanService } from './pmscan.service';
import { PmscanRepository } from './pmscan.repository';
import { UsersService } from '../users/users.service';
import { NotFoundException } from '@nestjs/common';
import { CreatePmscanDto } from './dto/create-pmscan.dto';
import { PMScan, User } from '@prisma/client';

describe('PmscanService', () => {
  let service: PmscanService;
  let pmscanRepository: PmscanRepository;
  let usersService: UsersService;
  let mockUser: User;
  let mockCreatePmscanDto: CreatePmscanDto;
  let mockCreatedPmscan: PMScan;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PmscanService,
        {
          provide: PmscanRepository,
          useValue: { create: jest.fn() },
        },
        {
          provide: UsersService,
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PmscanService>(PmscanService);
    pmscanRepository = module.get<PmscanRepository>(PmscanRepository);
    usersService = module.get<UsersService>(UsersService);

    mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCreatePmscanDto = {
      name: 'Test PMScan',
      deviceId: 'device123',
      deviceName: 'TestDevice',
      display: 'base64encodedstring',
    };

    mockCreatedPmscan = {
      id: 1,
      name: mockCreatePmscanDto.name,
      deviceId: mockCreatePmscanDto.deviceId,
      deviceName: mockCreatePmscanDto.deviceName,
      display: Buffer.from(mockCreatePmscanDto.display, 'base64'),
      userId: mockUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new pmscan', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
      jest
        .spyOn(pmscanRepository, 'create')
        .mockResolvedValue(mockCreatedPmscan);

      const result = await service.create(mockCreatePmscanDto, mockUser.id);

      expect(usersService.findOne).toHaveBeenCalledWith(mockUser.id);
      expect(pmscanRepository.create).toHaveBeenCalledWith({
        name: mockCreatePmscanDto.name,
        deviceId: mockCreatePmscanDto.deviceId,
        deviceName: mockCreatePmscanDto.deviceName,
        display: Buffer.from(mockCreatePmscanDto.display, 'base64'),
        user: { connect: { id: mockUser.id } },
      });
      expect(result).toEqual(mockCreatedPmscan);
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);

      await expect(
        service.create(mockCreatePmscanDto, mockUser.id),
      ).rejects.toThrow(NotFoundException);
      expect(usersService.findOne).toHaveBeenCalledWith(mockUser.id);
      expect(pmscanRepository.create).not.toHaveBeenCalled();
    });
  });
});
