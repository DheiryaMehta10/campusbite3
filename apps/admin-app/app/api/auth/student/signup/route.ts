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


    let isExisting = false;
    let studentId = '';
    const { data: existingByEmail } = await supabaseServer
      .from('students')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (existingByEmail?.id) {
      studentId = existingByEmail.id;
      isExisting = true;
    } else {
      const { data: existingStudent } = await supabaseServer
        .from('students')
        .select('id')
        .eq('phone_number', cleanPhone)
        .maybeSingle();
      if (existingStudent?.id) {
        studentId = existingStudent.id;
        isExisting = true;
      } else {
        studentId = uuidv4();
      }
    }

    const studentRecord = {
      id: studentId,
      phone_number: cleanPhone,
      full_name: fullName.trim(),
      college_name: (collegeName || 'Campus University').trim(),
      hostel_name: (roomNumber || '').trim()
        ? `${hostelName.trim()} | Room ${roomNumber.trim()}`
        : hostelName.trim(),
      email: email.trim().toLowerCase(),
      account_status: 'active',
      updated_at: new Date().toISOString(),
    };

    let studentError = null;
    if (isExisting) {
      const { error } = await supabaseServer
        .from('students')
        .update(studentRecord)
        .eq('id', studentId);
      studentError = error;
    } else {
      const { error } = await supabaseServer
        .from('students')
        .insert(studentRecord);
      studentError = error;
    }

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
        email: email.trim().toLowerCase(),
      },
    });
  } catch (error: any) {
    console.error('Signup Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create student account' }, { status: 500 });
  }
}
