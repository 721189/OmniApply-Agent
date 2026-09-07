/**
 * OmniApply Transactional Email Dispatcher
 *
 * Dispatches OTP verification codes and security notifications to users.
 * Supports Resend API (via https://api.resend.com/emails) with zero additional SDK dependencies.
 * In local development or when RESEND_API_KEY is not configured, logs clearly to the console.
 */

export interface EmailSendResult {
  success: boolean;
  provider: 'resend' | 'dev-console';
  messageId?: string;
  error?: string;
}

export async function sendVerificationEmail(
  toEmail: string,
  verificationCode: string,
  recipientName?: string
): Promise<EmailSendResult> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM || 'OmniApply <onboarding@resend.dev>';
  const displayName = recipientName ? recipientName.trim() : 'Candidate';

  // If Resend API key is configured, send transactional email via Resend
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [toEmail],
          subject: `[OmniApply] ${verificationCode} is your verification code`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 16px; color: #1e293b; }
                  .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0; }
                  .logo { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 24px; display: flex; align-items: center; gap: 8px; }
                  .logo-badge { background: #6366f1; color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px; text-transform: uppercase; font-weight: 800; }
                  .code-box { background: #f1f5f9; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; margin: 28px 0; }
                  .code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; font-family: monospace; }
                  .footer { font-size: 12px; color: #64748b; margin-top: 32px; line-height: 1.5; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="logo">
                    <span>⚡ OmniApply AI</span>
                    <span class="logo-badge">Verification</span>
                  </div>
                  <h2 style="font-size: 20px; margin-top: 0;">Verify your email address</h2>
                  <p>Hello ${displayName},</p>
                  <p>Please enter the following 6-digit verification code in OmniApply to confirm your email and activate your candidate profile:</p>
                  <div class="code-box">
                    <div class="code">${verificationCode}</div>
                  </div>
                  <p style="font-size: 14px; color: #475569;">This code expires in <strong>15 minutes</strong> and can only be used once.</p>
                  <div class="footer">
                    <p>If you did not request this verification code, you can safely ignore this email.</p>
                    <p>© 2026 OmniApply Open Source Project. All rights reserved.</p>
                  </div>
                </div>
              </body>
            </html>
          `,
          text: `Hello ${displayName},\n\nYour OmniApply verification code is: ${verificationCode}\n\nThis code expires in 15 minutes.\n\nIf you did not request this, please ignore this email.`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Email Dispatch] Resend API error (${response.status}):`, errorText);
        return {
          success: false,
          provider: 'resend',
          error: `Resend error HTTP ${response.status}: ${errorText}`,
        };
      }

      const data = (await response.json()) as { id?: string };
      console.log(`[Email Dispatch] Verification email delivered via Resend to ${toEmail} (ID: ${data.id})`);
      return {
        success: true,
        provider: 'resend',
        messageId: data.id,
      };
    } catch (err: any) {
      console.error('[Email Dispatch] Failed to dispatch via Resend:', err);
      return {
        success: false,
        provider: 'resend',
        error: err?.message || String(err),
      };
    }
  }

  // Development / fallback logging mode
  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  if (isProduction) {
    console.warn(`[Email Dispatch ALERT] Running in production/serverless mode without RESEND_API_KEY. Verification code for ${toEmail} could not be delivered to mailbox.`);
  } else {
    console.log(`[Email Dispatch - Dev Mode] Verification code generated for ${toEmail}: [ ${verificationCode} ] (Set RESEND_API_KEY to send real transactional emails).`);
  }

  return {
    success: true,
    provider: 'dev-console',
  };
}
