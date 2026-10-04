import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

const GLOBAL_ORDERS: any[] = [];

const DEFAULT_SLOTS_MAP: Record<string, string> = {
  '550e8400-e29b-41d4-a716-446655440101': 'Evening Slot 1 (6:00 PM – 7:00 PM)',
  '550e8400-e29b-41d4-a716-446655440102': 'Evening Slot 2 (7:00 PM – 8:00 PM)',
  '550e8400-e29b-41d4-a716-446655440103': 'Night Canteen Slot (9:30 PM – 10:30 PM)',
  '550e8400-e29b-41d4-a716-446655440104': 'Late Night Snack Slot (11:30 PM – 12:30 AM)',
  'slot-eve-1': 'Evening Slot 1 (6:00 PM – 7:00 PM)',
  'slot-eve-2': 'Evening Slot 2 (7:00 PM – 8:00 PM)',
  'slot-night': 'Night Canteen Slot (9:30 PM – 10:30 PM)',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentId,
      studentName = 'Student',
      studentPhone = '9876543210',
      restaurantId = 'canteen-1',
      restaurantName = 'North Campus Central Canteen',
      catalogType = 'food',
      deliverySlotId = '550e8400-e29b-41d4-a716-446655440101',
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

    const student_id = studentId || body.userId || 'student-demo';

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Order must contain at least one item' }, { status: 400 });
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

    let platformFee = 2.0;
    if (customPlatformFee !== undefined) {
      platformFee = Number(customPlatformFee);
    } else if (totalItemCount >= 4) {
      platformFee = 4.0;
    }

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

    const newOrder = {
      id: orderId,
      orderNumber,
      order_number: orderNumber,
      studentId: student_id,
      student_id,
      studentName,
      student_name: studentName,
      studentPhone,
      student_phone: studentPhone,
      hostelName,
      hostel_name: hostelName,
      roomNumber,
      room_number: roomNumber,
      restaurantId,
      restaurant_id: restaurantId,
      restaurantName,
      deliverySlotId,
      delivery_slot_id: deliverySlotId,
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

    GLOBAL_ORDERS.unshift(newOrder);

    try {
      await supabaseServer.from('orders').insert({
        id: orderId,
        order_number: orderNumber,
        student_id: student_id,
        restaurant_id: restaurantId,
        catalog_type: catalogType,
        delivery_slot_id: deliverySlotId,
        subtotal,
        delivery_fee: deliveryFee,
        platform_fee: platformFee,
        discount,
        total_amount: finalTotal,
        payment_method: paymentMethod,
        order_status: 'placed',
        placed_at: new Date().toISOString(),
      });
    } catch {}

    return NextResponse.json({
      success: true,
      order: newOrder,
      data: newOrder,
      message: `Order #${orderNumber} placed successfully!`,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
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

    let result = [...GLOBAL_ORDERS];

    if (orderId) {
      const found = result.find((o) => o.id === orderId || o.orderNumber === orderId);
      return NextResponse.json({ success: true, data: found || result[0] || null });
    }

    if (studentId) {
      result = result.filter((o) => o.studentId === studentId || o.student_id === studentId);
    } else if (restaurantId) {
      result = result.filter((o) => o.restaurantId === restaurantId || o.restaurant_id === restaurantId);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: true, data: GLOBAL_ORDERS });
  }
}