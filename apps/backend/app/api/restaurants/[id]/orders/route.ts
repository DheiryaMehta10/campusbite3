import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: orders, error } = await supabaseServer
      .from('orders')
      .select('*, order_items(*)')
      .eq('restaurant_id', id)
      .order('placed_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
