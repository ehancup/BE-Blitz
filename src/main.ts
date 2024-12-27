import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
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
    Logger.debug(`server run on port ${process.env.PORT}`, 'Running'),
  );
}
bootstrap();
