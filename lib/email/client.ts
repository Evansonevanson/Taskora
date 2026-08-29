import 'server-only';
import { Resend } from 'resend';

let resendInstance: Resend | null = null;

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
  mock?: boolean;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<SendEmailResult> {
  const client = getResendClient();

  if (!client) {
    console.info(`[Email Mock Send] To: ${to} | Subject: "${subject}"`);
    return {
      success: true,
      id: `mock-${Date.now()}`,
      mock: true,
    };
  }

  try {
    const fromAddress =
      process.env.EMAIL_FROM || 'Taskora <onboarding@resend.dev>';
    const response = await client.emails.send({
      from: fromAddress,
      to,
      subject,
      html,
      text: text || subject,
    });

    if (response.error) {
      console.error('[Resend Error]', response.error);
      return { success: false, error: response.error.message };
    }

    return { success: true, id: response.data?.id };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown email error';
    console.error('[Resend Exception]', errorMsg);
    return { success: false, error: errorMsg };
  }
}
