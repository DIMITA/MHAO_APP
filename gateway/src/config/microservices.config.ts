import { Transport, ClientProviderOptions } from '@nestjs/microservices';

export const MICROSERVICE_TOKENS = {
  AUTH_SERVICE: 'AUTH_SERVICE',
  PROJECTS_SERVICE: 'PROJECTS_SERVICE',
  QUOTES_SERVICE: 'QUOTES_SERVICE',
  PAYMENTS_SERVICE: 'PAYMENTS_SERVICE',
  REVIEWS_SERVICE: 'REVIEWS_SERVICE',
  NOTIFICATIONS_SERVICE: 'NOTIFICATIONS_SERVICE',
  ADMIN_SERVICE: 'ADMIN_SERVICE',
  FILES_SERVICE: 'FILES_SERVICE',
} as const;

export type MicroserviceToken = (typeof MICROSERVICE_TOKENS)[keyof typeof MICROSERVICE_TOKENS];

function parseRedisUrl(redisUrl: string): { host: string; port: number; password?: string } {
  try {
    // Format: redis://:password@host:port  OR  redis://host:port
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

export function getMicroserviceConfig(
  token: MicroserviceToken,
  redisUrl: string,
): ClientProviderOptions {
  const { host, port, password } = parseRedisUrl(redisUrl);

  return {
    name: token,
    transport: Transport.REDIS,
    options: {
      host,
      port,
      password,
      retryAttempts: 5,
      retryDelay: 1000,
    },
  };
}

export function getAllMicroserviceConfigs(redisUrl: string): ClientProviderOptions[] {
  return Object.values(MICROSERVICE_TOKENS).map((token) =>
    getMicroserviceConfig(token as MicroserviceToken, redisUrl),
  );
}
