import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: items, error } = await supabaseServer
      .from('medical_items')
      .select('*')
      .eq('active', true)
      .not('name', 'ilike', '%thermometer%') // Explicit requirement: NO thermometer
      .order('created_at');

    if (error) throw error;
    return NextResponse.json({ success: true, data: items || [] });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error fetching medical items' }, { status: 500 });
  }
}
