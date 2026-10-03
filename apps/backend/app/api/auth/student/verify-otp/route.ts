import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const otpStore = new Map<string, { otp: string; attempts: number; expiresAt: number }>();

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp } = await request.json();
    const stored = otpStore.get(phoneNumber);

    if (!stored || Date.now() > stored.expiresAt) {
      return NextResponse.json({ success: false, message: 'OTP expired or not found' }, { status: 400 });
    }
    if (stored.otp !== otp) {
      stored.attempts++;
      return NextResponse.json({ success: false, message: 'Invalid OTP' }, { status: 400 });
    }

    const { data: student } = await supabaseServer
      .from('students')
      .select('id')
      .eq('phone_number', phoneNumber)
      .single();

    otpStore.delete(phoneNumber);

    if (!student) {
      return NextResponse.json({ success: true, message: 'New user', isNewUser: true, phoneNumber });
    }

    return NextResponse.json({ success: true, isNewUser: false, userId: student.id });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}