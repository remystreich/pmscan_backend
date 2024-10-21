import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

// Mock du UsersRepository
const mockUsersRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findOneByEmail: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let usersRepository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockUsersRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'testPassword123',
      };
      const expectedUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      };
      const hashedPassword = 'hashedPassword';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUsersRepository.create.mockResolvedValue({
        ...expectedUser,
        password: hashedPassword,
      });

      const result = await service.create(createUserDto);
      expect(result).toEqual(expectedUser);
      expect(mockUsersRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    });
  });

  describe('findAll', () => {
    it('should return an array of users without passwords', async () => {
      const users = [
        {
          id: 1,
          name: 'User 1',
          email: 'user1@example.com',
          password: 'hash1',
        },
        {
          id: 2,
          name: 'User 2',
          email: 'user2@example.com',
          password: 'hash2',
        },
      ];
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const expectedUsers = users.map(({ password, ...user }) => user);
      mockUsersRepository.findAll.mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(expectedUsers);
      expect(mockUsersRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user without password', async () => {
      const userId = 1;
      const user = {
        id: userId,
        name: 'User 1',
        email: 'user1@example.com',
        password: 'hash',
      };
      const expectedUser = {
        id: userId,
        name: 'User 1',
        email: 'user1@example.com',
      };
      mockUsersRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne(userId);
      expect(result).toEqual(expectedUser);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith(userId);
    });

    it('should return null if user not found', async () => {
      const userId = 999;
      mockUsersRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(userId);
      expect(result).toBeNull();
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith(userId);
    });
  });

  describe('findOneByEmail', () => {
    it('should return a single user without password', async () => {
      const email = 'user1@example.com';
      const user = { id: 1, name: 'User 1', email, password: 'hash' };
      const expectedUser = { id: 1, name: 'User 1', email };
      mockUsersRepository.findOneByEmail.mockResolvedValue(user);

      const result = await service.findOneByEmail(email);
      expect(result).toEqual(expectedUser);
      expect(mockUsersRepository.findOneByEmail).toHaveBeenCalledWith(email);
    });

    it('should return null if user not found', async () => {
      const email = 'nonexistent@example.com';
      mockUsersRepository.findOneByEmail.mockResolvedValue(null);

      const result = await service.findOneByEmail(email);
      expect(result).toBeNull();
      expect(mockUsersRepository.findOneByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('update', () => {
    it('should update a user without password change', async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = { name: 'Updated User' };
      const updatedUser = {
        id: userId,
        name: 'Updated User',
        email: 'user@example.com',
        password: 'oldhash',
      };
      const expectedUser = {
        id: userId,
        name: 'Updated User',
        email: 'user@example.com',
      };
      mockUsersRepository.update.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);
      expect(result).toEqual(expectedUser);
      expect(mockUsersRepository.update).toHaveBeenCalledWith(
        userId,
        updateUserDto,
      );
    });

    it('should update a user', async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        name: 'Updated User',
        password: 'newPassword',
      };
      const hashedPassword = 'newHashedPassword';
      const updatedUser = {
        id: userId,
        name: 'Updated User',
        email: 'user@example.com',
        password: hashedPassword,
      };
      const expectedUser = {
        id: userId,
        name: 'Updated User',
        email: 'user@example.com',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUsersRepository.update.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);
      expect(result).toEqual(expectedUser);
      expect(mockUsersRepository.update).toHaveBeenCalledWith(userId, {
        ...updateUserDto,
        password: hashedPassword,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const userId = 1;
      const expectedResult = { message: 'Utilisateur supprimé avec succès' };
      mockUsersRepository.delete.mockResolvedValue({
        id: userId,
        name: 'Deleted User',
      });

      const result = await service.remove(userId);
      expect(result).toEqual(expectedResult);
      expect(mockUsersRepository.delete).toHaveBeenCalledWith(userId);
    });
  });
});
