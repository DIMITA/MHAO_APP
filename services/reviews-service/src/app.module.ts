import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ReviewsModule,
  ],
})
export class AppModule {}
