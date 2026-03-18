import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { getMicroserviceConfig, MICROSERVICE_TOKENS } from '../../config/microservices.config';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FilesController } from './files.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MICROSERVICE_TOKENS.AUTH_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) =>
          getMicroserviceConfig(
            MICROSERVICE_TOKENS.AUTH_SERVICE,
            config.get<string>('REDIS_URL', 'redis://localhost:6379'),
          ),
      },
      {
        name: MICROSERVICE_TOKENS.FILES_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) =>
          getMicroserviceConfig(
            MICROSERVICE_TOKENS.FILES_SERVICE,
            config.get<string>('REDIS_URL', 'redis://localhost:6379'),
          ),
      },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'default_secret'),
      }),
    }),
  ],
  controllers: [FilesController],
  providers: [JwtAuthGuard],
})
export class FilesModule {}
