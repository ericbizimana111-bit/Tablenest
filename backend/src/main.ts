import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false, // configured with explicit size limits in configureApp
    logger: process.env.NODE_ENV === 'production' ? ['log', 'warn', 'error'] : ['log', 'warn', 'error', 'debug'],
  });
  configureApp(app);

  const config = app.get(ConfigService);
  const port = Number(config.get('PORT') || 3001);
  await app.listen(port);
  Logger.log(`TableNest API listening on http://localhost:${port}/api (${config.get('NODE_ENV')})`, 'Bootstrap');
}

bootstrap().catch((err) => {
  Logger.error(`Failed to start: ${(err as Error).message}`, (err as Error).stack, 'Bootstrap');
  process.exit(1);
});
