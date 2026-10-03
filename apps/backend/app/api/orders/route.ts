import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, getUser } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const user = await getUser(token!);

    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { restaurantId, deliverySlotId, paymentMethod } = await request.json();

    // Get cart
    const { data: cart } = await supabaseServer
      .from('carts')
      .select('*, cart_items(*)')
      .eq('student_id', user.id)
      .eq('cart_type', 'food')
      .single();

    if (!cart || cart.cart_items.length === 0) {
      return NextResponse.json({ success: false, message: 'Cart is empty' }, { status: 400 });
    }

    // Validate slot
    const { data: slot } = await supabaseServer
      .from('delivery_slots')
      .select('*')
      .eq('id', deliverySlotId)
      .single();

    if (!slot || !slot.active) {
      return NextResponse.json({ success: false, message: 'Delivery slot unavailable' }, { status: 400 });
    }

    // Calculate totals server-side
    let subtotal = 0;
    const items = [];

    for (const cartItem of cart.cart_items) {
      const { data: foodItem } = await supabaseServer
        .from('food_items')
        .select('*')
        .eq('id', cartItem.item_id)
        .single();

      if (!foodItem || foodItem.is_sold_out) {
        return NextResponse.json({ success: false, message: `Item not available` }, { status: 400 });
      }
      subtotal += foodItem.price * cartItem.quantity;
      items.push({
        itemId: cartItem.item_id,
        quantity: cartItem.quantity,
        unitPrice: foodItem.price,
        itemName: foodItem.name,
      });
    }

    // Get fees from database
    const { data: feeConfig } = await supabaseServer
      .from('delivery_fee_config')
      .select('fee_amount')
      .single();
    const deliveryFee = feeConfig?.fee_amount ?? 10;

    const itemCount = cart.cart_items.reduce(
      (sum: number, item: { quantity: number }) => sum + (item.quantity || 0),
      0
    );
    const { data: feeRule } = await supabaseServer
      .from('platform_fee_rules')
      .select('fee_amount')
      .lte('min_items', itemCount)
      .gte('max_items', itemCount)
      .single();

    const platformFee = feeRule?.fee_amount ?? 0;
    const totalAmount = subtotal + deliveryFee + platformFee;

    // Create order
    const orderId = uuidv4();
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const { error: orderError } = await supabaseServer.from('orders').insert({
      id: orderId,
      order_number: orderNumber,
      student_id: user.id,
      restaurant_id: restaurantId,
      order_type: 'food',
      delivery_slot_id: deliverySlotId,
      subtotal,
      delivery_fee: deliveryFee,
      platform_fee: platformFee,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      payment_status: 'pending',
      order_status: 'placed',
      placed_at: new Date().toISOString(),
    });

    if (orderError) throw orderError;

    // Add order items
    for (const item of items) {
      await supabaseServer.from('order_items').insert({
        order_id: orderId,
        item_type: 'food',
        item_id: item.itemId,
        item_name: item.itemName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      });
    }

    // Clear cart
    await supabaseServer.from('cart_items').delete().eq('cart_id', cart.id);

    return NextResponse.json({
      success: true,
      order: { id: orderId, orderNumber, totalAmount, paymentMethod, orderStatus: 'placed' },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const user = await getUser(token!);

    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { data: orders } = await supabaseServer
      .from('orders')
      .select('*, order_items(*), delivery_slot:delivery_slots(*)')
      .eq('student_id', user.id)
      .order('placed_at', { ascending: false });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}