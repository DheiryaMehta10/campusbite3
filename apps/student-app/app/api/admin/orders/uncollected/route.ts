import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { corsResponse, handleCorsOptions } from '@/lib/cors';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return handleCorsOptions();
}

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
    return corsResponse({ success: true, data: data || [] });
  } catch (error) {
    return corsResponse({ success: false, message: 'Server error' }, { status: 500 });
  }
}