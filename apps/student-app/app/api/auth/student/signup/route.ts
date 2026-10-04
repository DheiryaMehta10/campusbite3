import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, fullName, collegeName, hostelName, roomNumber, email } = body;

    const cleanPhone = String(phoneNumber || '').replace(/\D/g, '').slice(-10);
    if (!cleanPhone || !fullName || !hostelName || !email) {
      return NextResponse.json({ success: false, message: 'All required profile fields must be provided' }, { status: 400 });
    }

    // Check if student exists
    const { data: existingStudent } = await supabaseServer
      .from('students')
      .select('id')
      .eq('phone_number', cleanPhone)
      .maybeSingle();

    const studentId = existingStudent?.id || uuidv4();

    const { error: studentError } = await supabaseServer
      .from('students')
      .upsert({
        id: studentId,
        phone_number: cleanPhone,
        full_name: fullName.trim(),
        college_name: (collegeName || 'Campus University').trim(),
        hostel_name: hostelName.trim(),
        room_number: (roomNumber || '').trim(),
        email: email.trim(),
        account_status: 'active',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'phone_number' });

    if (studentError) {
      console.error('Supabase signup upsert error:', studentError);
    }

    return NextResponse.json({
      success: true,
      message: 'Student profile created successfully',
      student: {
        id: studentId,
        phoneNumber: cleanPhone,
        fullName: fullName.trim(),
        collegeName: (collegeName || 'Campus University').trim(),
        hostelName: hostelName.trim(),
        roomNumber: (roomNumber || '').trim(),
        email: email.trim(),
      },
    });
  } catch (error: any) {
    console.error('Signup Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create student account' }, { status: 500 });
  }
}
