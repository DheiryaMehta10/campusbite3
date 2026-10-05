import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { corsResponse, handleCorsOptions } from '@/lib/cors';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const body = await request.json();
    const { orderStatus, cancellationReason } = body;

    let dbStatus = orderStatus;
    const upper = String(orderStatus).toUpperCase();
    if (upper === 'ORDER_PLACED' || upper === 'PLACED') dbStatus = 'placed';
    else if (upper === 'RESTAURANT_ACCEPTED' || upper === 'ACCEPTED') dbStatus = 'restaurant_accepted';
    else if (upper === 'PREPARING') dbStatus = 'preparing';
    else if (upper === 'READY_FOR_DELIVERY' || upper === 'READY') dbStatus = 'ready_for_delivery';
    else if (upper === 'OUT_FOR_DELIVERY') dbStatus = 'out_for_delivery';
    else if (upper === 'ARRIVED') dbStatus = 'arrived';
    else if (upper === 'DELIVERED') dbStatus = 'delivered';
    else if (upper === 'CANCELLED') dbStatus = 'cancelled';
    else if (upper === 'UNCOLLECTED') dbStatus = 'uncollected';

    const updateData: any = { order_status: dbStatus, updated_at: new Date().toISOString() };
    const now = new Date().toISOString();

    if (dbStatus === 'restaurant_accepted') updateData.accepted_at = now;
    if (dbStatus === 'delivered') updateData.delivered_at = now;
    if (dbStatus === 'cancelled') updateData.cancelled_at = now;
    if (cancellationReason) updateData.cancellation_reason = cancellationReason;

    try {
      const { data: order } = await supabaseServer
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select('*, students(*)')
        .maybeSingle();

      if (dbStatus === 'uncollected' && order) {
        try {
          await supabaseServer.from('uncollected_orders').insert({
            order_id: order.id,
            student_id: order.student_id,
            contacted: false,
            collected: false,
          });
        } catch {}
      }
    } catch (dbErr) {
      console.warn('Supabase status update warning:', dbErr);
    }

    return corsResponse({
      success: true,
      message: `Order status updated to ${orderStatus}`,
      data: { id: orderId, orderStatus: upper },
    });
  } catch (error) {
    return corsResponse({ success: false, message: 'Failed to update order status' }, { status: 500 });
  }
}
