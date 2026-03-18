import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface FcmMessage {
  token: string;
  notification: {
    title: string;
    body: string;
  };
  data?: Record<string, string>;
}

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private readonly isDev: boolean;
  private firebaseApp: any;

  constructor(private readonly configService: ConfigService) {
    this.isDev = this.configService.get<string>('NODE_ENV', 'development') === 'development';
    if (!this.isDev) {
      this.initializeFirebase();
    }
  }

  private initializeFirebase(): void {
    try {
      const admin = require('firebase-admin');
      const serviceAccountJson = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT');
      if (!serviceAccountJson) {
        this.logger.warn('FIREBASE_SERVICE_ACCOUNT not configured; FCM push disabled');
        return;
      }
      const serviceAccount = JSON.parse(serviceAccountJson);
      if (!admin.apps.length) {
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } else {
        this.firebaseApp = admin.app();
      }
      this.logger.log('Firebase Admin SDK initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', error);
    }
  }

  async sendPushNotification(
    fcmToken: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    if (this.isDev) {
      this.logger.log(
        `[DEV] FCM Push Notification → token=${fcmToken.substring(0, 20)}... | title="${title}" | body="${body}" | data=${JSON.stringify(data ?? {})}`,
      );
      return;
    }

    if (!this.firebaseApp) {
      this.logger.warn('Firebase not initialized; skipping push notification');
      return;
    }

    try {
      const admin = require('firebase-admin');
      const message: FcmMessage = {
        token: fcmToken,
        notification: { title, body },
      };

      if (data && Object.keys(data).length > 0) {
        message.data = data;
      }

      const response = await admin.messaging(this.firebaseApp).send(message);
      this.logger.log(`FCM message sent: ${response}`);
    } catch (error) {
      this.logger.error(`Failed to send FCM notification to ${fcmToken.substring(0, 20)}...`, error);
    }
  }

  async sendMulticastPushNotification(
    fcmTokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    if (this.isDev) {
      this.logger.log(
        `[DEV] FCM Multicast → tokens=${fcmTokens.length} | title="${title}" | body="${body}" | data=${JSON.stringify(data ?? {})}`,
      );
      return;
    }

    if (!this.firebaseApp || fcmTokens.length === 0) {
      return;
    }

    try {
      const admin = require('firebase-admin');
      const message = {
        tokens: fcmTokens,
        notification: { title, body },
        data: data ?? {},
      };

      const response = await admin.messaging(this.firebaseApp).sendEachForMulticast(message);
      this.logger.log(
        `FCM multicast sent: ${response.successCount} success, ${response.failureCount} failures`,
      );
    } catch (error) {
      this.logger.error('Failed to send FCM multicast notification', error);
    }
  }
}
