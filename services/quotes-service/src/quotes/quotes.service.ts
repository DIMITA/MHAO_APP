import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name);
  private notificationsClient: ClientProxy;

  constructor(private readonly prisma: PrismaService) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const url = new URL(redisUrl);

    this.notificationsClient = ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: {
        host: url.hostname,
        port: parseInt(url.port) || 6379,
        password: url.password || undefined,
      },
    });
  }

  async create(providerId: string, profileId: string, dto: CreateQuoteDto) {
    // Verify project exists and is OPEN
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });

    if (!project) {
      throw new RpcException({
        statusCode: 404,
        message: `Project with id ${dto.projectId} not found`,
      });
    }

    if (project.status !== 'OPEN') {
      throw new RpcException({
        statusCode: 400,
        message: 'Cannot submit a quote for a project that is not OPEN',
      });
    }

    // Verify provider hasn't already submitted a quote for this project
    const existingQuote = await this.prisma.quote.findFirst({
      where: {
        projectId: dto.projectId,
        providerId,
        status: { not: 'WITHDRAWN' },
      },
    });

    if (existingQuote) {
      throw new RpcException({
        statusCode: 409,
        message: 'You have already submitted a quote for this project',
      });
    }

    // Verify the profileId belongs to the provider
    const profile = await this.prisma.providerProfile.findFirst({
      where: { id: profileId, userId: providerId },
    });

    if (!profile) {
      throw new RpcException({
        statusCode: 403,
        message: 'Provider profile not found or does not belong to this user',
      });
    }

    const quote = await this.prisma.quote.create({
      data: {
        projectId: dto.projectId,
        providerId,
        profileId,
        amount: dto.amount,
        description: dto.description,
        timelineDays: dto.timelineDays,
        files: dto.files || [],
        status: 'PENDING',
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            clientId: true,
            status: true,
          },
        },
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        profile: {
          select: {
            id: true,
            companyName: true,
            ratingAvg: true,
            ratingCount: true,
            isVerified: true,
          },
        },
      },
    });

    return quote;
  }

  async findOne(id: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            clientId: true,
            status: true,
            budgetMin: true,
            budgetMax: true,
            city: true,
            country: true,
          },
        },
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        profile: {
          select: {
            id: true,
            companyName: true,
            description: true,
            skills: true,
            ratingAvg: true,
            ratingCount: true,
            isVerified: true,
          },
        },
      },
    });

    if (!quote) {
      throw new RpcException({
        statusCode: 404,
        message: `Quote with id ${id} not found`,
      });
    }

    return quote;
  }

  async findByProject(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new RpcException({
        statusCode: 404,
        message: `Project with id ${projectId} not found`,
      });
    }

    const quotes = await this.prisma.quote.findMany({
      where: { projectId },
      include: {
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        profile: {
          select: {
            id: true,
            companyName: true,
            description: true,
            skills: true,
            ratingAvg: true,
            ratingCount: true,
            isVerified: true,
          },
        },
      },
      orderBy: { amount: 'asc' },
    });

    return quotes;
  }

  async accept(id: string, clientId: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: {
        project: true,
        provider: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!quote) {
      throw new RpcException({
        statusCode: 404,
        message: `Quote with id ${id} not found`,
      });
    }

    // Verify quote belongs to client's project
    if (quote.project.clientId !== clientId) {
      throw new RpcException({
        statusCode: 403,
        message: 'You do not have permission to accept this quote',
      });
    }

    if (quote.status !== 'PENDING') {
      throw new RpcException({
        statusCode: 400,
        message: `Cannot accept a quote with status ${quote.status}`,
      });
    }

    // Run transaction: accept this quote, reject others, update project status
    const [updatedQuote] = await this.prisma.$transaction([
      // Accept the selected quote
      this.prisma.quote.update({
        where: { id },
        data: { status: 'ACCEPTED' },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              clientId: true,
            },
          },
          provider: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          profile: {
            select: {
              id: true,
              companyName: true,
            },
          },
        },
      }),
      // Reject all other quotes for the same project
      this.prisma.quote.updateMany({
        where: {
          projectId: quote.projectId,
          id: { not: id },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      }),
      // Update project status to IN_PROGRESS
      this.prisma.project.update({
        where: { id: quote.projectId },
        data: { status: 'IN_PROGRESS' },
      }),
    ]);

    // Emit notification event via Redis
    try {
      this.notificationsClient.emit('notifications.quote_accepted', {
        providerId: quote.providerId,
        clientId: quote.project.clientId,
        projectId: quote.projectId,
        quoteId: id,
        projectTitle: quote.project.title,
        providerName: `${quote.provider.firstName} ${quote.provider.lastName}`,
      });
    } catch (err) {
      this.logger.warn('Failed to emit quote_accepted notification', err);
    }

    return updatedQuote;
  }

  async reject(id: string, clientId: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!quote) {
      throw new RpcException({
        statusCode: 404,
        message: `Quote with id ${id} not found`,
      });
    }

    if (quote.project.clientId !== clientId) {
      throw new RpcException({
        statusCode: 403,
        message: 'You do not have permission to reject this quote',
      });
    }

    if (quote.status !== 'PENDING') {
      throw new RpcException({
        statusCode: 400,
        message: `Cannot reject a quote with status ${quote.status}`,
      });
    }

    return this.prisma.quote.update({
      where: { id },
      data: { status: 'REJECTED' },
      include: {
        project: {
          select: { id: true, title: true },
        },
        provider: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async getMyQuotes(providerId: string) {
    const quotes = await this.prisma.quote.findMany({
      where: { providerId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            city: true,
            country: true,
            budgetMin: true,
            budgetMax: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return quotes;
  }

  async withdraw(id: string, providerId: string) {
    const quote = await this.prisma.quote.findUnique({ where: { id } });

    if (!quote) {
      throw new RpcException({
        statusCode: 404,
        message: `Quote with id ${id} not found`,
      });
    }

    if (quote.providerId !== providerId) {
      throw new RpcException({
        statusCode: 403,
        message: 'You do not have permission to withdraw this quote',
      });
    }

    if (quote.status !== 'PENDING') {
      throw new RpcException({
        statusCode: 400,
        message: `Cannot withdraw a quote with status ${quote.status}`,
      });
    }

    return this.prisma.quote.update({
      where: { id },
      data: { status: 'WITHDRAWN' },
    });
  }
}
