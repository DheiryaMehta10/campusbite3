import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, fullName, collegeName, hostelName, email } = await request.json();

    const userId = uuidv4();
    const { error: studentError } = await supabaseServer.from('students').insert({
      id: userId,
      phone_number: phoneNumber,
      full_name: fullName,
      college_name: collegeName,
      hostel_name: hostelName,
      email,
      account_status: 'active',
    });

    if (studentError) {
      return NextResponse.json({ success: false, message: 'Signup failed' }, { status: 400 });
    }

    await supabaseServer.from('carts').insert({ student_id: userId, cart_type: 'food' });

    return NextResponse.json({ success: true, student: { id: userId, phoneNumber, fullName, email } });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
