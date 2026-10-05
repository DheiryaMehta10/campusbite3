import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, fullName, collegeName, hostelName, roomNumber, email } = body;

    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPhone = String(phoneNumber || '').replace(/\D/g, '').slice(-10);

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json({ success: false, message: 'A valid email address is required' }, { status: 400 });
    }
    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ success: false, message: 'Full name is required' }, { status: 400 });
    }
    if (!hostelName || !hostelName.trim()) {
      return NextResponse.json({ success: false, message: 'Hostel Name / Block is required' }, { status: 400 });
    }

    // 1. Check if student already exists by email
    let studentId = '';
    const { data: existingStudentByEmail } = await supabaseServer
      .from('students')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingStudentByEmail?.id) {
      studentId = existingStudentByEmail.id;
    } else if (cleanPhone) {
      const { data: existingStudentByPhone } = await supabaseServer
        .from('students')
        .select('id')
        .eq('phone_number', cleanPhone)
        .maybeSingle();
      if (existingStudentByPhone?.id) {
        studentId = existingStudentByPhone.id;
      }
    }

    if (!studentId) {
      studentId = uuidv4();
    }

    const studentRecord = {
      id: studentId,
      email: cleanEmail,
      phone_number: cleanPhone || '',
      full_name: fullName.trim(),
      college_name: (collegeName || 'Campus University').trim(),
      hostel_name: hostelName.trim(),
      room_number: (roomNumber || '').trim(),
      account_status: 'active',
      updated_at: new Date().toISOString(),
    };

    // Save to Supabase
    try {
      const { error: studentError } = await supabaseServer
        .from('students')
        .upsert(studentRecord, { onConflict: 'id' });

      if (studentError) {
        console.warn('Supabase signup upsert error:', studentError);
      }
    } catch (dbErr) {
      console.warn('Supabase DB error on student signup:', dbErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Student profile created successfully',
      student: {
        id: studentId,
        email: cleanEmail,
        phoneNumber: cleanPhone,
        phone: cleanPhone,
        fullName: fullName.trim(),
        collegeName: (collegeName || 'Campus University').trim(),
        hostelName: hostelName.trim(),
        roomNumber: (roomNumber || '').trim(),
      },
    });
  } catch (error: any) {
    console.error('Signup Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create student account' }, { status: 500 });
  }
}
