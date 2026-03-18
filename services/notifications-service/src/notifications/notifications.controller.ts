import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';

type NotificationChannel = 'PUSH' | 'EMAIL' | 'SMS';

@Controller()
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @MessagePattern('notifications.send')
  async send(
    @Payload()
    payload: {
      userId: string;
      type: string;
      title: string;
      body: string;
      payload?: Record<string, unknown>;
      channels: NotificationChannel[];
    },
  ): Promise<object> {
    try {
      return await this.notificationsService.send(payload);
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.logger.error('notifications.send error', error);
      throw new RpcException({ statusCode: 500, message: 'Internal server error' });
    }
  }

  @MessagePattern('notifications.mark_read')
  async markRead(
    @Payload() payload: { notificationId: string; userId: string },
  ): Promise<object> {
    try {
      return await this.notificationsService.markRead(payload.notificationId, payload.userId);
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.logger.error('notifications.mark_read error', error);
      throw new RpcException({ statusCode: 500, message: 'Internal server error' });
    }
  }

  @MessagePattern('notifications.get_user_notifications')
  async getUserNotifications(
    @Payload() payload: { userId: string; page?: number; limit?: number },
  ): Promise<object> {
    try {
      const { userId, page, limit } = payload;
      return await this.notificationsService.getUserNotifications(userId, { page, limit });
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.logger.error('notifications.get_user_notifications error', error);
      throw new RpcException({ statusCode: 500, message: 'Internal server error' });
    }
  }

  @MessagePattern('notifications.send_project_alert')
  async sendProjectAlert(
    @Payload() payload: { projectId: string; providerIds: string[] },
  ): Promise<{ success: boolean }> {
    try {
      await this.notificationsService.sendProjectAlert(payload.projectId, payload.providerIds);
      return { success: true };
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.logger.error('notifications.send_project_alert error', error);
      throw new RpcException({ statusCode: 500, message: 'Internal server error' });
    }
  }

  @MessagePattern('notifications.send_quote_accepted')
  async sendQuoteAccepted(
    @Payload() payload: { providerId: string; projectTitle: string },
  ): Promise<{ success: boolean }> {
    try {
      await this.notificationsService.sendQuoteAccepted(payload.providerId, payload.projectTitle);
      return { success: true };
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.logger.error('notifications.send_quote_accepted error', error);
      throw new RpcException({ statusCode: 500, message: 'Internal server error' });
    }
  }
}
