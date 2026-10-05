import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { corsResponse, handleCorsOptions } from '@/lib/cors';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return handleCorsOptions();
}

// In-memory cache for ultra-fast instant live sync & fallback across instances
const MEMORY_ORDERS: any[] = [];

const DEFAULT_SLOTS_MAP: Record<string, string> = {
  '550e8400-e29b-41d4-a716-446655440101': 'Evening Slot 1 (6:00 PM – 7:00 PM)',
  '550e8400-e29b-41d4-a716-446655440102': 'Evening Slot 2 (7:00 PM – 8:00 PM)',
  '550e8400-e29b-41d4-a716-446655440103': 'Night Canteen Slot (9:30 PM – 10:30 PM)',
  '550e8400-e29b-41d4-a716-446655440104': 'Late Night Snack Slot (11:30 PM – 12:30 AM)',
  'slot-eve-1': 'Evening Slot 1 (6:00 PM – 7:00 PM)',
  'slot-eve-2': 'Evening Slot 2 (7:00 PM – 8:00 PM)',
  'slot-night': 'Night Canteen Slot (9:30 PM – 10:30 PM)',
  '4a7cabf4-a40e-4fa8-92f2-d12586ca69f1': 'Lunch Slot (12:00 PM – 1:00 PM)',
  '4a511603-db68-4dee-b602-0478566adedd': 'Evening Slot 1 (6:00 PM – 7:00 PM)',
  'e5df2f44-35eb-4f99-838e-98570c6536c8': 'Evening Slot 2 (7:00 PM – 8:00 PM)',
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
  const studentPhone = dbOrder.students?.phone_number || dbOrder.studentPhone || dbOrder.student_phone || '9876543210';
  const hostelName = dbOrder.students?.hostel_name || dbOrder.hostelName || dbOrder.hostel_name || 'Tagore Hostel Block A';
  const roomNumber = dbOrder.roomNumber || dbOrder.room_number || '304';
  const restaurantName = dbOrder.restaurants?.name || dbOrder.restaurantName || dbOrder.restaurant_name || 'North Campus Central Canteen';
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

  return {
    id: dbOrder.id,
    orderNumber: dbOrder.order_number || dbOrder.orderNumber,
    order_number: dbOrder.order_number || dbOrder.orderNumber,
    studentId: dbOrder.student_id || dbOrder.studentId,
    student_id: dbOrder.student_id || dbOrder.studentId,
    studentName,
    student_name: studentName,
    studentPhone,
    student_phone: studentPhone,
    hostelName,
    hostel_name: hostelName,
    roomNumber,
    room_number: roomNumber,
    restaurantId: dbOrder.restaurant_id || dbOrder.restaurantId,
    restaurant_id: dbOrder.restaurant_id || dbOrder.restaurantId,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentId,
      studentName = 'Student',
      studentPhone = '9876543210',
      restaurantId = '550e8400-e29b-41d4-a716-446655440000',
      restaurantName = 'North Campus Central Canteen',
      catalogType = 'food',
      deliverySlotId = '4a511603-db68-4dee-b602-0478566adedd',
      items = [],
      promoCode,
      paymentMethod = 'cod',
      hostelName = 'Tagore Hostel Block A',
      roomNumber = '304',
      itemTotal,
      deliveryFee: customDeliveryFee,
      platformFee: customPlatformFee,
      discount: customDiscount,
      totalAmount: customTotalAmount,
    } = body;

    const normalizedPhone = String(studentPhone || '9876543210').replace(/\D/g, '').slice(-10) || '9876543210';

    if (!items || items.length === 0) {
      return corsResponse({ success: false, message: 'Order must contain at least one item' }, { status: 400 });
    }

    let subtotal = 0;
    const validatedItems = items.map((itm: any) => {
      const unitPrice = Number(itm.price || 50);
      const qty = Math.max(1, Number(itm.quantity || 1));
      subtotal += unitPrice * qty;
      return {
        item_id: itm.id || itm.itemId || 'item-1',
        name: itm.name || 'Food Item',
        item_name: itm.name || 'Food Item',
        quantity: qty,
        price: unitPrice,
        unit_price: unitPrice,
      };
    });

    const totalItemCount = validatedItems.reduce((acc: number, it: any) => acc + it.quantity, 0);
    const deliveryFee = customDeliveryFee !== undefined ? Number(customDeliveryFee) : 10.0;
    const platformFee = customPlatformFee !== undefined ? Number(customPlatformFee) : (totalItemCount >= 4 ? 4.0 : 2.0);

    let discount = customDiscount ? Number(customDiscount) : 0;
    if (promoCode && !discount) {
      const code = String(promoCode).toUpperCase().trim();
      if (code === 'FIRSTBITE') {
        discount = Math.min(50, Math.round(subtotal * 0.2));
      } else if (code === 'CAMPUS50' && subtotal >= 150) {
        discount = 50;
      }
    }

    const finalTotal = customTotalAmount !== undefined
      ? Number(customTotalAmount)
      : Math.max(0, subtotal + deliveryFee + platformFee - discount);

    const orderId = uuidv4();
    const orderNumber = `CB-${Math.floor(1000 + Math.random() * 9000)}`;
    const slotName = DEFAULT_SLOTS_MAP[deliverySlotId] || 'Evening Slot 1 (6:00 PM – 7:00 PM)';

    // 1. Ensure student exists in Supabase
    let dbStudentId: string = uuidv4();
    try {
      const { data: existingStudent } = await supabaseServer
        .from('students')
        .select('id')
        .eq('phone_number', normalizedPhone)
        .maybeSingle();

      if (existingStudent?.id) {
        dbStudentId = existingStudent.id;
        await supabaseServer.from('students').update({
          full_name: studentName || 'Student',
          hostel_name: hostelName || 'Tagore Hostel Block A',
          room_number: roomNumber || '304',
        }).eq('id', dbStudentId);
      } else {
        const { data: createdStudent } = await supabaseServer.from('students').insert({
          id: dbStudentId,
          phone_number: normalizedPhone,
          full_name: studentName || 'Student',
          college_name: 'Campus University',
          hostel_name: hostelName || 'Tagore Hostel Block A',
          room_number: roomNumber || '304',
          email: `${normalizedPhone}@campus.edu`,
        }).select().single();
        if (createdStudent?.id) dbStudentId = createdStudent.id;
      }
    } catch (sErr) {
      console.warn('Student upsert notice:', sErr);
    }

    // 2. Fetch valid restaurant and slot IDs from Supabase
    let validRestId = restaurantId;
    try {
      const { data: rList } = await supabaseServer.from('restaurants').select('id');
      if (rList && rList.length > 0) {
        const match = rList.find((r) => r.id === restaurantId);
        validRestId = match ? match.id : rList[0].id;
      }
    } catch {}

    let validSlotId = deliverySlotId;
    try {
      const { data: sList } = await supabaseServer.from('delivery_slots').select('id');
      if (sList && sList.length > 0) {
        const match = sList.find((s) => s.id === deliverySlotId);
        validSlotId = match ? match.id : sList[0].id;
      }
    } catch {}

    const newOrderObj = {
      id: orderId,
      orderNumber,
      order_number: orderNumber,
      studentId: dbStudentId,
      student_id: dbStudentId,
      studentName,
      student_name: studentName,
      studentPhone: normalizedPhone,
      student_phone: normalizedPhone,
      hostelName,
      hostel_name: hostelName,
      roomNumber,
      room_number: roomNumber,
      restaurantId: validRestId,
      restaurant_id: validRestId,
      restaurantName,
      deliverySlotId: validSlotId,
      delivery_slot_id: validSlotId,
      deliverySlot: slotName,
      delivery_slot: { name: slotName },
      catalogType,
      subtotal,
      deliveryFee,
      delivery_fee: deliveryFee,
      platformFee,
      platform_fee: platformFee,
      discount,
      totalAmount: finalTotal,
      total_amount: finalTotal,
      paymentMethod,
      payment_method: paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'ORDER_PLACED',
      order_status: 'ORDER_PLACED',
      placedAt: new Date().toISOString(),
      placed_at: new Date().toISOString(),
      items: validatedItems,
      order_items: validatedItems,
    };

    MEMORY_ORDERS.unshift(newOrderObj);

    // 3. Save persistently to Supabase orders table
    try {
      const { error: ordInsertErr } = await supabaseServer.from('orders').insert({
        id: orderId,
        order_number: orderNumber,
        student_id: dbStudentId,
        restaurant_id: validRestId,
        delivery_slot_id: validSlotId,
        order_type: catalogType || 'food',
        subtotal,
        delivery_fee: deliveryFee,
        platform_fee: platformFee,
        total_amount: finalTotal,
        payment_method: paymentMethod,
        payment_status: 'pending',
        order_status: 'placed',
      });

      if (ordInsertErr) {
        console.error('Supabase order insert error:', ordInsertErr);
      }

      if (validatedItems.length > 0) {
        const itemsToInsert = validatedItems.map((itm: any) => ({
          id: uuidv4(),
          order_id: orderId,
          item_type: 'food',
          item_name: itm.name,
          quantity: itm.quantity,
          unit_price: itm.price,
        }));
        const { error: itmInsertErr } = await supabaseServer.from('order_items').insert(itemsToInsert);
        if (itmInsertErr) {
          console.error('Supabase order_items insert error:', itmInsertErr);
        }
      }
    } catch (dbErr) {
      console.error('Supabase order save error:', dbErr);
    }

    return corsResponse({
      success: true,
      order: newOrderObj,
      data: newOrderObj,
      message: `Order #${orderNumber} placed successfully!`,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return corsResponse(
      { success: false, message: error.message || 'Failed to place order. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('studentId');
    const restaurantId = searchParams.get('restaurantId');
    const orderId = searchParams.get('orderId');

    let dbOrders: any[] = [];
    try {
      const { data, error } = await supabaseServer
        .from('orders')
        .select('*, students(*), restaurants(*), delivery_slots(*), order_items(*)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbOrders = data.map(formatOrder);
      }
    } catch (e) {
      console.warn('Error fetching orders from Supabase:', e);
    }

    const combinedMap = new Map<string, any>();
    for (const mem of MEMORY_ORDERS) {
      combinedMap.set(mem.id, formatOrder(mem));
      if (mem.orderNumber) combinedMap.set(mem.orderNumber, formatOrder(mem));
    }
    for (const dbo of dbOrders) {
      combinedMap.set(dbo.id, dbo);
      if (dbo.orderNumber) combinedMap.set(dbo.orderNumber, dbo);
    }

    const uniqueOrders = Array.from(new Set(Array.from(combinedMap.values())));
    uniqueOrders.sort((a, b) => new Date(b.placedAt || 0).getTime() - new Date(a.placedAt || 0).getTime());

    let result = uniqueOrders;

    if (orderId) {
      const found = uniqueOrders.find((o) => o.id === orderId || o.orderNumber === orderId || o.order_number === orderId);
      return corsResponse({ success: true, data: found || uniqueOrders[0] || null });
    }

    if (studentId) {
      result = result.filter((o) => o.studentId === studentId || o.student_id === studentId || o.studentPhone === studentId || o.student_phone === studentId);
    } else if (restaurantId) {
      result = result.filter((o) => o.restaurantId === restaurantId || o.restaurant_id === restaurantId);
    }

    return corsResponse({ success: true, data: result });
  } catch (error) {
    return corsResponse({ success: true, data: MEMORY_ORDERS });
  }
}