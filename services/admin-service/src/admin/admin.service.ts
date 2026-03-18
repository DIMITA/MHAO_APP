import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';

type DisputeResolution = 'REFUND' | 'RELEASE' | 'PARTIAL';
type VerifyAction = 'VERIFY' | 'REJECT';

interface PaginationOptions {
  page?: number;
  limit?: number;
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  private validateAdmin(adminUser: { role: string } | null, adminId: string): void {
    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw new RpcException({
        statusCode: 403,
        message: 'Administrator access required',
      });
    }
  }

  private paginate(options: PaginationOptions): { page: number; limit: number; skip: number } {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? Math.min(options.limit, 100) : 20;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }

  async getPendingProviders(options: PaginationOptions = {}): Promise<object> {
    const { page, limit, skip } = this.paginate(options);

    const [providers, total] = await Promise.all([
      this.prisma.providerProfile.findMany({
        where: {
          user: { kycStatus: 'PENDING', role: 'PROVIDER' },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              firstName: true,
              lastName: true,
              kycStatus: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.providerProfile.count({
        where: {
          user: { kycStatus: 'PENDING', role: 'PROVIDER' },
        },
      }),
    ]);

    return {
      providers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async verifyProvider(
    providerId: string,
    adminId: string,
    action: VerifyAction,
    reason?: string,
  ): Promise<object> {
    const adminUser = await this.prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true },
    });
    this.validateAdmin(adminUser, adminId);

    const providerProfile = await this.prisma.providerProfile.findUnique({
      where: { userId: providerId },
      include: { user: true },
    });

    if (!providerProfile) {
      throw new RpcException({ statusCode: 404, message: 'Provider profile not found' });
    }

    if (providerProfile.user.kycStatus !== 'PENDING') {
      throw new RpcException({
        statusCode: 409,
        message: `Provider KYC is already ${providerProfile.user.kycStatus}`,
      });
    }

    const newKycStatus = action === 'VERIFY' ? 'VERIFIED' : 'REJECTED';

    const [updatedUser, updatedProfile] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: providerId },
        data: { kycStatus: newKycStatus },
      }),
      this.prisma.providerProfile.update({
        where: { userId: providerId },
        data: { isVerified: action === 'VERIFY' },
      }),
    ]);

    await this.prisma.notification.create({
      data: {
        userId: providerId,
        type: action === 'VERIFY' ? 'KYC_APPROVED' : 'KYC_REJECTED',
        title: action === 'VERIFY' ? 'Profil vérifié !' : 'Vérification rejetée',
        body:
          action === 'VERIFY'
            ? 'Votre profil prestataire a été vérifié. Vous pouvez maintenant répondre aux projets.'
            : `Votre demande de vérification a été rejetée.${reason ? ` Raison: ${reason}` : ''}`,
        payload: { adminId, action, reason: reason ?? null },
      },
    });

    this.logger.log(
      `Provider ${providerId} ${action === 'VERIFY' ? 'verified' : 'rejected'} by admin ${adminId}`,
    );

    return { ...updatedProfile, user: updatedUser };
  }

  async getDisputes(options: PaginationOptions = {}): Promise<object> {
    const { page, limit, skip } = this.paginate(options);

    const [disputes, total] = await Promise.all([
      this.prisma.project.findMany({
        where: { status: 'DISPUTED' },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          quotes: {
            where: { status: 'ACCEPTED' },
            include: {
              provider: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
            take: 1,
          },
          payment: {
            select: {
              id: true,
              escrowAmount: true,
              releasedAmount: true,
              status: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.project.count({ where: { status: 'DISPUTED' } }),
    ]);

    return {
      disputes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async resolveDispute(
    projectId: string,
    adminId: string,
    resolution: DisputeResolution,
    reason: string,
  ): Promise<object> {
    const adminUser = await this.prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true },
    });
    this.validateAdmin(adminUser, adminId);

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: { select: { id: true } },
        quotes: {
          where: { status: 'ACCEPTED' },
          include: { provider: { select: { id: true } } },
          take: 1,
        },
        payment: {
          include: { milestones: true },
        },
      },
    });

    if (!project) {
      throw new RpcException({ statusCode: 404, message: 'Project not found' });
    }

    if (project.status !== 'DISPUTED') {
      throw new RpcException({
        statusCode: 409,
        message: 'Project is not in a disputed state',
      });
    }

    const clientId = project.clientId;
    const acceptedQuote = project.quotes[0];
    const providerId = acceptedQuote?.provider?.id;

    let updatedProject: object;

    if (resolution === 'REFUND') {
      updatedProject = await this.prisma.$transaction(async (tx) => {
        const proj = await tx.project.update({
          where: { id: projectId },
          data: { status: 'CANCELLED' },
        });

        if (project.payment) {
          await tx.payment.update({
            where: { id: project.payment.id },
            data: { status: 'REFUNDED' },
          });
        }

        return proj;
      });

      const notifData = [
        {
          userId: clientId,
          type: 'DISPUTE_RESOLVED',
          title: 'Litige résolu - Remboursement',
          body: `Le litige pour votre projet "${project.title}" a été résolu. Un remboursement sera effectué.`,
          payload: { projectId, resolution, reason },
        },
      ];

      if (providerId) {
        notifData.push({
          userId: providerId,
          type: 'DISPUTE_RESOLVED',
          title: 'Litige résolu - Remboursement au client',
          body: `Le litige pour le projet "${project.title}" a été résolu en faveur du client.`,
          payload: { projectId, resolution, reason },
        });
      }

      await this.prisma.notification.createMany({ data: notifData });
    } else if (resolution === 'RELEASE') {
      updatedProject = await this.prisma.$transaction(async (tx) => {
        const proj = await tx.project.update({
          where: { id: projectId },
          data: { status: 'COMPLETED' },
        });

        if (project.payment) {
          const pendingMilestones = project.payment.milestones.filter(
            (m) => m.status === 'PENDING',
          );

          if (pendingMilestones.length > 0) {
            await tx.milestone.updateMany({
              where: {
                paymentId: project.payment.id,
                status: 'PENDING',
              },
              data: {
                status: 'APPROVED',
                approvedAt: new Date(),
              },
            });
          }

          const totalAmount = project.payment.milestones.reduce((sum, m) => sum + m.amount, 0);

          await tx.payment.update({
            where: { id: project.payment.id },
            data: {
              status: 'RELEASED',
              releasedAmount: totalAmount,
            },
          });
        }

        return proj;
      });

      const notifData = [
        {
          userId: clientId,
          type: 'DISPUTE_RESOLVED',
          title: 'Litige résolu - Paiement libéré',
          body: `Le litige pour votre projet "${project.title}" a été résolu. Le paiement a été libéré au prestataire.`,
          payload: { projectId, resolution, reason },
        },
      ];

      if (providerId) {
        notifData.push({
          userId: providerId,
          type: 'DISPUTE_RESOLVED',
          title: 'Litige résolu - Paiement reçu',
          body: `Le litige pour le projet "${project.title}" a été résolu en votre faveur. Le paiement sera versé.`,
          payload: { projectId, resolution, reason },
        });
      }

      await this.prisma.notification.createMany({ data: notifData });
    } else if (resolution === 'PARTIAL') {
      this.logger.log(
        `PARTIAL resolution for project ${projectId}: reason="${reason}" - manual processing required`,
      );

      updatedProject = await this.prisma.project.update({
        where: { id: projectId },
        data: { status: 'CANCELLED' },
      });

      const notifData = [
        {
          userId: clientId,
          type: 'DISPUTE_RESOLVED',
          title: 'Litige résolu - Remboursement partiel',
          body: `Le litige pour votre projet "${project.title}" a été résolu avec un remboursement partiel. Notre équipe vous contactera.`,
          payload: { projectId, resolution, reason },
        },
      ];

      if (providerId) {
        notifData.push({
          userId: providerId,
          type: 'DISPUTE_RESOLVED',
          title: 'Litige résolu - Paiement partiel',
          body: `Le litige pour le projet "${project.title}" a été résolu avec un paiement partiel. Notre équipe vous contactera.`,
          payload: { projectId, resolution, reason },
        });
      }

      await this.prisma.notification.createMany({ data: notifData });
    } else {
      throw new RpcException({
        statusCode: 400,
        message: 'Invalid resolution type. Must be REFUND, RELEASE, or PARTIAL',
      });
    }

    this.logger.log(
      `Dispute for project ${projectId} resolved with ${resolution} by admin ${adminId}`,
    );

    return updatedProject;
  }

  async getStats(): Promise<object> {
    const [
      totalUsers,
      totalClients,
      totalProviders,
      totalProjects,
      openProjects,
      completedProjects,
      pendingVerifications,
      activeDisputes,
      paymentAggregation,
      topProviders,
      recentActivity,
    ] = await Promise.all([
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { role: 'CLIENT', isActive: true } }),
      this.prisma.user.count({ where: { role: 'PROVIDER', isActive: true } }),
      this.prisma.project.count(),
      this.prisma.project.count({ where: { status: 'OPEN' } }),
      this.prisma.project.count({ where: { status: 'COMPLETED' } }),
      this.prisma.user.count({ where: { role: 'PROVIDER', kycStatus: 'PENDING' } }),
      this.prisma.project.count({ where: { status: 'DISPUTED' } }),
      this.prisma.payment.aggregate({
        where: { status: { in: ['IN_ESCROW', 'PARTIALLY_RELEASED', 'RELEASED'] } },
        _sum: { escrowAmount: true, releasedAmount: true },
      }),
      this.prisma.providerProfile.findMany({
        where: { isVerified: true, ratingCount: { gt: 0 } },
        orderBy: [{ ratingAvg: 'desc' }, { ratingCount: 'desc' }],
        take: 5,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          client: {
            select: { firstName: true, lastName: true },
          },
        },
      }),
    ]);

    const totalPaymentsVolume = paymentAggregation._sum.escrowAmount ?? 0;
    const totalRevenue = Math.round(totalPaymentsVolume * 0.1 * 100) / 100;

    return {
      users: {
        totalUsers,
        totalClients,
        totalProviders,
      },
      projects: {
        totalProjects,
        openProjects,
        completedProjects,
        inProgressProjects: totalProjects - openProjects - completedProjects - activeDisputes,
      },
      financials: {
        totalPaymentsVolume: Math.round(totalPaymentsVolume * 100) / 100,
        totalRevenue,
      },
      moderation: {
        pendingVerifications,
        activeDisputes,
      },
      topProviders,
      recentActivity,
    };
  }
}
