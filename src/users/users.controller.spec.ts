import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';

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

  const user: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'password',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('find current user', () => {
    it('should return current user', async () => {
      const result = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(result);
      expect(await controller.findOne(user)).toEqual(result);
      expect(service.findOne).toHaveBeenCalledWith(user.id);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = { name: 'Updated User' };
      const result = {
        id: 1,
        name: 'Updated User',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(await controller.update(user, updateUserDto)).toEqual(result);
      expect(service.update).toHaveBeenCalledWith(user.id, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const result = { message: 'Utilisateur supprimé avec succès' };
      jest.spyOn(service, 'remove').mockResolvedValue(result);

      expect(await controller.remove(user)).toEqual(result);
      expect(service.remove).toHaveBeenCalledWith(user.id);
    });
  });
});
