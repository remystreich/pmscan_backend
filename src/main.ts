import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    credentials: true,
  }); //TODO: remove this in production
  app.use(cookieParser());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  const config = new DocumentBuilder()
    .setTitle('API Pmscan')
    .setDescription("Documentation de l'API Pmscan")
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/apidoc', app, document);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
//TODO: add global validation pipe helmet and security
