import { db } from '@/lib/db';

export interface WhatsAppTemplateParam {
  type: 'text';
  text: string;
}

export interface SendWhatsAppNotificationParams {
  phoneNumber: string;
  templateName: string;
  languageCode: string;
  components: {
    type: 'body' | 'button' | 'header';
    parameters: WhatsAppTemplateParam[];
  }[];
}

export class MessagingService {
  /**
   * Triggers WhatsApp Business message based on customer order event.
   */
  static async sendWhatsAppNotification(params: SendWhatsAppNotificationParams): Promise<boolean> {
    const apiToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID;
    const isMock = !apiToken || apiToken === 'wa_token_placeholder';

    if (isMock) {
      console.log(`[WhatsApp Mock Notification] Sending ${params.templateName} to ${params.phoneNumber}`);
      console.log('Params details:', JSON.stringify(params.components, null, 2));
      
      // Log event to db as audit log for tracking
      await db.auditLog.create({
        data: {
          action: 'WHATSAPP_SEND_MOCK',
          resource: `Phone: ${params.phoneNumber}`,
          payload: { template: params.templateName, parameters: params.components } as any
        }
      });
      return true;
    }

    try {
      const url = `${process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0'}/${phoneId}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: params.phoneNumber,
          type: 'template',
          template: {
            name: params.templateName,
            language: { code: params.languageCode },
            components: params.components
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('WhatsApp API sending failed:', errorText);
        return false;
      }

      await db.auditLog.create({
        data: {
          action: 'WHATSAPP_SEND_SUCCESS',
          resource: `Phone: ${params.phoneNumber}`,
          payload: { template: params.templateName } as any
        }
      });

      return true;
    } catch (err) {
      console.error('WhatsApp API execution crash:', err);
      return false;
    }
  }

  /**
   * Helper to format a prefilled WhatsApp template url for customer web sharing.
   */
  static getShareLink(designTitle: string, shareUrl: string): string {
    const text = `Hey! Check out this custom zodiac design I made on Chochete: "${designTitle}". Look at the details here: ${shareUrl}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  }
}
