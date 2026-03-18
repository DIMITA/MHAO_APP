import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { AdminModule } from './modules/admin/admin.module';
import { FilesModule } from './modules/files/files.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds in ms
        limit: 100,
      },
    ]),
    AuthModule,
    ProjectsModule,
    QuotesModule,
    PaymentsModule,
    ProvidersModule,
    ReviewsModule,
    AdminModule,
    FilesModule,
  ],
})
export class AppModule {}
