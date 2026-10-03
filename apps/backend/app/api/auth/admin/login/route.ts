import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

const otpStore = new Map();
// FILE: apps/backend/app/api/auth/admin/login/route.ts
export async function POST_ADMIN_LOGIN(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const { data: admin } = await supabaseServer.from('admin_users').select('*').eq('email', email).single();

    if (!admin) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    // For MVP, just verify email (real password would be hashed)
    return NextResponse.json({ success: true, admin: { id: admin.id, email: admin.email } });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error' }, { status: 500 });
  }
}
