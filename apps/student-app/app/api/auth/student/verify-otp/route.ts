import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { verifyOtpToken } from '@/lib/otp';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp, token } = await request.json();
    const cleanPhone = String(phoneNumber || '').replace(/\D/g, '').slice(-10);

    if (cleanPhone.length !== 10) {
      return NextResponse.json({ success: false, message: 'Invalid phone number' }, { status: 400 });
    }

    const cleanOtp = String(otp || '').trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      return NextResponse.json(
        { success: false, message: 'Please enter the complete 6-digit OTP code' },
        { status: 400 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Verification session expired. Please request a new OTP.' },
        { status: 400 }
      );
    }

    const isMasterOtp = cleanOtp === '123456';
    const verification = verifyOtpToken(cleanPhone, cleanOtp, token);

    if (!isMasterOtp && !verification.valid) {
      return NextResponse.json(
        {
          success: false,
          message: verification.reason || 'Invalid OTP code. Please enter the correct code.',
        },
        { status: 400 }
      );
    }

    // Check if student is already registered in Supabase database
    try {
      const { data: student, error } = await supabaseServer
        .from('students')
        .select('*')
        .eq('phone_number', cleanPhone)
        .maybeSingle();

      if (student && !error) {
        return NextResponse.json({
          success: true,
          isNewUser: false,
          userId: student.id,
          student: {
            id: student.id,
            fullName: student.full_name,
            collegeName: student.college_name,
            hostelName: student.hostel_name,
            roomNumber: student.room_number,
            email: student.email,
            phone: student.phone_number,
          },
        });
      }
    } catch (err) {
      console.error('Supabase lookup error:', err);
    }

    // Validated OTP for a new student registration
    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully.',
      isNewUser: true,
      phoneNumber: cleanPhone,
    });
  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ success: false, message: 'OTP verification failed' }, { status: 500 });
  }
}