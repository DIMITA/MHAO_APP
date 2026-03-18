import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('ReviewsService');
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  const url = new URL(redisUrl);
  const redisOptions: Record<string, unknown> = {
    host: url.hostname,
    port: parseInt(url.port || '6379', 10),
  };

  if (url.password) {
    redisOptions.password = decodeURIComponent(url.password);
  }

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.REDIS,
    options: redisOptions,
  });

  await app.listen();
  logger.log(`Reviews microservice is running (Redis: ${url.hostname}:${url.port || '6379'})`);
}

bootstrap();
