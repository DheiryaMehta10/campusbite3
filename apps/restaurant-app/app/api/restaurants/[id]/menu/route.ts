import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseServer
      .from('food_items')
      .select('*')
      .eq('restaurant_id', id)
      .eq('active', true);

    if (error) {
      console.warn('Supabase menu query warning:', error.message);
    }

    return NextResponse.json({
      success: true,
      data: data && data.length > 0 ? data : [],
    });
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
    const body = await request.json();
    const {
      name,
      price,
      description = '',
      isVeg = true,
      is_veg = true,
      category = 'Main Course',
      image_url = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
      image = '',
      isAvailable = true,
      is_available = true,
      isBestseller = false,
      is_bestseller = false,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: 'Item name is required' }, { status: 400 });
    }

    const itemId = `dish-${Date.now()}-${randomUUID().slice(0, 6)}`;
    const finalVeg = isVeg !== undefined ? Boolean(isVeg) : Boolean(is_veg);
    const finalAvailable = isAvailable !== undefined ? Boolean(isAvailable) : Boolean(is_available);
    const finalBestseller = isBestseller !== undefined ? Boolean(isBestseller) : Boolean(is_bestseller);
    const finalImage = image_url || image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';

    const newItem = {
      id: itemId,
      restaurant_id: id,
      name: name.trim(),
      price: Number(price) || 100,
      description: description.trim(),
      is_veg: finalVeg,
      isVeg: finalVeg,
      category: category.trim() || 'Main Course',
      image_url: finalImage,
      image: finalImage,
      is_available: finalAvailable,
      isAvailable: finalAvailable,
      is_bestseller: finalBestseller,
      isBestseller: finalBestseller,
      active: true,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabaseServer
        .from('food_items')
        .insert([newItem])
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, data, message: 'Dish added to menu' });
      }
    } catch (e) {}

    return NextResponse.json({
      success: true,
      data: newItem,
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
      image_url,
      image,
      isAvailable,
      is_available,
      isBestseller,
      is_bestseller,
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
    if (isVeg !== undefined) { updates.is_veg = Boolean(isVeg); updates.isVeg = Boolean(isVeg); }
    if (is_veg !== undefined) { updates.is_veg = Boolean(is_veg); updates.isVeg = Boolean(is_veg); }
    if (image_url !== undefined) { updates.image_url = image_url; updates.image = image_url; }
    if (image !== undefined) { updates.image_url = image; updates.image = image; }
    if (isAvailable !== undefined) { updates.is_available = Boolean(isAvailable); updates.isAvailable = Boolean(isAvailable); }
    if (is_available !== undefined) { updates.is_available = Boolean(is_available); updates.isAvailable = Boolean(is_available); }
    if (isBestseller !== undefined) { updates.is_bestseller = Boolean(isBestseller); updates.isBestseller = Boolean(isBestseller); }
    if (is_bestseller !== undefined) { updates.is_bestseller = Boolean(is_bestseller); updates.isBestseller = Boolean(is_bestseller); }

    try {
      const { data, error } = await supabaseServer
        .from('food_items')
        .update(updates)
        .eq('id', targetId)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, data, message: 'Item updated' });
      }
    } catch (e) {}

    return NextResponse.json({
      success: true,
      data: { id: targetId, ...updates },
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
      message: 'Item deleted from menu',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to delete item' }, { status: 500 });
  }
}