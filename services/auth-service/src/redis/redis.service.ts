import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL', 'redis://localhost:6379');
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: false,
    });

    this.client.on('connect', () => this.logger.log('Redis connected'));
    this.client.on('error', (err) => this.logger.error('Redis error', err));
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * Add a JWT JTI to the token blacklist.
   * TTL should match the token's remaining lifetime.
   */
  async blacklistToken(jti: string, ttlSeconds: number): Promise<void> {
    const key = `blacklist:${jti}`;
    await this.set(key, '1', ttlSeconds);
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    const key = `blacklist:${jti}`;
    const result = await this.get(key);
    return result !== null;
  }

  /**
   * Cache a one-time password for phone verification.
   * Default TTL is 300 seconds (5 minutes).
   */
  async cacheOtp(phone: string, otp: string, ttlSeconds = 300): Promise<void> {
    const key = `otp:${phone}`;
    await this.set(key, otp, ttlSeconds);
  }

  async getOtp(phone: string): Promise<string | null> {
    const key = `otp:${phone}`;
    return this.get(key);
  }

  async deleteOtp(phone: string): Promise<void> {
    const key = `otp:${phone}`;
    await this.del(key);
  }
}
