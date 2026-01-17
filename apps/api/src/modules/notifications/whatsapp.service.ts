import { Injectable } from '@nestjs/common';

export interface WhatsAppResult {
  success: boolean;
  whatsappLink: string;
  message: string;
}

@Injectable()
export class WhatsAppService {
  /**
   * Genera un enlace de WhatsApp Web para enviar el mensaje.
   * No depende de servicios externos como Twilio.
   * El mensaje se registra en la DB y el enlace puede mostrarse al usuario.
   */
  async send(to: string, message: string): Promise<WhatsAppResult> {
    const normalizedPhone = this.normalizePhone(to);
    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/${normalizedPhone.replace('+', '')}?text=${encodedMessage}`;

    console.log('[WhatsApp] Confirmación generada para:', normalizedPhone);
    console.log('[WhatsApp] Link:', whatsappLink);

    return {
      success: true,
      whatsappLink,
      message,
    };
  }

  /**
   * Genera solo el enlace sin "enviar"
   */
  generateLink(to: string, message: string): string {
    const normalizedPhone = this.normalizePhone(to);
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${normalizedPhone.replace('+', '')}?text=${encodedMessage}`;
  }

  private normalizePhone(phone: string): string {
    // Remove any non-numeric characters except +
    let normalized = phone.replace(/[^\d+]/g, '');

    // Ensure it starts with +
    if (!normalized.startsWith('+')) {
      // Assume Argentina if no country code
      if (normalized.startsWith('54')) {
        normalized = '+' + normalized;
      } else {
        normalized = '+54' + normalized;
      }
    }

    return normalized;
  }
}
