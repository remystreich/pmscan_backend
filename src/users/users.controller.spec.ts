import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      };
      const expectedResult = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(service, 'create').mockResolvedValue(expectedResult);

      expect(await controller.create(createUserDto)).toBe(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedResults = [
        {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(expectedResults);

      expect(await controller.findAll()).toBe(expectedResults);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const expectedOneResult = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(expectedOneResult);

      expect(await controller.findOne('1')).toBe(expectedOneResult);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = { name: 'Updated User' };
      const expectedUpdateResult = {
        id: 1,
        name: 'Updated User',
        email: 'updated@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(service, 'update').mockResolvedValue(expectedUpdateResult);

      expect(await controller.update('1', updateUserDto)).toBe(
        expectedUpdateResult,
      );
      expect(service.update).toHaveBeenCalledWith(1, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const userId = '1';
      const expectedResult = { message: 'Utilisateur supprimé avec succès' };
      jest.spyOn(service, 'remove').mockResolvedValue(expectedResult);

      expect(await controller.remove(userId)).toBe(expectedResult);
      expect(service.remove).toHaveBeenCalledWith(+userId);
    });
  });
});
