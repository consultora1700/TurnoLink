import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { AppLoggerService } from '../../common/logger';

@Injectable()
export class EmailService {
  private resend: Resend | null = null;
  private readonly fromEmail: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext('EmailService');

    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('Email service initialized with Resend');
    } else {
      this.logger.warn('Email service not configured - RESEND_API_KEY missing');
    }
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') || 'noreply@turnero.app';
  }

  async send(to: string, subject: string, text: string): Promise<void> {
    if (!this.resend) {
      this.logger.debug('Email would be sent (service not configured)', {
        to,
        subject,
        action: 'email.send.simulated',
      });
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        text,
        html: this.textToHtml(text),
      });

      this.logger.log('Email sent successfully', {
        to,
        subject,
        action: 'email.send',
      });
    } catch (error) {
      this.logger.error('Failed to send email', (error as Error).stack, {
        to,
        subject,
        action: 'email.send.failed',
      });
      throw error;
    }
  }

  private textToHtml(text: string): string {
    return text
      .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      .replace(/^(.*)$/gm, '<p>$1</p>');
  }
}
