import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    const { data: admin } = await supabaseServer
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (!admin) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({ success: true, admin: { id: admin.id, email: admin.email } });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
