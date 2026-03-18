import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

function parseRedisUrl(redisUrl: string): { host: string; port: number; password?: string } {
  try {
    const url = new URL(redisUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port || '6379', 10),
      password: url.password || undefined,
    };
  } catch {
    return { host: 'localhost', port: 6379 };
  }
}

async function bootstrap() {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const { host, port, password } = parseRedisUrl(redisUrl);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.REDIS,
    options: {
      host,
      port,
      password,
      retryAttempts: 5,
      retryDelay: 1000,
    },
  });

  await app.listen();
  console.log('[Auth Service] Microservice listening on Redis');
}

bootstrap();
