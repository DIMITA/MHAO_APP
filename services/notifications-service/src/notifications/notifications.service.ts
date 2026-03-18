import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseService } from './firebase.service';
import { EmailService } from './email.service';

type NotificationChannel = 'PUSH' | 'EMAIL' | 'SMS';

interface SendNotificationDto {
  userId: string;
  type: string;
  title: string;
  body: string;
  payload?: Record<string, unknown>;
  channels: NotificationChannel[];
}

interface GetUserNotificationsOptions {
  page?: number;
  limit?: number;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
    private readonly emailService: EmailService,
  ) {}

  async send(dto: SendNotificationDto): Promise<object> {
    const { userId, type, title, body, payload, channels } = dto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, fcmToken: true },
    });

    if (!user) {
      throw new RpcException({ statusCode: 404, message: 'User not found' });
    }

    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        payload: payload ?? null,
      },
    });

    const deliveryPromises: Promise<void>[] = [];

    for (const channel of channels) {
      if (channel === 'PUSH') {
        if (user.fcmToken) {
          const stringifiedPayload: Record<string, string> = {};
          if (payload) {
            for (const [k, v] of Object.entries(payload)) {
              stringifiedPayload[k] = String(v);
            }
          }
          deliveryPromises.push(
            this.firebaseService.sendPushNotification(user.fcmToken, title, body, stringifiedPayload),
          );
        } else {
          this.logger.warn(`User ${userId} has no FCM token; skipping push`);
        }
      } else if (channel === 'EMAIL') {
        deliveryPromises.push(
          this.emailService.sendEmail({
            to: user.email,
            subject: title,
            template: 'generic',
            context: { title, body, ...(payload ?? {}) },
          }),
        );
      } else if (channel === 'SMS') {
        this.logger.log(
          `[DEV] SMS → userId=${userId} | title="${title}" | body="${body}"`,
        );
      }
    }

    await Promise.allSettled(deliveryPromises);

    this.logger.log(`Notification ${notification.id} sent to user ${userId} via [${channels.join(', ')}]`);
    return notification;
  }

  async markRead(notificationId: string, userId: string): Promise<object> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new RpcException({ statusCode: 404, message: 'Notification not found' });
    }

    if (notification.userId !== userId) {
      throw new RpcException({
        statusCode: 403,
        message: 'You can only mark your own notifications as read',
      });
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return updated;
  }

  async getUserNotifications(
    userId: string,
    options: GetUserNotificationsOptions = {},
  ): Promise<object> {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? Math.min(options.limit, 100) : 20;
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      notifications,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async sendProjectAlert(projectId: string, providerIds: string[]): Promise<void> {
    if (!projectId || !providerIds || providerIds.length === 0) {
      return;
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { title: true, city: true, category: true },
    });

    if (!project) {
      throw new RpcException({ statusCode: 404, message: 'Project not found' });
    }

    const providers = await this.prisma.user.findMany({
      where: { id: { in: providerIds }, isActive: true },
      select: { id: true, fcmToken: true },
    });

    const title = 'Nouveau projet disponible';
    const body = `Un nouveau projet "${project.title}" dans votre zone (${project.city}) est disponible.`;

    const fcmTokens = providers.filter((p) => p.fcmToken).map((p) => p.fcmToken as string);

    if (fcmTokens.length > 0) {
      await this.firebaseService.sendMulticastPushNotification(fcmTokens, title, body, {
        projectId,
        type: 'PROJECT_CREATED',
      });
    }

    const notificationData = providers.map((provider) => ({
      userId: provider.id,
      type: 'PROJECT_CREATED',
      title,
      body,
      payload: { projectId, projectTitle: project.title, city: project.city },
    }));

    if (notificationData.length > 0) {
      await this.prisma.notification.createMany({ data: notificationData });
    }

    this.logger.log(
      `Project alert sent for project ${projectId} to ${providers.length} providers`,
    );
  }

  async sendQuoteAccepted(providerId: string, projectTitle: string): Promise<void> {
    const provider = await this.prisma.user.findUnique({
      where: { id: providerId },
      select: { id: true, email: true, fcmToken: true },
    });

    if (!provider) {
      throw new RpcException({ statusCode: 404, message: 'Provider not found' });
    }

    const title = 'Devis accepté !';
    const body = `Votre devis pour le projet "${projectTitle}" a été accepté. Préparez-vous à commencer !`;

    const notification = await this.prisma.notification.create({
      data: {
        userId: providerId,
        type: 'QUOTE_ACCEPTED',
        title,
        body,
        payload: { projectTitle },
      },
    });

    const deliveryPromises: Promise<void>[] = [];

    if (provider.fcmToken) {
      deliveryPromises.push(
        this.firebaseService.sendPushNotification(provider.fcmToken, title, body, {
          type: 'QUOTE_ACCEPTED',
          projectTitle,
        }),
      );
    }

    deliveryPromises.push(
      this.emailService.sendEmail({
        to: provider.email,
        subject: title,
        template: 'quote-accepted',
        context: { projectTitle },
      }),
    );

    await Promise.allSettled(deliveryPromises);

    this.logger.log(
      `Quote accepted notification sent to provider ${providerId} for project "${projectTitle}"`,
    );
  }

  async sendPaymentReceived(clientId: string, amount: number): Promise<void> {
    const client = await this.prisma.user.findUnique({
      where: { id: clientId },
      select: { id: true, email: true, fcmToken: true },
    });

    if (!client) {
      throw new RpcException({ statusCode: 404, message: 'Client not found' });
    }

    const title = 'Paiement confirmé';
    const body = `Votre paiement de ${amount.toLocaleString('fr-FR')} FCFA a été reçu et sécurisé en escrow.`;

    await this.prisma.notification.create({
      data: {
        userId: clientId,
        type: 'PAYMENT_RECEIVED',
        title,
        body,
        payload: { amount },
      },
    });

    const deliveryPromises: Promise<void>[] = [];

    if (client.fcmToken) {
      deliveryPromises.push(
        this.firebaseService.sendPushNotification(client.fcmToken, title, body, {
          type: 'PAYMENT_RECEIVED',
          amount: String(amount),
        }),
      );
    }

    deliveryPromises.push(
      this.emailService.sendEmail({
        to: client.email,
        subject: title,
        template: 'payment-received',
        context: { amount: amount.toLocaleString('fr-FR') },
      }),
    );

    await Promise.allSettled(deliveryPromises);

    this.logger.log(`Payment received notification sent to client ${clientId} for ${amount} FCFA`);
  }

  async sendMilestoneApproved(
    providerId: string,
    milestoneTitle: string,
    amount: number,
  ): Promise<void> {
    const provider = await this.prisma.user.findUnique({
      where: { id: providerId },
      select: { id: true, email: true, fcmToken: true },
    });

    if (!provider) {
      throw new RpcException({ statusCode: 404, message: 'Provider not found' });
    }

    const title = 'Milestone approuvé & paiement libéré';
    const body = `Le milestone "${milestoneTitle}" a été approuvé. ${amount.toLocaleString('fr-FR')} FCFA seront versés sur votre compte.`;

    await this.prisma.notification.create({
      data: {
        userId: providerId,
        type: 'MILESTONE_RELEASED',
        title,
        body,
        payload: { milestoneTitle, amount },
      },
    });

    const deliveryPromises: Promise<void>[] = [];

    if (provider.fcmToken) {
      deliveryPromises.push(
        this.firebaseService.sendPushNotification(provider.fcmToken, title, body, {
          type: 'MILESTONE_RELEASED',
          milestoneTitle,
          amount: String(amount),
        }),
      );
    }

    deliveryPromises.push(
      this.emailService.sendEmail({
        to: provider.email,
        subject: title,
        template: 'milestone-approved',
        context: { milestoneTitle, amount: amount.toLocaleString('fr-FR') },
      }),
    );

    await Promise.allSettled(deliveryPromises);

    this.logger.log(
      `Milestone approved notification sent to provider ${providerId} for milestone "${milestoneTitle}"`,
    );
  }
}
