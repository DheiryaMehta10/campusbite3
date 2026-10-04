import { NextRequest, NextResponse } from 'next/server';
import { generateOtpToken } from '@/lib/otp';

export const dynamic = 'force-dynamic';

const TWILIO_KEY_SID = process.env.TWILIO_API_KEY_SID || 'SK786c3fa401e29701f89337eca5c42866';
const TWILIO_SECRET = process.env.TWILIO_API_KEY_SECRET || 'YJ1DohTnhZHh1mXeKZKBdO3AivEJS88T';
const TWILIO_VERIFY_SID = process.env.TWILIO_VERIFY_SERVICE_SID || 'VA1eb73e93dd31a7152a3280181ab9d0c3';

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

    const e164Phone = `+91${cleanPhone}`;
    let smsSent = false;
    let trialRestricted = false;
    let fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // 1. Send real SMS OTP via Twilio Verify API
    if (TWILIO_KEY_SID && TWILIO_SECRET && TWILIO_VERIFY_SID) {
      try {
        const authHeader = 'Basic ' + Buffer.from(`${TWILIO_KEY_SID}:${TWILIO_SECRET}`).toString('base64');
        const params = new URLSearchParams();
        params.append('To', e164Phone);
        params.append('Channel', 'sms');

        const twRes = await fetch(
          `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SID}/Verifications`,
          {
            method: 'POST',
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          }
        );

        const twData = await twRes.json();
        console.log('[Twilio Verify] Dispatch response:', twData.status, twData.code || twData.sid);

        if (twData.status === 'pending' || twData.sid) {
          smsSent = true;
        } else if (twData.code === 21608) {
          // Twilio Trial account restriction for unverified numbers
          trialRestricted = true;
          console.warn('[Twilio Notice] Unverified number on trial account:', cleanPhone);
        } else if (twData.message) {
          console.warn('[Twilio Notice]:', twData.message);
        }
      } catch (err) {
        console.error('[Twilio Verify Error]:', err);
      }
    }

    // Generate cryptographic token
    const { token, expiresAt } = generateOtpToken(cleanPhone, fallbackOtp, 10);

    return NextResponse.json({
      success: true,
      message: smsSent
        ? `SMS OTP sent successfully to +91 ${cleanPhone}`
        : trialRestricted
        ? 'Twilio Trial mode: Real SMS is active for verified numbers. For unverified numbers, test code is provided.'
        : 'OTP verification code requested.',
      smsSent,
      trialRestricted,
      demoOtp: trialRestricted ? fallbackOtp : undefined,
      token,
      expiresAt,
      phone: cleanPhone,
    });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send OTP. Please check the number and try again.' },
      { status: 500 }
    );
  }
}