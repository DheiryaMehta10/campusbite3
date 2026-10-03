import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

const otpStore = new Map();

export async function POST_VERIFY(request: NextRequest) {
  try {
    const { phoneNumber, otp } = await request.json();
    const stored = otpStore.get(phoneNumber);

    if (!stored || Date.now() > stored.expiresAt) {
      return NextResponse.json({ success: false, message: 'OTP expired' }, { status: 400 });
    }
    if (stored.otp !== otp) {
      stored.attempts++;
      return NextResponse.json({ success: false, message: 'Invalid OTP' }, { status: 400 });
    }

    const { data: student } = await supabaseServer.from('students').select('id').eq('phone_number', phoneNumber).single();
    otpStore.delete(phoneNumber);

    if (!student) {
      return NextResponse.json({ success: true, message: 'New user', isNewUser: true, phoneNumber });
    }

    return NextResponse.json({ success: true, isNewUser: false, userId: student.id });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error' }, { status: 500 });
  }
}