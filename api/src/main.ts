import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Set a global prefix so all routes start with /api
  app.setGlobalPrefix('api');

  // 2. Global Validation: Automatically returns 400 for bad payloads and strips extra data
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 3. Swagger Documentation Setup (Requirement 2.3)
  const config = new DocumentBuilder()
    .setTitle('TeamSync API')
    .setDescription('The TeamSync project management API')
    .setVersion('1.0')
    .addBearerAuth() // Allows you to test JWTs directly in the browser
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 4. Enable CORS so your Next.js web app can actually talk to this API
  app.enableCors();
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.API_PORT ?? 3000);
  console.log(`🚀 API is running on: http://localhost:${process.env.API_PORT ?? 3000}/api/docs`);
}
bootstrap();