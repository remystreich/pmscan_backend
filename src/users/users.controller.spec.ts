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
      const expectedResult = { id: 1, ...createUserDto };
      jest.spyOn(service, 'create').mockResolvedValue(expectedResult);

      expect(await controller.create(createUserDto)).toBe(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedResult = [{ id: 1, name: 'Test User' }];
      jest.spyOn(service, 'findAll').mockResolvedValue(expectedResult);

      expect(await controller.findAll()).toBe(expectedResult);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const expectedResult = { id: 1, name: 'Test User' };
      jest.spyOn(service, 'findOne').mockResolvedValue(expectedResult);

      expect(await controller.findOne('1')).toBe(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = { name: 'Updated User' };
      const expectedResult = { id: 1, ...updateUserDto };
      jest.spyOn(service, 'update').mockResolvedValue(expectedResult);

      expect(await controller.update('1', updateUserDto)).toBe(expectedResult);
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
