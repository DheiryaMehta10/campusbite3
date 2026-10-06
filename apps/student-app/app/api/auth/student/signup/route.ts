import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { corsResponse, handleCorsOptions } from '@/lib/cors';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, fullName, collegeName, hostelName, roomNumber, email, password } = body;

    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPhone = String(phoneNumber || '').replace(/\D/g, '').slice(-10);

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return corsResponse({ success: false, message: 'A valid email address is required' }, { status: 400 });
    }
    if (!fullName || !fullName.trim()) {
      return corsResponse({ success: false, message: 'Full name is required' }, { status: 400 });
    }
    if (!hostelName || !hostelName.trim()) {
      return corsResponse({ success: false, message: 'Hostel Name / Block is required' }, { status: 400 });
    }
    if (!roomNumber || !roomNumber.trim()) {
      return corsResponse({ success: false, message: 'Room Number is required' }, { status: 400 });
    }

    // 1. Check if student already exists by email
    let studentId = '';
    try {
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
    } catch (lookupErr) {
      console.warn('Student lookup warning:', lookupErr);
    }

    let isExisting = false;
    if (studentId) {
      isExisting = true;
    } else {
      studentId = uuidv4();
    }

    const studentRecord = {
      id: studentId,
      email: cleanEmail,
      phone_number: cleanPhone || '9876543210',
      full_name: fullName.trim(),
      college_name: (collegeName || 'Campus University').trim(),
      hostel_name: (roomNumber || '').trim()
        ? `${hostelName.trim()} | Room ${roomNumber.trim()}`
        : hostelName.trim(),
      account_status: 'active',
      updated_at: new Date().toISOString(),
    };

    // Save to Supabase (safe insert or update)
    try {
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
        console.error('Supabase student signup error:', studentError);
        return corsResponse({
          success: false,
          message: `Database error: ${studentError.message || 'Failed to save student profile'}`,
        }, { status: 500 });
      }
    } catch (dbErr: any) {
      console.error('Supabase DB exception on student signup:', dbErr);
      return corsResponse({
        success: false,
        message: 'Database connection error during registration',
      }, { status: 500 });
    }

    return corsResponse({
      success: true,
      message: 'Student profile created and saved in backend database!',
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
    return corsResponse({ success: false, message: 'Failed to create student account' }, { status: 500 });
  }
}
