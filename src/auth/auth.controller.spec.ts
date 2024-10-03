import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { useContainer } from 'class-validator';

describe('AuthController', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    await app.init();

    prismaService = app.get<PrismaService>(PrismaService);
    await prismaService.user.deleteMany();
  });

  afterAll(async () => {
    if (prismaService) {
      await prismaService.user.deleteMany();
    }
    await app.close();
  });

  describe('register', () => {
    it('/auth/register (POST) - should create a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(registerDto.email);
      expect(response.body.name).toBe(registerDto.name);
      expect(response.body).not.toHaveProperty('password');

      const createdUser = await prismaService.user.findUnique({
        where: { email: registerDto.email },
      });
      expect(createdUser).toBeTruthy();
      expect(createdUser.email).toBe(registerDto.email);
    });

    it('/auth/register (POST) - should return 400 for invalid data', async () => {
      const invalidRegisterDto = {
        email: 'invalid-email',
        password: 'short',
        name: '',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidRegisterDto)
        .expect(400);

      expect(response.body.message).toBeInstanceOf(Array);
      expect(response.body.message.length).toBeGreaterThan(0);
    });
  });

  describe('login', () => {
    it('/auth/login (POST) - should return a token for valid credentials', async () => {
      const registerDto = {
        email: 'login-test@example.com',
        password: 'Password123!',
        name: 'Login Test User',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      const loginDto = {
        email: registerDto.email,
        password: registerDto.password,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(typeof response.body.access_token).toBe('string');
    });

    it('/auth/login (POST) - should return 401 for invalid credentials', async () => {
      const invalidLoginDto = {
        email: 'nonexistent@example.com',
        password: 'WrongPassword123!',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidLoginDto)
        .expect(401);
    });
  });
});
