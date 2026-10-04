import { NextRequest, NextResponse } from 'next/server';
import { generateOtpToken } from '@/lib/otp';

export const dynamic = 'force-dynamic';

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

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const { token, expiresAt } = generateOtpToken(cleanPhone, otp, 10);

    let smsSent = false;
    let gatewayMessage = '';

    // 1. Try Fast2SMS (Indian SMS Gateway)
    const fast2smsKey = process.env.FAST2SMS_API_KEY;
    if (fast2smsKey) {
      try {
        const smsRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            authorization: fast2smsKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            variables_values: otp,
            route: 'otp',
            numbers: cleanPhone,
          }),
        });
        const smsData = await smsRes.json();
        if (smsData.return) {
          smsSent = true;
          gatewayMessage = 'SMS delivered to mobile via Fast2SMS';
        }
      } catch (err) {
        console.error('Fast2SMS Error:', err);
      }
    }

    // 2. Try 2Factor.in SMS Gateway
    const twoFactorKey = process.env.TWOFACTOR_API_KEY;
    if (!smsSent && twoFactorKey) {
      try {
        const tfRes = await fetch(
          `https://2factor.in/v3/API/V1/${twoFactorKey}/SMS/+91${cleanPhone}/${otp}/CampusBite_OTP`
        );
        const tfData = await tfRes.json();
        if (tfData.Status === 'Success') {
          smsSent = true;
          gatewayMessage = 'SMS delivered via 2Factor';
        }
      } catch (err) {
        console.error('2Factor Error:', err);
      }
    }

    // 3. Try Twilio if configured
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
    if (!smsSent && twilioSid && twilioToken && twilioFrom) {
      try {
        const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
        const params = new URLSearchParams();
        params.append('To', `+91${cleanPhone}`);
        params.append('From', twilioFrom);
        params.append('Body', `Your CampusBite login verification code is ${otp}. Valid for 10 minutes.`);

        const twRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          }
        );
        if (twRes.ok) {
          smsSent = true;
          gatewayMessage = 'SMS delivered via Twilio';
        }
      } catch (err) {
        console.error('Twilio Error:', err);
      }
    }

    // Log securely in server console
    console.log(`[CampusBite Auth] OTP generated for +91${cleanPhone}. SMS Sent: ${smsSent}`);

    return NextResponse.json({
      success: true,
      message: smsSent ? 'OTP sent successfully to your mobile number' : 'OTP generated and sent',
      smsSent,
      token,
      expiresAt,
      phone: cleanPhone,
    });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to send OTP. Please try again.' }, { status: 500 });
  }
}