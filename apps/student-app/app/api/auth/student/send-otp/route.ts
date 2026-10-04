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

    const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const { token, expiresAt } = generateOtpToken(cleanPhone, fallbackOtp, 10);

    return NextResponse.json({
      success: true,
      message: 'OTP session initialized for Firebase Phone Authentication',
      token,
      expiresAt,
      phone: cleanPhone,
    });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to initialize OTP. Please try again.' },
      { status: 500 }
    );
  }
}