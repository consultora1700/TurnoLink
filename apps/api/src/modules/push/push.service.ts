import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webPush from 'web-push';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLoggerService } from '../../common/logger';

@Injectable()
export class PushService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext('PushService');

    const publicKey = this.config.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.config.get<string>('VAPID_PRIVATE_KEY');
    const subject = this.config.get<string>('VAPID_SUBJECT');

    if (publicKey && privateKey && subject) {
      webPush.setVapidDetails(subject, publicKey, privateKey);
      this.logger.log('VAPID details configured');
    } else {
      this.logger.warn('VAPID keys not configured — push notifications disabled');
    }
  }

  getVapidPublicKey(): string {
    return this.config.get<string>('VAPID_PUBLIC_KEY') || '';
  }

  async subscribe(
    tenantId: string,
    userId: string,
    endpoint: string,
    p256dh: string,
    auth: string,
  ) {
    // Upsert by endpoint to avoid duplicates
    return this.prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { p256dh, auth, tenantId, userId },
      create: { tenantId, userId, endpoint, p256dh, auth },
    });
  }

  async unsubscribe(endpoint: string) {
    return this.prisma.pushSubscription.deleteMany({
      where: { endpoint },
    });
  }

  async sendToTenant(tenantId: string, payload: { title: string; body: string; url?: string; tag?: string }) {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { tenantId },
    });

    if (subscriptions.length === 0) {
      this.logger.log('No push subscriptions for tenant', { tenantId });
      return;
    }

    const data = JSON.stringify(payload);

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webPush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            data,
          );
        } catch (error: any) {
          // If subscription expired or invalid, clean it up
          if (error.statusCode === 410 || error.statusCode === 404) {
            this.logger.log('Removing expired push subscription', {
              endpoint: sub.endpoint,
            });
            await this.prisma.pushSubscription.delete({
              where: { id: sub.id },
            }).catch(() => {});
          } else {
            this.logger.error(
              'Failed to send push notification',
              error.stack || String(error),
              { endpoint: sub.endpoint },
            );
          }
          throw error;
        }
      }),
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;
    this.logger.log('Push notifications sent', { tenantId, sent, failed });
  }
}
