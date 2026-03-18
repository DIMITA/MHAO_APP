import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';

interface CreateReviewDto {
  projectId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
}

interface FindByProviderOptions {
  page?: number;
  limit?: number;
}

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(reviewerId: string, dto: CreateReviewDto): Promise<object> {
    const { projectId, revieweeId, rating, comment } = dto;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new RpcException({
        statusCode: 400,
        message: 'Rating must be an integer between 1 and 5',
      });
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        quotes: {
          where: { status: 'ACCEPTED' },
          select: { providerId: true },
        },
      },
    });

    if (!project) {
      throw new RpcException({ statusCode: 404, message: 'Project not found' });
    }

    if (project.status !== 'COMPLETED') {
      throw new RpcException({
        statusCode: 400,
        message: 'Reviews can only be submitted for completed projects',
      });
    }

    const isClient = project.clientId === reviewerId;
    const acceptedQuote = project.quotes[0];
    const isProvider = acceptedQuote && acceptedQuote.providerId === reviewerId;

    if (!isClient && !isProvider) {
      throw new RpcException({
        statusCode: 403,
        message: 'Only the client or provider of this project can leave a review',
      });
    }

    const existingReview = await this.prisma.review.findFirst({
      where: { projectId, reviewerId },
    });

    if (existingReview) {
      throw new RpcException({
        statusCode: 409,
        message: 'You have already submitted a review for this project',
      });
    }

    const revieweeUser = await this.prisma.user.findUnique({
      where: { id: revieweeId },
    });

    if (!revieweeUser) {
      throw new RpcException({ statusCode: 404, message: 'Reviewee not found' });
    }

    const review = await this.prisma.review.create({
      data: {
        projectId,
        reviewerId,
        revieweeId,
        rating,
        comment: comment || null,
      },
    });

    if (revieweeUser.role === 'PROVIDER') {
      await this.recalculateProviderRating(revieweeId);
    }

    this.logger.log(`Review ${review.id} created by ${reviewerId} for project ${projectId}`);
    return review;
  }

  private async recalculateProviderRating(providerId: string): Promise<void> {
    const aggregation = await this.prisma.review.aggregate({
      where: {
        revieweeId: providerId,
        isVisible: true,
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const ratingAvg = aggregation._avg.rating ?? 0;
    const ratingCount = aggregation._count.rating;

    await this.prisma.providerProfile.updateMany({
      where: { userId: providerId },
      data: {
        ratingAvg: Math.round(ratingAvg * 100) / 100,
        ratingCount,
      },
    });
  }

  async findByProvider(
    providerId: string,
    options: FindByProviderOptions = {},
  ): Promise<object> {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? Math.min(options.limit, 100) : 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { revieweeId: providerId, isVisible: true },
        include: {
          reviewer: {
            select: { firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({
        where: { revieweeId: providerId, isVisible: true },
      }),
    ]);

    const aggregation = await this.prisma.review.aggregate({
      where: { revieweeId: providerId, isVisible: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      ratingAvg: Math.round((aggregation._avg.rating ?? 0) * 100) / 100,
      ratingCount: aggregation._count.rating,
    };
  }

  async findByProject(projectId: string): Promise<object[]> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new RpcException({ statusCode: 404, message: 'Project not found' });
    }

    const reviews = await this.prisma.review.findMany({
      where: { projectId },
      include: {
        reviewer: {
          select: { firstName: true, lastName: true, role: true },
        },
        reviewee: {
          select: { firstName: true, lastName: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reviews;
  }

  async toggleVisibility(id: string, adminId: string): Promise<object> {
    const adminUser = await this.prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true },
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw new RpcException({
        statusCode: 403,
        message: 'Only administrators can moderate reviews',
      });
    }

    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new RpcException({ statusCode: 404, message: 'Review not found' });
    }

    const updated = await this.prisma.review.update({
      where: { id },
      data: { isVisible: !review.isVisible },
    });

    await this.recalculateProviderRating(review.revieweeId);

    this.logger.log(
      `Review ${id} visibility toggled to ${updated.isVisible} by admin ${adminId}`,
    );
    return updated;
  }
}
