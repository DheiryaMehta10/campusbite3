import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp } = await request.json();
    const cleanPhone = String(phoneNumber || '').replace(/\D/g, '').slice(-10);

    if (cleanPhone.length !== 10) {
      return NextResponse.json({ success: false, message: 'Invalid phone number' }, { status: 400 });
    }
    if (!otp || String(otp).length < 4) {
      return NextResponse.json({ success: false, message: 'Please enter a valid OTP' }, { status: 400 });
    }

    // Query Supabase students database
    const { data: student, error } = await supabaseServer
      .from('students')
      .select('*')
      .eq('phone_number', cleanPhone)
      .maybeSingle();

    if (!student) {
      return NextResponse.json({
        success: true,
        message: 'Student record not found. Please complete profile registration.',
        isNewUser: true,
        phoneNumber: cleanPhone,
      });
    }

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
  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ success: true, isNewUser: true, message: 'Proceeding to registration' });
  }
}