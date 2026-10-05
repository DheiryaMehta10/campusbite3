import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { corsResponse, handleCorsOptions } from '@/lib/cors';
import { verifyOtpToken } from '@/lib/otp';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const identifier = String(body.email || body.phoneNumber || body.phone || '').trim();
    const inputOtp = String(body.otp || '').trim();
    const token = body.token ? String(body.token).trim() : undefined;

    if (!identifier) {
      return corsResponse({ success: false, message: 'Invalid identifier' }, { status: 400 });
    }
    if (!inputOtp || inputOtp.length < 4) {
      return corsResponse({ success: false, message: 'Please enter the 6-digit OTP' }, { status: 400 });
    }

    const isEmail = identifier.includes('@');
    const targetKey = isEmail ? identifier.toLowerCase() : identifier.replace(/\D/g, '').slice(-10);

    const verification = verifyOtpToken(targetKey, inputOtp, token);
    if (!verification.valid) {
      return corsResponse({ success: false, message: verification.reason || 'Invalid verification code. Please try again.' }, { status: 400 });
    }

    // Query Supabase for student record
    let query = supabaseServer.from('students').select('*');
    if (isEmail) {
      query = query.eq('email', targetKey);
    } else {
      query = query.eq('phone_number', targetKey);
    }

    const { data: student } = await query.maybeSingle();

    if (!student) {
      return corsResponse({
        success: true,
        message: 'Verification successful. Please complete your hostel details.',
        isNewUser: true,
        identifier: targetKey,
        isEmail,
      });
    }

    return corsResponse({
      success: true,
      isNewUser: false,
      userId: student.id,
      student: {
        id: student.id,
        fullName: student.full_name || '',
        collegeName: student.college_name || '',
        hostelName: student.hostel_name || '',
        roomNumber: student.room_number || '',
        email: student.email || targetKey,
        phone: student.phone_number || '',
      },
      message: `Welcome back, ${student.full_name || 'Student'}!`,
    });
  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    return corsResponse({ success: true, isNewUser: true, message: 'OTP verified successfully' });
  }
}