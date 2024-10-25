import { Test, TestingModule } from '@nestjs/testing';
import { PmscanController } from './pmscan.controller';
import { PmscanService } from './pmscan.service';
import { CreatePmscanDto } from './dto/create-pmscan.dto';
import { UpdatePmscanDto } from './dto/update-pmscan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '@prisma/client';

describe('PmscanController', () => {
  let controller: PmscanController;
  let service: PmscanService;
  let mockUser: User;
  let mockPmscan;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PmscanController],
      providers: [
        {
          provide: PmscanService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findAllFromUser: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PmscanController>(PmscanController);
    service = module.get<PmscanService>(PmscanService);

    mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'password',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPmscan = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      display: Buffer.from('test'),
      name: 'Test PMScan',
      deviceId: 'FF:9C:95:3E:A9:F9',
      deviceName: 'PMScan123456',
      userId: 1,
    };
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a pmscan', async () => {
      const createPmscanDto: CreatePmscanDto = {
        name: 'Test PMScan',
        deviceId: 'FF:9C:95:3E:A9:F9',
        deviceName: 'PMScan123456',
        display: 'base64encodedstring',
      };
      jest.spyOn(service, 'create').mockResolvedValue(mockPmscan);

      const result = await controller.create(createPmscanDto, mockUser);
      expect(result).toEqual(mockPmscan);
      expect(service.create).toHaveBeenCalledWith(createPmscanDto, mockUser.id);
    });
  });

  describe('findOne', () => {
    it('should find a pmscan by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockPmscan);

      const result = await controller.findOne('1', mockUser);
      expect(result).toEqual(mockPmscan);
      expect(service.findOne).toHaveBeenCalledWith(1, mockUser.id);
    });
  });

  describe('update', () => {
    it('should update a pmscan', async () => {
      const updatePmscanDto: UpdatePmscanDto = { name: 'Updated PMScan' };
      const updatedMockPmscan = { ...mockPmscan, name: 'Updated PMScan' };
      jest.spyOn(service, 'update').mockResolvedValue(updatedMockPmscan);

      const result = await controller.update('1', updatePmscanDto, mockUser);
      expect(result).toEqual(updatedMockPmscan);
      expect(service.update).toHaveBeenCalledWith(
        1,
        updatePmscanDto,
        mockUser.id,
      );
    });
  });

  describe('remove', () => {
    it('should remove a pmscan', async () => {
      const expectedResult = { message: 'PMScan supprimé avec succès' };
      jest.spyOn(service, 'remove').mockResolvedValue(expectedResult);

      const result = await controller.remove('1', mockUser);
      expect(result).toEqual(expectedResult);
      expect(service.remove).toHaveBeenCalledWith(1, mockUser.id);
    });
  });

  describe('findAllFromUser', () => {
    it('should find all pmscans for a user', async () => {
      jest.spyOn(service, 'findAllFromUser').mockResolvedValue([mockPmscan]);

      const result = await controller.findAllFromUser(mockUser);
      expect(result).toEqual([mockPmscan]);
      expect(service.findAllFromUser).toHaveBeenCalledWith(mockUser.id);
    });
  });
});
