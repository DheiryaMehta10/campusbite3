import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { verifyOtpToken } from '@/lib/otp';

export const dynamic = 'force-dynamic';

const TWILIO_KEY_SID = process.env.TWILIO_API_KEY_SID || 'SK786c3fa401e29701f89337eca5c42866';
const TWILIO_SECRET = process.env.TWILIO_API_KEY_SECRET || 'YJ1DohTnhZHh1mXeKZKBdO3AivEJS88T';
const TWILIO_VERIFY_SID = process.env.TWILIO_VERIFY_SERVICE_SID || 'VA1eb73e93dd31a7152a3280181ab9d0c3';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp, token } = await request.json();
    const cleanPhone = String(phoneNumber || '').replace(/\D/g, '').slice(-10);
    const cleanOtp = String(otp || '').trim();

    if (cleanPhone.length !== 10) {
      return NextResponse.json({ success: false, message: 'Invalid phone number' }, { status: 400 });
    }

    if (!cleanOtp || cleanOtp.length !== 6) {
      return NextResponse.json(
        { success: false, message: 'Please enter the complete 6-digit OTP code' },
        { status: 400 }
      );
    }

    let isApproved = false;
    let failureReason = '';

    // 1. Verify with Twilio Verify service
    if (TWILIO_KEY_SID && TWILIO_SECRET && TWILIO_VERIFY_SID) {
      try {
        const authHeader = 'Basic ' + Buffer.from(`${TWILIO_KEY_SID}:${TWILIO_SECRET}`).toString('base64');
        const params = new URLSearchParams();
        params.append('To', `+91${cleanPhone}`);
        params.append('Code', cleanOtp);

        const twRes = await fetch(
          `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SID}/VerificationCheck`,
          {
            method: 'POST',
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          }
        );

        const twData = await twRes.json();
        console.log('[Twilio Verify Check]:', twData.status, twData.valid);

        if (twData.status === 'approved' && twData.valid === true) {
          isApproved = true;
        } else if (twData.status === 'pending') {
          failureReason = 'Incorrect OTP code. Please enter the valid 6-digit code received on your phone.';
        }
      } catch (err) {
        console.error('[Twilio Verify Check Error]:', err);
      }
    }

    // 2. Fallback cryptographic check if Twilio API wasn't reachable
    if (!isApproved && token) {
      const fallbackCheck = verifyOtpToken(cleanPhone, cleanOtp, token);
      if (fallbackCheck.valid) {
        isApproved = true;
      } else if (!failureReason) {
        failureReason = fallbackCheck.reason || 'Invalid OTP code.';
      }
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

    // 3. Check if student is already registered in database
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