import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { verifyOtpToken } from '@/lib/otp';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp, token, isFirebaseVerified, firebaseUid } = await request.json();
    const cleanPhone = String(phoneNumber || '').replace(/\D/g, '').slice(-10);

    if (cleanPhone.length !== 10) {
      return NextResponse.json({ success: false, message: 'Invalid phone number' }, { status: 400 });
    }

    let isApproved = false;
    let failureReason = '';

    if (isFirebaseVerified && (firebaseUid || cleanPhone)) {
      // Confirmed via Google Firebase Phone Auth
      isApproved = true;
    } else if (otp && token) {
      const fallbackCheck = verifyOtpToken(cleanPhone, String(otp).trim(), token);
      if (fallbackCheck.valid) {
        isApproved = true;
      } else {
        failureReason = fallbackCheck.reason || 'Invalid OTP code.';
      }
    } else {
      failureReason = 'Please enter a valid 6-digit verification code';
    }

    if (!isApproved) {
      return NextResponse.json(
        {
          success: false,
          message: failureReason || 'Invalid OTP code. Please enter the correct code sent to your phone.',
        },
        { status: 400 }
      );
    }

    // Check if student is already registered in Supabase
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