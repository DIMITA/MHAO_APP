import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICE_TOKENS } from '../../config/microservices.config';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

@Controller('reviews')
@UseInterceptors(TransformInterceptor)
export class ReviewsController {
  constructor(
    @Inject(MICROSERVICE_TOKENS.REVIEWS_SERVICE)
    private readonly reviewsClient: ClientProxy,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return firstValueFrom(
      this.reviewsClient.send('reviews.create', { ...body, authorId: user.sub, role: user.role }),
    );
  }

  @Get('provider/:id')
  async findByProvider(@Param('id') id: string) {
    return firstValueFrom(this.reviewsClient.send('reviews.find_by_provider', { providerId: id }));
  }
}
