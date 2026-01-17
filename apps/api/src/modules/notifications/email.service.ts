import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend | null = null;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') || 'noreply@turnero.app';
  }

  async send(to: string, subject: string, text: string): Promise<void> {
    if (!this.resend) {
      console.log('[Email] Service not configured. Would send to:', to);
      console.log('[Email] Subject:', subject);
      console.log('[Email] Content:', text);
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
    } catch (error) {
      console.error('[Email] Failed to send:', error);
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
