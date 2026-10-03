import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

const otpStore = new Map();
// FILE: apps/backend/app/api/restaurants/[id]/menu/route.ts

export async function GET_MENU(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabaseServer
      .from('food_items')
      .select('*')
      .eq('restaurant_id', params.id)
      .eq('active', true);

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error' }, { status: 500 });
  }
}