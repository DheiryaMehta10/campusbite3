import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const orderNumber = searchParams.get('orderNumber');

    let query = supabaseServer
      .from('uncollected_orders')
      .select('*, order:orders(order_number, total_amount, delivery_slot:delivery_slots(name)), student:students(full_name, phone_number, college_name, hostel_name)');

    if (orderNumber) {
      query = query.ilike('order.order_number', `%${orderNumber}%`);
    }

    const { data } = await query.limit(50);
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}