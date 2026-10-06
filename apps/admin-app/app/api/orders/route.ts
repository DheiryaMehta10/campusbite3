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

function formatOrder(dbOrder: any) {
  const items = (dbOrder.order_items || dbOrder.items || []).map((itm: any) => ({
    id: itm.id || itm.item_id || itm.itemId,
    name: itm.item_name || itm.itemName || itm.name || 'Food Item',
    itemName: itm.item_name || itm.itemName || itm.name || 'Food Item',
    item_name: itm.item_name || itm.itemName || itm.name || 'Food Item',
    quantity: Number(itm.quantity || 1),
    price: Number(itm.unit_price || itm.price || 0),
    unitPrice: Number(itm.unit_price || itm.price || 0),
  }));

  const studentName = dbOrder.students?.full_name || dbOrder.studentName || dbOrder.student_name || 'Student';
  const studentPhone = dbOrder.students?.phone_number || dbOrder.studentPhone || dbOrder.student_phone || '';
  const studentEmail = dbOrder.students?.email || dbOrder.studentEmail || dbOrder.student_email || '';
  const hostelName = dbOrder.students?.hostel_name || dbOrder.hostelName || dbOrder.hostel_name || '';
  const roomNumber = dbOrder.students?.room_number || dbOrder.roomNumber || dbOrder.room_number || '';
  const restaurantName = dbOrder.restaurants?.name || dbOrder.restaurantName || dbOrder.restaurant_name || 'Campus Canteen';
  const deliverySlot = dbOrder.delivery_slots?.name || dbOrder.deliverySlot || (typeof dbOrder.delivery_slot === 'object' ? dbOrder.delivery_slot?.name : dbOrder.delivery_slot) || 'Evening Slot 1 (6:00 PM – 7:00 PM)';

  let orderStatus = dbOrder.order_status || dbOrder.orderStatus || 'ORDER_PLACED';
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

  const rId = dbOrder.restaurant_id || dbOrder.restaurantId || '550e8400-e29b-41d4-a716-446655440001';

  return {
    id: dbOrder.id,
    orderNumber: dbOrder.order_number || dbOrder.orderNumber,
    order_number: dbOrder.order_number || dbOrder.orderNumber,
    studentId: dbOrder.student_id || dbOrder.studentId,
    student_id: dbOrder.student_id || dbOrder.studentId,
    studentName,
    student_name: studentName,
    studentEmail,
    student_email: studentEmail,
    studentPhone,
    student_phone: studentPhone,
    hostelName,
    hostel_name: hostelName,
    roomNumber,
    room_number: roomNumber,
    restaurantId: rId,
    restaurant_id: rId,
    restaurantName,
    deliverySlot,
    delivery_slot: { name: deliverySlot },
    subtotal: Number(dbOrder.subtotal || 0),
    deliveryFee: Number(dbOrder.delivery_fee || dbOrder.deliveryFee || 10),
    delivery_fee: Number(dbOrder.delivery_fee || dbOrder.deliveryFee || 10),
    platformFee: Number(dbOrder.platform_fee || dbOrder.platformFee || 2),
    platform_fee: Number(dbOrder.platform_fee || dbOrder.platformFee || 2),
    discount: Number(dbOrder.discount || 0),
    totalAmount: Number(dbOrder.total_amount || dbOrder.totalAmount || 0),
    total_amount: Number(dbOrder.total_amount || dbOrder.totalAmount || 0),
    paymentMethod: dbOrder.payment_method || dbOrder.paymentMethod || 'cod',
    payment_method: dbOrder.payment_method || dbOrder.paymentMethod || 'cod',
    paymentStatus: dbOrder.payment_status || dbOrder.paymentStatus || 'pending',
    orderStatus,
    order_status: orderStatus,
    placedAt: dbOrder.placed_at || dbOrder.placedAt || dbOrder.created_at || new Date().toISOString(),
    placed_at: dbOrder.placed_at || dbOrder.placedAt || dbOrder.created_at || new Date().toISOString(),
    items,
    order_items: items,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { data: orders, error } = await supabaseServer
      .from('orders')
      .select('*, students(*), restaurants(*), delivery_slots(*), order_items(*)')
      .order('placed_at', { ascending: false });

    if (error) {
      console.warn('Supabase admin orders query warning:', error.message);
    }

    const formatted = (orders || []).map(formatOrder);
    return corsResponse({
      success: true,
      data: formatted,
    });
  } catch (error) {
    return corsResponse({ success: false, message: 'Failed to fetch admin orders' }, { status: 500 });
  }
}