import { NextRequest, NextResponse } from 'next/server';
import { generateOtpToken } from '@/lib/otp';

export const dynamic = 'force-dynamic';

const FAST2SMS_KEY =
  process.env.FAST2SMS_API_KEY ||
  '0oTJXrLxcBhRqASWk7DKtgP9pI5vfwa3z4uUsmV2jYEl1bdMNOxGHhdVIDYCiomv90UacjbpBntfzS3r';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();
    const cleanPhone = String(phoneNumber || '').replace(/\D/g, '').slice(-10);

    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 10-digit Indian phone number' },
        { status: 400 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const { token, expiresAt } = generateOtpToken(cleanPhone, otp, 10);

    let smsSent = false;
    let fast2smsNotice = '';

    // Dispatch via Fast2SMS Indian SMS Gateway
    if (FAST2SMS_KEY) {
      try {
        const smsRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            authorization: FAST2SMS_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            variables_values: otp,
            route: 'otp',
            numbers: cleanPhone,
          }),
        });
        const smsData = await smsRes.json();
        console.log('[Fast2SMS Response]:', smsData);

        if (smsData.return === true || smsData.status_code === 200) {
          smsSent = true;
        } else if (smsData.message) {
          fast2smsNotice = smsData.message;
        }
      } catch (err: any) {
        console.error('[Fast2SMS Error]:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: smsSent
        ? `SMS OTP sent successfully to +91 ${cleanPhone}`
        : 'OTP verification code initialized.',
      smsSent,
      demoOtp: !smsSent ? otp : undefined,
      notice: fast2smsNotice,
      token,
      expiresAt,
      phone: cleanPhone,
    });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}