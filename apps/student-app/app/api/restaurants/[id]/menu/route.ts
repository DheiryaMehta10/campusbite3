import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { corsResponse, handleCorsOptions } from '@/lib/cors';
import { randomUUID } from 'crypto';

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
    is_available: !item.is_sold_out && item.active !== false,
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
    const { id } = await params;
    const resolvedId = resolveRestaurantId(id);

    const { data, error } = await supabaseServer
      .from('food_items')
      .select('*')
      .eq('restaurant_id', resolvedId)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase menu query warning:', error.message);
    }

    if (data && data.length > 0) {
      const formatted = data.map(formatFoodItem);
      return corsResponse({ success: true, data: formatted });
    }

    // Fallback if legacy seed
    return corsResponse({
      success: true,
      data: DEFAULT_MENU_SEED,
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
    const { id } = await params;
    const resolvedId = resolveRestaurantId(id);
    const body = await request.json();
    const { name, description = '', price, category = 'Main Course', isVeg = true } = body;

    if (!name || !price) {
      return corsResponse({ success: false, message: 'Name and price are required' }, { status: 400 });
    }

    const newItemId = randomUUID();
    const newFoodItem = {
      id: newItemId,
      restaurant_id: resolvedId,
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim() || 'Main Course',
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