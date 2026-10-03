import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

const otpStore = new Map();

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();
    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      return NextResponse.json({ success: false, message: 'Invalid phone' }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    otpStore.set(phoneNumber, { otp, attempts: 0, expiresAt });
    console.log(`[OTP] ${phoneNumber}: ${otp}`); // For development

    return NextResponse.json({ success: true, message: 'OTP sent' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error' }, { status: 500 });
  }
}