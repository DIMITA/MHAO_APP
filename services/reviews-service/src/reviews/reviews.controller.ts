import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { ReviewsService } from './reviews.service';

@Controller()
export class ReviewsController {
  private readonly logger = new Logger(ReviewsController.name);

  constructor(private readonly reviewsService: ReviewsService) {}

  @MessagePattern('reviews.create')
  async create(
    @Payload()
    payload: {
      reviewerId: string;
      projectId: string;
      revieweeId: string;
      rating: number;
      comment?: string;
    },
  ): Promise<object> {
    try {
      const { reviewerId, ...dto } = payload;
      return await this.reviewsService.create(reviewerId, dto);
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.logger.error('reviews.create error', error);
      throw new RpcException({ statusCode: 500, message: 'Internal server error' });
    }
  }

  @MessagePattern('reviews.find_by_provider')
  async findByProvider(
    @Payload() payload: { providerId: string; page?: number; limit?: number },
  ): Promise<object> {
    try {
      const { providerId, page, limit } = payload;
      return await this.reviewsService.findByProvider(providerId, { page, limit });
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.logger.error('reviews.find_by_provider error', error);
      throw new RpcException({ statusCode: 500, message: 'Internal server error' });
    }
  }

  @MessagePattern('reviews.find_by_project')
  async findByProject(@Payload() payload: { projectId: string }): Promise<object[]> {
    try {
      return await this.reviewsService.findByProject(payload.projectId);
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.logger.error('reviews.find_by_project error', error);
      throw new RpcException({ statusCode: 500, message: 'Internal server error' });
    }
  }

  @MessagePattern('reviews.toggle_visibility')
  async toggleVisibility(
    @Payload() payload: { id: string; adminId: string },
  ): Promise<object> {
    try {
      return await this.reviewsService.toggleVisibility(payload.id, payload.adminId);
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.logger.error('reviews.toggle_visibility error', error);
      throw new RpcException({ statusCode: 500, message: 'Internal server error' });
    }
  }
}
