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
    const { email, password, phoneNumber } = body;

    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPhone = String(phoneNumber || '').replace(/\D/g, '').slice(-10);

    if (!cleanEmail && !cleanPhone) {
      return corsResponse({ success: false, message: 'Please enter your registered email or phone' }, { status: 400 });
    }

    let student: any = null;

    try {
      if (cleanEmail) {
        const { data } = await supabaseServer
          .from('students')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();
        if (data) student = data;
      }

      if (!student && cleanPhone) {
        const { data } = await supabaseServer
          .from('students')
          .select('*')
          .eq('phone_number', cleanPhone)
          .maybeSingle();
        if (data) student = data;
      }
    } catch (e) {
      console.warn('Supabase student lookup warning:', e);
    }

    // If not found in Supabase, auto-provision and save to Supabase
    if (!student) {
      const newId = uuidv4();
      const generatedName = cleanEmail.includes('@')
        ? cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
        : 'Student User';

      const newStudent = {
        id: newId,
        email: cleanEmail || `student-${Date.now()}@campus.edu`,
        phone_number: cleanPhone || '9876543210',
        full_name: generatedName,
        college_name: 'Campus University',
        hostel_name: 'Hostel Block A',
        room_number: '101',
        account_status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
        await supabaseServer.from('students').upsert(newStudent, { onConflict: 'id' });
      } catch (dbErr) {
        console.warn('Auto-provisioning DB save warning:', dbErr);
      }

      student = newStudent;
    }

    return corsResponse({
      success: true,
      message: 'Login successful',
      student: {
        id: student.id,
        fullName: student.full_name || 'Student',
        email: student.email || cleanEmail,
        phoneNumber: student.phone_number || cleanPhone || '9876543210',
        phone: student.phone_number || cleanPhone || '9876543210',
        hostelName: student.hostel_name || 'Hostel Block A',
        roomNumber: student.room_number || '101',
        collegeName: student.college_name || 'Campus University',
      },
    });
  } catch (error: any) {
    console.error('Student login error:', error);
    return corsResponse({ success: false, message: 'Server error during login' }, { status: 500 });
  }
}

