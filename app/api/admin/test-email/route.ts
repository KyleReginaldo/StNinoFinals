import { EmailService } from '@/lib/services/email-service';
import { NextResponse } from 'next/server';

/**
 * POST /api/admin/test-email
 * Sends a test email to a given address so admins can verify the SMTP
 * configuration without needing to create a new user.
 *
 * Body: { email: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required' },
        { status: 400 }
      );
    }

    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASS) {
      return NextResponse.json(
        {
          success: false,
          error:
            'SMTP_EMAIL or SMTP_PASS is not configured. Please check your environment variables.',
        },
        { status: 500 }
      );
    }

    const now = new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' });

    await EmailService.sendEmail({
      to: email,
      subject: '[Sto Niño Portal] Test Email',
      text: `This is a test email sent from the Sto Niño admin settings page at ${now}.\n\nIf you received this, your email (SMTP) configuration is working correctly.\n\n— Sto Niño de Praga Academy`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .container { background: #f9f9f9; border-radius: 10px; padding: 30px; border: 1px solid #ddd; }
              .header { text-align: center; margin-bottom: 24px; }
              .header h1 { color: #7A0C0C; margin: 0; font-size: 22px; }
              .badge { display: inline-block; background: #d4edda; color: #155724; padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: bold; }
              .footer { margin-top: 24px; text-align: center; color: #888; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Sto Niño Portal — Test Email</h1>
                <br/>
                <span class="badge">✅ SMTP Working</span>
              </div>
              <p>This is a test email sent from the admin settings page at <strong>${now}</strong>.</p>
              <p>If you received this, your email configuration is working correctly.</p>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Sto Niño de Praga Academy. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      sentTo: email,
    });
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to send test email',
      },
      { status: 500 }
    );
  }
}
