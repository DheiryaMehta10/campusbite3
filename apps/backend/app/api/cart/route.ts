import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, getUser } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const user = await getUser(token!);

    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { itemId, quantity } = await request.json();

    const { data: foodItem } = await supabaseServer.from('food_items').select('*').eq('id', itemId).single();
    if (!foodItem) return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });

    const { data: cart } = await supabaseServer
      .from('carts')
      .select('*')
      .eq('student_id', user.id)
      .eq('cart_type', 'food')
      .single();

    if (!cart) return NextResponse.json({ success: false, message: 'Cart not found' }, { status: 404 });

    await supabaseServer.from('cart_items').insert({
      cart_id: cart.id,
      item_type: 'food',
      item_id: itemId,
      quantity,
      unit_price: foodItem.price,
    });

    return NextResponse.json({ success: true, message: 'Item added to cart' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const user = await getUser(token!);

    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { data: cart } = await supabaseServer
      .from('carts')
      .select('*, cart_items(*, food_items(*))')
      .eq('student_id', user.id)
      .eq('cart_type', 'food')
      .single();

    return NextResponse.json({ success: true, data: cart });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const user = await getUser(token!);

    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { cartItemId } = await request.json();

    await supabaseServer.from('cart_items').delete().eq('id', cartItemId);

    return NextResponse.json({ success: true, message: 'Item removed' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
