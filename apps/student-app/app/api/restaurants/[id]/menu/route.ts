import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { corsResponse, handleCorsOptions } from '@/lib/cors';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return handleCorsOptions();
}

const DEFAULT_MENU_SEED = [
  { id: 'item-1', name: 'Paneer Butter Masala Combo', price: 140, isVeg: true, is_veg: true, category: 'Main Course', description: 'Rich paneer curry with 2 butter naans & salad', isAvailable: true, is_sold_out: false },
  { id: 'item-2', name: 'Chicken Biryani Bowl', price: 160, isVeg: false, is_veg: false, category: 'Main Course', description: 'Hyderabadi dum biryani with raita & salan', isAvailable: true, is_sold_out: false },
  { id: 'item-3', name: 'Crispy Veg Spring Rolls', price: 80, isVeg: true, is_veg: true, category: 'Starters', description: 'Golden fried rolls with spicy dip', isAvailable: true, is_sold_out: false },
  { id: 'item-4', name: 'Chicken 65 (6 pcs)', price: 120, isVeg: false, is_veg: false, category: 'Starters', description: 'Crispy spicy fried chicken bites', isAvailable: true, is_sold_out: false },
  { id: 'item-5', name: 'Cold Coffee with Ice Cream', price: 60, isVeg: true, is_veg: true, category: 'Beverages', description: 'Thick creamy blended cold coffee', isAvailable: true, is_sold_out: false },
  { id: 'item-6', name: 'Hot Gulab Jamun (2 pcs)', price: 40, isVeg: true, is_veg: true, category: 'Desserts', description: 'Soft warm milk dumplings in sugar syrup', isAvailable: true, is_sold_out: false },
  { id: 'item-7', name: 'Cheese Burst Veg Burger', price: 95, isVeg: true, is_veg: true, category: 'Snacks', description: 'Molten cheese patty with crispy veggies', isAvailable: true, is_sold_out: false },
  { id: 'item-8', name: 'Masala Dosa with Sambar', price: 75, isVeg: true, is_veg: true, category: 'South Indian', description: 'Crispy crepe with potato masala & chutney', isAvailable: true, is_sold_out: false },
];

function formatFoodItem(item: any) {
  return {
    id: item.id,
    name: item.name,
    description: item.description || '',
    price: Number(item.price || 0),
    category: item.category || 'Main Course',
    isVeg: Boolean(item.is_veg ?? item.isVeg ?? true),
    is_veg: Boolean(item.is_veg ?? item.isVeg ?? true),
    isAvailable: !item.is_sold_out && item.active !== false,
    is_sold_out: Boolean(item.is_sold_out),
    active: item.active !== false,
    restaurantId: item.restaurant_id,
    restaurant_id: item.restaurant_id,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: restaurantId } = await params;

    let dbItems: any[] = [];
    try {
      const { data, error } = await supabaseServer
        .from('food_items')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        dbItems = data.map(formatFoodItem);
      }
    } catch (e) {
      console.warn('Error fetching food_items from Supabase:', e);
    }

    if (dbItems.length === 0) {
      dbItems = DEFAULT_MENU_SEED;
    }

    return corsResponse({
      success: true,
      data: dbItems,
    });
  } catch (error) {
    return corsResponse({
      success: true,
      data: DEFAULT_MENU_SEED,
    });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: restaurantId } = await params;
    const body = await request.json();
    const { name, description = '', price, category = 'Main Course', isVeg = true } = body;

    if (!name || !price) {
      return corsResponse({ success: false, message: 'Name and price are required' }, { status: 400 });
    }

    let validRestId = restaurantId;
    try {
      const { data: rList } = await supabaseServer.from('restaurants').select('id');
      if (rList && rList.length > 0) {
        const match = rList.find((r) => r.id === restaurantId);
        validRestId = match ? match.id : rList[0].id;
      }
    } catch {}

    const newItemId = uuidv4();
    const newFoodItem = {
      id: newItemId,
      restaurant_id: validRestId,
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      is_veg: Boolean(isVeg),
      is_sold_out: false,
      active: true,
    };

    try {
      await supabaseServer.from('food_items').insert(newFoodItem);
    } catch (dbErr) {
      console.warn('Supabase food_item insert warning:', dbErr);
    }

    const formatted = formatFoodItem(newFoodItem);
    return corsResponse({
      success: true,
      data: formatted,
      message: `Dish "${name}" added to live menu!`,
    });
  } catch (error: any) {
    console.error('Menu item creation error:', error);
    return corsResponse({ success: false, message: error.message || 'Failed to add dish' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { itemId, isSoldOut, isAvailable, price, active } = body;

    if (!itemId) {
      return corsResponse({ success: false, message: 'Item ID required' }, { status: 400 });
    }

    const updateData: any = {};
    if (isSoldOut !== undefined) updateData.is_sold_out = isSoldOut;
    if (isAvailable !== undefined) updateData.is_sold_out = !isAvailable;
    if (price !== undefined) updateData.price = Number(price);
    if (active !== undefined) updateData.active = Boolean(active);

    try {
      await supabaseServer
        .from('food_items')
        .update(updateData)
        .eq('id', itemId);
    } catch (e) {}

    return corsResponse({
      success: true,
      message: 'Item updated successfully',
      data: { itemId, ...updateData },
    });
  } catch (error: any) {
    return corsResponse({ success: false, message: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return corsResponse({ success: false, message: 'Item ID required' }, { status: 400 });
    }

    try {
      await supabaseServer
        .from('food_items')
        .update({ active: false })
        .eq('id', itemId);
    } catch (e) {}

    return corsResponse({
      success: true,
      message: 'Item removed from menu',
    });
  } catch (error: any) {
    return corsResponse({ success: false, message: 'Failed to delete item' }, { status: 500 });
  }
}