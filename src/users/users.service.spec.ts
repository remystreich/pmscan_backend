import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

// Mock du PrismaService
const mockPrismaService = {
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
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
      const hashedPassword =
        '$2b$10$zkncJr8MI6E2BYFt5vS1Le5lkL/46ibCqml7TM5vokQo17YtG6hM6';

      // Mock the bcrypt hash function
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      mockPrismaService.user.create.mockResolvedValue({
        ...expectedUser,
        password: hashedPassword,
      });

      const result = await service.create(createUserDto);
      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedUsers = [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' },
      ];
      mockPrismaService.user.findMany.mockResolvedValue(expectedUsers);

      const result = await service.findAll();
      expect(result).toEqual(expectedUsers);
      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const userId = 1;
      const expectedUser = { id: userId, name: 'User 1' };
      mockPrismaService.user.findUnique.mockResolvedValue(expectedUser);

      const result = await service.findOne(userId);
      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = { name: 'Updated User' };
      const expectedUser = { id: userId, ...updateUserDto };
      mockPrismaService.user.update.mockResolvedValue(expectedUser);

      const result = await service.update(userId, updateUserDto);
      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateUserDto,
      });
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const userId = 1;
      const expectedResult = { message: 'Utilisateur supprimé avec succès' };
      mockPrismaService.user.delete.mockResolvedValue({
        id: userId,
        name: 'Deleted User',
      });

      const result = await service.remove(userId);
      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });
});
