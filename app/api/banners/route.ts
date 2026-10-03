import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date().toISOString();
    const { data: banners, error } = await supabaseServer
      .from('banners')
      .select('*')
      .eq('active', true)
      .lte('start_date', now)
      .gte('end_date', now)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data: banners || [] });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
