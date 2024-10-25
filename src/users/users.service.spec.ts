import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let usersRepository: UsersRepository;
  let mockUser;
  let mockCreateUserDto: CreateUserDto;

  const mockUsersRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findOneByEmail: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockUsersRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<UsersRepository>(UsersRepository);

    mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
    };

    mockCreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'testPassword123',
    };

    jest
      .spyOn(bcrypt, 'hash')
      .mockImplementation(() => Promise.resolve('hashedPassword'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      mockUsersRepository.create.mockResolvedValue(mockUser);

      const result = await service.create(mockCreateUserDto);

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
      });
      expect(mockUsersRepository.create).toHaveBeenCalledWith({
        ...mockCreateUserDto,
        password: 'hashedPassword',
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(mockCreateUserDto.password, 10);
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      const users = [
        mockUser,
        { ...mockUser, id: 2, email: 'user2@example.com' },
      ];
      mockUsersRepository.findAll.mockResolvedValue(users);

      const result = await service.findAll();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      expect(result).toEqual(users.map(({ password, ...user }) => user));
      expect(mockUsersRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by ID without password', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
      });
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user by email without password', async () => {
      mockUsersRepository.findOneByEmail.mockResolvedValue(mockUser);

      const result = await service.findOneByEmail(mockUser.email);

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
      });
      expect(mockUsersRepository.findOneByEmail).toHaveBeenCalledWith(
        mockUser.email,
      );
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated User',
        password: 'newPassword',
      };
      const updatedUser = {
        ...mockUser,
        name: 'Updated User',
        password: 'newHashedPassword',
      };
      mockUsersRepository.update.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, updateUserDto);

      expect(result).toEqual({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      });
      expect(mockUsersRepository.update).toHaveBeenCalledWith(mockUser.id, {
        ...updateUserDto,
        password: 'hashedPassword',
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      mockUsersRepository.delete.mockResolvedValue({
        id: mockUser.id,
        name: 'Deleted User',
      });

      const result = await service.remove(mockUser.id);

      expect(result).toEqual({ message: 'User deleted successfully' });
      expect(mockUsersRepository.delete).toHaveBeenCalledWith(mockUser.id);
    });
  });
});
