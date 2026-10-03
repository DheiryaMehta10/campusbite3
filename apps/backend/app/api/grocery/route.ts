import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: items, error } = await supabaseServer
      .from('grocery_items')
      .select('*, grocery_variants(*)')
      .eq('active', true)
      .order('created_at');

    if (error) throw error;
    return NextResponse.json({ success: true, data: items || [] });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error fetching grocery' }, { status: 500 });
  }
}
