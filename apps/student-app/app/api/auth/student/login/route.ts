import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { corsResponse, handleCorsOptions } from '@/lib/cors';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, phoneNumber } = body;

    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPhone = String(phoneNumber || '').replace(/\D/g, '').slice(-10);

    if (!cleanEmail && !cleanPhone) {
      return corsResponse({ success: false, message: 'Please enter your registered email or phone' }, { status: 400 });
    }

    let student = null;

    try {
      if (cleanEmail) {
        const { data, error } = await supabaseServer
          .from('students')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();
        if (data) student = data;
      }

      if (!student && cleanPhone) {
        const { data, error } = await supabaseServer
          .from('students')
          .select('*')
          .eq('phone_number', cleanPhone)
          .maybeSingle();
        if (data) student = data;
      }
    } catch (e) {
      console.warn('Supabase student lookup error:', e);
    }

    if (!student) {
      return corsResponse({
        success: false,
        message: 'No registered student account found with this email. Please switch to "Sign Up" to register.',
      }, { status: 404 });
    }

    return corsResponse({
      success: true,
      message: 'Login successful',
      student: {
        id: student.id,
        fullName: student.full_name || 'Student',
        email: student.email || cleanEmail,
        phoneNumber: student.phone_number || cleanPhone,
        phone: student.phone_number || cleanPhone,
        hostelName: student.hostel_name || '',
        roomNumber: student.room_number || '',
        collegeName: student.college_name || 'Campus University',
      },
    });
  } catch (error: any) {
    console.error('Student login error:', error);
    return corsResponse({ success: false, message: 'Server error during login' }, { status: 500 });
  }
}
