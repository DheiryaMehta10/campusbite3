import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, email } = await request.json();
    const identifier = String(email || phoneNumber || '').trim();

    if (!identifier) {
      return NextResponse.json({ success: false, message: 'Please enter your email or phone number' }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    return NextResponse.json({
      success: true,
      message: `OTP sent to ${identifier}`,
      otpCode: otp,
      phone: identifier,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to send OTP' }, { status: 500 });
  }
}