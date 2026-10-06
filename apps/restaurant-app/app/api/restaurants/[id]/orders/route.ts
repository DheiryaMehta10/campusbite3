import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { corsResponse, handleCorsOptions } from '@/lib/cors';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return handleCorsOptions();
}

const CANTEEN_ID_MAP: Record<string, string> = {
  'canteen-1': '550e8400-e29b-41d4-a716-446655440001',
  'canteen-2': '550e8400-e29b-41d4-a716-446655440002',
  'canteen-3': '550e8400-e29b-41d4-a716-446655440003',
  'canteen-4': '550e8400-e29b-41d4-a716-446655440004',
};

function resolveRestaurantId(id: string): string {
  return CANTEEN_ID_MAP[id] || id;
}

function formatOrder(dbOrder: any) {
  const items = (dbOrder.order_items || dbOrder.items || []).map((itm: any) => ({
    id: itm.id || itm.item_id,
    name: itm.item_name || itm.name || 'Food Item',
    itemName: itm.item_name || itm.name || 'Food Item',
    item_name: itm.item_name || itm.name || 'Food Item',
    quantity: Number(itm.quantity || 1),
    price: Number(itm.unit_price || itm.price || 0),
    unitPrice: Number(itm.unit_price || itm.price || 0),
  }));

  const studentName = dbOrder.students?.full_name || 'Student';
  const studentPhone = dbOrder.students?.phone_number || '';
  const hostelName = dbOrder.students?.hostel_name || '';
  const roomNumber = dbOrder.students?.room_number || '';
  const deliverySlot = dbOrder.delivery_slots?.name || 'Evening Slot (6-7 PM)';

  let orderStatus = dbOrder.order_status || 'ORDER_PLACED';
  const upperStatus = String(orderStatus).toUpperCase();
  if (orderStatus === 'placed' || upperStatus === 'ORDER_PLACED' || upperStatus === 'PLACED') orderStatus = 'ORDER_PLACED';
  else if (orderStatus === 'restaurant_accepted' || upperStatus === 'RESTAURANT_ACCEPTED' || upperStatus === 'ACCEPTED') orderStatus = 'RESTAURANT_ACCEPTED';
  else if (orderStatus === 'preparing' || upperStatus === 'PREPARING') orderStatus = 'PREPARING';
  else if (orderStatus === 'ready_for_delivery' || upperStatus === 'READY_FOR_DELIVERY' || upperStatus === 'READY') orderStatus = 'READY_FOR_DELIVERY';
  else if (orderStatus === 'out_for_delivery' || upperStatus === 'OUT_FOR_DELIVERY') orderStatus = 'OUT_FOR_DELIVERY';
  else if (orderStatus === 'arrived' || upperStatus === 'ARRIVED') orderStatus = 'ARRIVED';
  else if (orderStatus === 'delivered' || upperStatus === 'DELIVERED') orderStatus = 'DELIVERED';
  else if (orderStatus === 'cancelled' || upperStatus === 'CANCELLED') orderStatus = 'CANCELLED';
  else if (orderStatus === 'uncollected' || upperStatus === 'UNCOLLECTED') orderStatus = 'UNCOLLECTED';

  return {
    id: dbOrder.id,
    orderNumber: dbOrder.order_number,
    order_number: dbOrder.order_number,
    studentId: dbOrder.student_id,
    student_id: dbOrder.student_id,
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
    totalAmount: Number(dbOrder.total_amount || 0),
    total_amount: Number(dbOrder.total_amount || 0),
    orderStatus,
    order_status: orderStatus,
    placedAt: dbOrder.placed_at || dbOrder.created_at || new Date().toISOString(),
    placed_at: dbOrder.placed_at || dbOrder.created_at || new Date().toISOString(),
    items,
    order_items: items,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resolvedId = resolveRestaurantId(id);

    const { data: orders, error } = await supabaseServer
      .from('orders')
      .select('*, students(*), order_items(*), delivery_slots(*)')
      .or(`restaurant_id.eq.${resolvedId},restaurant_id.eq.${id}`)
      .order('placed_at', { ascending: false });

    if (error) {
      console.warn('Supabase restaurant orders query error:', error);
    }

    const formatted = (orders || []).map(formatOrder);
    return corsResponse({ success: true, data: formatted });
  } catch (error) {
    return corsResponse({ success: false, message: 'Server error' }, { status: 500 });
  }
}
