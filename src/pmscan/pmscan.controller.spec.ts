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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const user: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'password',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('create', () => {
    it('should create a pmscan', async () => {
      const createPmscanDto: CreatePmscanDto = {
        name: 'Test PMScan',
        deviceId: 'FF:9C:95:3E:A9:F9',
        deviceName: 'PMScan123456',
        display: 'base64encodedstring',
        userId: 1,
      };
      const expectedResult = {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        display: Buffer.from(createPmscanDto.display, 'base64'),
        name: 'Test PMScan',
        deviceId: 'FF:9C:95:3E:A9:F9',
        deviceName: 'PMScan123456',
        userId: 1,
      };
      jest.spyOn(service, 'create').mockResolvedValue(expectedResult);

      expect(await controller.create(createPmscanDto, user)).toBe(
        expectedResult,
      );
      expect(service.create).toHaveBeenCalledWith(createPmscanDto, user.id);
    });
  });

  describe('findOne', () => {
    it('should find a pmscan by id', async () => {
      const id = '1';
      const expectedResult = {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        display: Buffer.from('test'),
        name: 'Test PMScan',
        deviceId: 'FF:9C:95:3E:A9:F9',
        deviceName: 'PMScan123456',
        userId: 1,
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(expectedResult);

      expect(await controller.findOne(id, user)).toBe(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(1, user.id);
    });
  });

  describe('update', () => {
    it('should update a pmscan', async () => {
      const id = '1';
      const updatePmscanDto: UpdatePmscanDto = { name: 'Updated PMScan' };
      const expectedResult = {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Updated PMScan',
        display: Buffer.from('test'),
        deviceId: 'FF:9C:95:3E:A9:F9',
        deviceName: 'PMScan123456',
        userId: 1,
      };
      jest.spyOn(service, 'update').mockResolvedValue(expectedResult);

      expect(await controller.update(id, updatePmscanDto, user)).toBe(
        expectedResult,
      );
      expect(service.update).toHaveBeenCalledWith(1, updatePmscanDto, user.id);
    });
  });

  describe('remove', () => {
    it('should remove a pmscan', async () => {
      const id = '1';
      const expectedResult = { message: 'PMScan supprimé avec succès' };
      jest.spyOn(service, 'remove').mockResolvedValue(expectedResult);

      expect(await controller.remove(id, user)).toBe(expectedResult);
      expect(service.remove).toHaveBeenCalledWith(1, user.id);
    });
  });

  describe('findAllFromUser', () => {
    it('should find all pmscans for a user', async () => {
      const expectedResult = [
        {
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          display: Buffer.from('test'),
          name: 'Test PMScan',
          deviceId: 'FF:9C:95:3E:A9:F9',
          deviceName: 'PMScan123456',
          userId: 1,
        },
      ];
      jest.spyOn(service, 'findAllFromUser').mockResolvedValue(expectedResult);

      expect(await controller.findAllFromUser(user)).toBe(expectedResult);
      expect(service.findAllFromUser).toHaveBeenCalledWith(user.id);
    });
  });
});
