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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PmscanService,
        {
          provide: PmscanRepository,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PmscanService>(PmscanService);
    pmscanRepository = module.get<PmscanRepository>(PmscanRepository);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const user: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('create', () => {
    it('should create a new pmscan', async () => {
      const createPmscanDto: CreatePmscanDto = {
        name: 'Test PMScan',
        deviceId: 'device123',
        deviceName: 'TestDevice',
        display: 'base64encodedstring',
        userId: 1,
      };

      const createdPmscan: PMScan = {
        id: 1,
        name: createPmscanDto.name,
        deviceId: createPmscanDto.deviceId,
        deviceName: createPmscanDto.deviceName,
        display: Buffer.from(createPmscanDto.display, 'base64'),
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);
      jest.spyOn(pmscanRepository, 'create').mockResolvedValue(createdPmscan);

      const result = await service.create(createPmscanDto, user.id);

      expect(usersService.findOne).toHaveBeenCalledWith(user.id);
      expect(pmscanRepository.create).toHaveBeenCalledWith({
        name: createPmscanDto.name,
        deviceId: createPmscanDto.deviceId,
        deviceName: createPmscanDto.deviceName,
        display: Buffer.from(createPmscanDto.display, 'base64'),
        user: { connect: { id: user.id } },
      });
      expect(result).toEqual(createdPmscan);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const createPmscanDto: CreatePmscanDto = {
        name: 'Test PMScan',
        deviceId: 'device123',
        deviceName: 'TestDevice',
        display: 'base64encodedstring',
        userId: 1,
      };

      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);

      await expect(service.create(createPmscanDto, user.id)).rejects.toThrow(
        NotFoundException,
      );
      expect(usersService.findOne).toHaveBeenCalledWith(user.id);
      expect(pmscanRepository.create).not.toHaveBeenCalled();
    });
  });
});
