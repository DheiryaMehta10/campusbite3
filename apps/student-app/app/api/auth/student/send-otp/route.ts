import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { sendOtpEmail } from '@/lib/mailer';
import { corsResponse, handleCorsOptions } from '@/lib/cors';
import { generateOtpToken } from '@/lib/otp';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const identifier = String(body.email || body.phoneNumber || body.phone || '').trim();

    if (!identifier) {
      return corsResponse({ success: false, message: 'Please enter your Email address or Phone number' }, { status: 400 });
    }

    const isEmail = identifier.includes('@');
    const cleanPhone = identifier.replace(/\D/g, '').slice(-10);

    if (!isEmail && cleanPhone.length !== 10) {
      return corsResponse({ success: false, message: 'Please enter a valid Email address or 10-digit Indian mobile number' }, { status: 400 });
    }

    const targetKey = isEmail ? identifier.toLowerCase() : cleanPhone;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const { token } = generateOtpToken(targetKey, otp, 10);

    let deliveryNote = '';

    if (isEmail) {
      await sendOtpEmail(targetKey, otp);
      deliveryNote = `Free verification code sent to ${targetKey}. Check your inbox or spam folder.`;
    } else {
      const fast2smsKey = process.env.FAST2SMS_API_KEY;
      if (fast2smsKey) {
        try {
          await fetch('https://www.fast2sms.com/dev/bulkV2', {
            method: 'POST',
            headers: { authorization: fast2smsKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ variables_values: otp, route: 'otp', numbers: cleanPhone }),
          });
          deliveryNote = `SMS code sent to +91 ${cleanPhone}`;
        } catch {}
      } else {
        try {
          const { data: st } = await supabaseServer.from('students').select('email').eq('phone_number', cleanPhone).maybeSingle();
          if (st?.email) {
            await sendOtpEmail(st.email, otp);
            deliveryNote = `Verification code sent to registered email ${st.email}`;
          }
        } catch {}
      }
    }

    return corsResponse({
      success: true,
      message: deliveryNote || `Verification code sent to ${targetKey}`,
      isEmail,
      identifier: targetKey,
      token,
      otpCode: otp,
    });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return corsResponse({ success: false, message: 'Failed to send OTP' }, { status: 500 });
  }
}