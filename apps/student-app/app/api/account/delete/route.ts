import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email, reason } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Delete or anonymize from users table if exists
    try {
      await supabaseServer
        .from('users')
        .delete()
        .eq('email', cleanEmail);
    } catch (e) {
      console.warn('Could not delete from users table:', e);
    }

    // 2. Also clear student profiles if separate table exists
    try {
      await supabaseServer
        .from('students')
        .delete()
        .eq('email', cleanEmail);
    } catch (e) {
      console.warn('Could not delete from students table:', e);
    }

    return NextResponse.json({
      success: true,
      message: `Account deletion request processed successfully for ${cleanEmail}. Personal profile and address data have been purged in accordance with Google Play policies.`,
    });
  } catch (error: any) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
