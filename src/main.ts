import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.useStaticAssets(path.join(__dirname, '..', 'public'));
  app.enableCors();
  await app.listen(process.env.PORT, () =>
    console.log(`server run on port ${process.env.PORT}`),
  );
}
bootstrap();
