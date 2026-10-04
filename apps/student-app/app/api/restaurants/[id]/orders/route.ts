import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { corsResponse, handleCorsOptions } from '@/lib/cors';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return handleCorsOptions();
}

function formatOrder(dbOrder: any) {
  const items = (dbOrder.order_items || []).map((itm: any) => ({
    id: itm.id || itm.item_id,
    name: itm.item_name || itm.name || 'Food Item',
    itemName: itm.item_name || itm.name || 'Food Item',
    quantity: Number(itm.quantity || 1),
    price: Number(itm.unit_price || itm.price || 0),
  }));

  const studentName = dbOrder.students?.full_name || 'Student';
  const studentPhone = dbOrder.students?.phone_number || '9876543210';
  const hostelName = dbOrder.students?.hostel_name || 'Tagore Hostel Block A';
  const roomNumber = dbOrder.students?.room_number || '304';
  const deliverySlot = dbOrder.delivery_slots?.name || 'Evening Slot 1 (6:00 PM – 7:00 PM)';

  let orderStatus = dbOrder.order_status || 'ORDER_PLACED';
  const upper = String(orderStatus).toUpperCase();
  if (orderStatus === 'placed' || upper === 'ORDER_PLACED') orderStatus = 'ORDER_PLACED';
  else if (orderStatus === 'restaurant_accepted' || upper === 'RESTAURANT_ACCEPTED') orderStatus = 'RESTAURANT_ACCEPTED';
  else if (orderStatus === 'preparing' || upper === 'PREPARING') orderStatus = 'PREPARING';
  else if (orderStatus === 'ready_for_delivery' || upper === 'READY_FOR_DELIVERY') orderStatus = 'READY_FOR_DELIVERY';
  else if (orderStatus === 'out_for_delivery' || upper === 'OUT_FOR_DELIVERY') orderStatus = 'OUT_FOR_DELIVERY';
  else if (orderStatus === 'arrived' || upper === 'ARRIVED') orderStatus = 'ARRIVED';
  else if (orderStatus === 'delivered' || upper === 'DELIVERED') orderStatus = 'DELIVERED';
  else if (orderStatus === 'cancelled' || upper === 'CANCELLED') orderStatus = 'CANCELLED';
  else if (orderStatus === 'uncollected' || upper === 'UNCOLLECTED') orderStatus = 'UNCOLLECTED';

  return {
    id: dbOrder.id,
    orderNumber: dbOrder.order_number,
    order_number: dbOrder.order_number,
    studentName,
    student_name: studentName,
    studentPhone,
    student_phone: studentPhone,
    hostelName,
    hostel_name: hostelName,
    roomNumber,
    room_number: roomNumber,
    restaurantId: dbOrder.restaurant_id,
    restaurant_id: dbOrder.restaurant_id,
    deliverySlot,
    delivery_slot: { name: deliverySlot },
    subtotal: Number(dbOrder.subtotal || 0),
    totalAmount: Number(dbOrder.total_amount || 0),
    total_amount: Number(dbOrder.total_amount || 0),
    orderStatus,
    order_status: orderStatus,
    placedAt: dbOrder.placed_at || dbOrder.created_at,
    placed_at: dbOrder.placed_at || dbOrder.created_at,
    items,
    order_items: items,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: restaurantId } = await params;

    let query = supabaseServer
      .from('orders')
      .select('*, students(*), delivery_slots(*), order_items(*)')
      .order('created_at', { ascending: false });

    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(restaurantId)) {
      query = query.eq('restaurant_id', restaurantId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const formatted = (data || []).map(formatOrder);
    return corsResponse({ success: true, data: formatted });
  } catch (error) {
    return corsResponse({ success: true, data: [] });
  }
}
