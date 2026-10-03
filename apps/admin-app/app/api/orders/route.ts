import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, getUser } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentId,
      restaurantId,
      catalogType = 'food',
      deliverySlotId,
      items: rawItems,
      promoCode,
      paymentMethod = 'cod',
      hostelName,
      roomNumber,
      notes,
    } = body;

    // Verify student
    const student_id = studentId || body.userId;
    if (!student_id) {
      return NextResponse.json({ success: false, message: 'Student identification required' }, { status: 400 });
    }

    // Fetch and validate Delivery Slot server-side
    const { data: slot, error: slotErr } = await supabaseServer
      .from('delivery_slots')
      .select('*')
      .eq('id', deliverySlotId)
      .maybeSingle();

    if (slotErr || !slot || !slot.active) {
      return NextResponse.json({ success: false, message: 'Selected delivery slot is currently unavailable' }, { status: 400 });
    }

    // Server-side cutoff validation
    const now = new Date();
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;
    if (currentTimeStr > slot.cutoff_time) {
      return NextResponse.json({
        success: false,
        message: `Cutoff time (${slot.cutoff_time}) for ${slot.name} has passed. Please select another slot.`,
      }, { status: 400 });
    }

    // Check restaurant operational status if food order
    if (catalogType === 'food' && restaurantId) {
      const { data: restaurant } = await supabaseServer
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .maybeSingle();

      if (restaurant?.operational_status === 'temporarily_closed') {
        return NextResponse.json({
          success: false,
          message: 'This restaurant is temporarily closed and not accepting new orders.',
        }, { status: 400 });
      }
    }

    // Recalculate Subtotal Server-Side (NEVER trust client prices)
    let subtotal = 0;
    const validatedItems: any[] = [];
    const itemsToProcess = rawItems || [];

    if (itemsToProcess.length === 0) {
      return NextResponse.json({ success: false, message: 'Order must contain at least one item' }, { status: 400 });
    }

    for (const item of itemsToProcess) {
      let unitPrice = 0;
      let itemName = item.name || 'Item';

      if (catalogType === 'food') {
        const { data: food } = await supabaseServer
          .from('food_items')
          .select('*')
          .eq('id', item.id || item.itemId)
          .maybeSingle();

        if (!food || food.is_sold_out || !food.active) {
          return NextResponse.json({ success: false, message: `Item "${food?.name || 'Item'}" is currently sold out` }, { status: 400 });
        }
        unitPrice = Number(food.price);
        itemName = food.name;
      } else if (catalogType === 'grocery') {
        const { data: groc } = await supabaseServer
          .from('grocery_items')
          .select('*')
          .eq('id', item.id || item.itemId)
          .maybeSingle();

        unitPrice = item.price ? Number(item.price) : 50;
        itemName = groc?.name || item.name;
      } else if (catalogType === 'medical') {
        const { data: med } = await supabaseServer
          .from('medical_items')
          .select('*')
          .eq('id', item.id || item.itemId)
          .maybeSingle();

        if (med?.name?.toLowerCase().includes('thermometer')) {
          return NextResponse.json({ success: false, message: 'Item not permitted in MVP catalog' }, { status: 400 });
        }

        unitPrice = med ? Number(med.price) : Number(item.price || 40);
        itemName = med?.name || item.name;
      }

      const qty = Math.max(1, Number(item.quantity || 1));
      subtotal += unitPrice * qty;

      validatedItems.push({
        item_type: catalogType,
        item_id: item.id || item.itemId,
        item_name: itemName,
        variant_name: item.variantName || null,
        quantity: qty,
        unit_price: unitPrice,
      });
    }

    // Get Delivery Fee from Database Config (Default ₹10)
    const { data: feeConfig } = await supabaseServer
      .from('delivery_fee_config')
      .select('fee_amount')
      .maybeSingle();
    const deliveryFee = Number(feeConfig?.fee_amount ?? 10.00);

    // Calculate Platform Fee from Configurable Rules
    const totalItemCount = validatedItems.reduce((acc, it) => acc + it.quantity, 0);
    const { data: platformRule } = await supabaseServer
      .from('platform_fee_rules')
      .select('fee_amount')
      .lte('min_items', totalItemCount)
      .gte('max_items', totalItemCount)
      .eq('active', true)
      .maybeSingle();

    // Default: 1-3 items -> ₹2, 4-7 items -> ₹4
    let platformFee = 0;
    if (platformRule) {
      platformFee = Number(platformRule.fee_amount);
    } else if (totalItemCount >= 1 && totalItemCount <= 3) {
      platformFee = 2.00;
    } else if (totalItemCount >= 4 && totalItemCount <= 7) {
      platformFee = 4.00;
    }

    // Optional Promo Discount Check
    let discount = 0;
    if (promoCode) {
      const { data: promo } = await supabaseServer
        .from('promo_codes')
        .select('*')
        .ilike('code', promoCode.trim())
        .eq('active', true)
        .maybeSingle();

      if (promo && subtotal >= (promo.min_order_amount || 0)) {
        if (promo.discount_amount > 0) discount = promo.discount_amount;
        else if (promo.discount_percent > 0) discount = (subtotal * promo.discount_percent) / 100;
        discount = Math.min(discount, subtotal);
      }
    }

    const finalTotal = Math.max(0, subtotal + deliveryFee + platformFee - discount);
    const orderId = uuidv4();
    const orderNumber = `CB-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // Insert Order Record
    const { error: orderError } = await supabaseServer.from('orders').insert({
      id: orderId,
      order_number: orderNumber,
      student_id: student_id,
      restaurant_id: restaurantId || null,
      catalog_type: catalogType,
      delivery_slot_id: deliverySlotId,
      subtotal: Number(subtotal.toFixed(2)),
      delivery_fee: Number(deliveryFee.toFixed(2)),
      platform_fee: Number(platformFee.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      total_amount: Number(finalTotal.toFixed(2)),
      payment_method: paymentMethod,
      payment_status: 'pending',
      order_status: 'placed',
      placed_at: new Date().toISOString(),
    });

    if (orderError) throw orderError;

    // Insert Snapshot Items
    const itemsToInsert = validatedItems.map((v) => ({
      order_id: orderId,
      ...v,
    }));
    await supabaseServer.from('order_items').insert(itemsToInsert);

    return NextResponse.json({
      success: true,
      data: {
        id: orderId,
        orderNumber,
        subtotal,
        deliveryFee,
        platformFee,
        discount,
        totalAmount: finalTotal,
        orderStatus: 'placed',
        paymentMethod,
        slotName: slot.name,
      },
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error creating order' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('studentId');
    const restaurantId = searchParams.get('restaurantId');
    const orderId = searchParams.get('orderId');

    let query = supabaseServer
      .from('orders')
      .select('*, order_items(*), delivery_slots(*), restaurants(name, image_url), students(full_name, phone_number, hostel_name, room_number)')
      .order('placed_at', { ascending: false });

    if (orderId) {
      query = query.eq('id', orderId);
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (studentId) {
      query = query.eq('student_id', studentId);
    } else if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }

    const { data: orders, error } = await query.limit(50);
    if (error) throw error;

    return NextResponse.json({ success: true, data: orders || [] });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error fetching orders' }, { status: 500 });
  }
}