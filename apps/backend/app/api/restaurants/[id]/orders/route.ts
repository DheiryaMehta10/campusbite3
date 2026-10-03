import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

const otpStore = new Map();
export async function GET_REST_ORDERS(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: orders } = await supabaseServer
      .from('orders')
      .select('*, order_items(*)')
      .eq('restaurant_id', params.id)
      .order('placed_at', { ascending: false });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error' }, { status: 500 });
  }
}
