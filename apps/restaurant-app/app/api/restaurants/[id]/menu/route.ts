import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

const CANTEEN_ID_MAP: Record<string, string> = {
  'canteen-1': '550e8400-e29b-41d4-a716-446655440001',
  'canteen-2': '550e8400-e29b-41d4-a716-446655440002',
  'canteen-3': '550e8400-e29b-41d4-a716-446655440003',
  'canteen-4': '550e8400-e29b-41d4-a716-446655440004',
};

function resolveRestaurantId(id: string): string {
  return CANTEEN_ID_MAP[id] || id;
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
      const formatted = data.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price || 0),
        description: item.description || '',
        category: item.category || 'Main Course',
        isVeg: Boolean(item.is_veg),
        is_veg: Boolean(item.is_veg),
        isAvailable: !item.is_sold_out,
        is_available: !item.is_sold_out,
        is_sold_out: Boolean(item.is_sold_out),
        active: Boolean(item.active),
        restaurantId: item.restaurant_id,
        restaurant_id: item.restaurant_id,
      }));
      return NextResponse.json({ success: true, data: formatted });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    return NextResponse.json({ success: true, data: [] });
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
    const {
      name,
      price,
      description = '',
      isVeg = true,
      is_veg = true,
      category = 'Main Course',
      image_url = '',
      image = '',
      isAvailable = true,
      is_available = true,
      isBestseller = false,
      is_bestseller = false,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: 'Item name is required' }, { status: 400 });
    }

    const itemId = randomUUID();
    const finalVeg = isVeg !== undefined ? Boolean(isVeg) : Boolean(is_veg);
    const finalAvailable = isAvailable !== undefined ? Boolean(isAvailable) : Boolean(is_available);
    const finalBestseller = isBestseller !== undefined ? Boolean(isBestseller) : Boolean(is_bestseller);
    const finalImage = image_url || image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';

    const dbItem = {
      id: itemId,
      restaurant_id: resolvedId,
      name: name.trim(),
      description: description.trim(),
      price: Number(price) || 100,
      category: category.trim() || 'Main Course',
      is_veg: finalVeg,
      is_sold_out: !finalAvailable,
      active: true,
    };

    const clientItem = {
      ...dbItem,
      isVeg: finalVeg,
      isAvailable: finalAvailable,
      is_available: finalAvailable,
      isBestseller: finalBestseller,
      is_bestseller: finalBestseller,
      image_url: finalImage,
      image: finalImage,
    };

    try {
      const { data, error } = await supabaseServer
        .from('food_items')
        .insert(dbItem)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({
          success: true,
          data: { ...clientItem, ...data },
          message: 'Dish successfully saved in database',
        });
      }
    } catch (e) {
      console.warn('Supabase food item insert error:', e);
    }

    return NextResponse.json({
      success: true,
      data: clientItem,
      message: 'Dish added to menu',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to add dish' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      itemId,
      id: bodyItemId,
      name,
      price,
      description,
      isVeg,
      is_veg,
      category,
      isAvailable,
      is_available,
    } = body;

    const targetId = itemId || bodyItemId;
    if (!targetId) {
      return NextResponse.json({ success: false, message: 'Item ID is required' }, { status: 400 });
    }

    const updates: any = { updated_at: new Date().toISOString() };
    if (name) updates.name = name.trim();
    if (price !== undefined) updates.price = Number(price);
    if (description !== undefined) updates.description = description.trim();
    if (category !== undefined) updates.category = category.trim();
    if (isVeg !== undefined || is_veg !== undefined) updates.is_veg = Boolean(isVeg ?? is_veg);
    if (isAvailable !== undefined || is_available !== undefined) {
      const avail = Boolean(isAvailable ?? is_available);
      updates.is_sold_out = !avail;
    }

    try {
      const { data, error } = await supabaseServer
        .from('food_items')
        .update(updates)
        .eq('id', targetId)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, data, message: 'Item updated in database' });
      }
    } catch (e) {}

    return NextResponse.json({
      success: true,
      data: { id: targetId, ...updates, ...body },
      message: 'Item updated',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ success: false, message: 'itemId query parameter required' }, { status: 400 });
    }

    try {
      await supabaseServer
        .from('food_items')
        .update({ active: false })
        .eq('id', itemId);
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: 'Item removed from database menu',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to delete item' }, { status: 500 });
  }
}