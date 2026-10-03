import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const { orderStatus, cancellationReason } = await request.json();

    const updateData: any = { order_status: orderStatus };
    const now = new Date().toISOString();

    if (orderStatus === 'restaurant_accepted') updateData.accepted_at = now;
    if (orderStatus === 'ready_for_delivery') updateData.ready_at = now;
    if (orderStatus === 'delivered') updateData.delivered_at = now;
    if (cancellationReason) updateData.cancellation_reason = cancellationReason;

    const { data: order, error } = await supabaseServer
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select('*, students(*)')
      .single();

    if (error) throw error;

    // If order is uncollected, automatically add to uncollected_orders
    if (orderStatus === 'uncollected' && order) {
      await supabaseServer.from('uncollected_orders').insert({
        order_id: order.id,
        student_id: order.student_id,
        contacted: false,
        collected: false,
      });
    }

    return NextResponse.json({ success: true, message: `Order status updated to ${orderStatus}`, data: order });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update order status' }, { status: 500 });
  }
}
