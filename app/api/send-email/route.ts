import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json();

    // For now, just log the email (you can integrate with SendGrid, Resend, etc. later)
    console.log('=== EMAIL NOTIFICATION ===');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Body:', html);
    console.log('========================');

    // TODO: Integrate with actual email service
    // Example with Resend:
    // const { data, error } = await resend.emails.send({
    //   from: 'noreply@stonino-praga.edu.ph',
    //   to,
    //   subject,
    //   html,
    // })

    return NextResponse.json({
      success: true,
      message: 'Email queued for sending',
    });
  } catch (error: any) {
    console.error('Email error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
