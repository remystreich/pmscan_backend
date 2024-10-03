import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../app.module';
import { PrismaService } from './../prisma/prisma.service';
import { useContainer } from 'class-validator';
import { AuthService } from '../auth/auth.service';
import * as bcrypt from 'bcrypt';

describe('UsersController', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authService: AuthService;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    await app.init();

    prismaService = app.get<PrismaService>(PrismaService);
    authService = app.get<AuthService>(AuthService);

    await prismaService.user.deleteMany();

    // Créer un utilisateur de test avec un mot de passe hashé
    const hashedPassword = await bcrypt.hash('password123', 10);
    const testUser = await prismaService.user.create({
      data: {
        email: 'testuser@example.com',
        password: hashedPassword,
        name: 'Test User',
      },
    });

    // Obtenir un token JWT
    const { access_token } = await authService.login({
      email: testUser.email,
      password: 'password123',
    });
    jwtToken = access_token;
  });

  afterAll(async () => {
    await prismaService.user.deleteMany();
    await app.close();
  });

  it('/users (POST) - should create a new user', async () => {
    const createUserDto = {
      email: 'testcreate@example.com',
      password: 'Password123!',
      name: 'Test User',
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(createUserDto)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe(createUserDto.email);
    expect(response.body.name).toBe(createUserDto.name);
    expect(response.body).not.toHaveProperty('password');

    const createdUser = await prismaService.user.findUnique({
      where: { email: createUserDto.email },
    });
    expect(createdUser).toBeTruthy();
    expect(createdUser.email).toBe(createUserDto.email);
  });
});
