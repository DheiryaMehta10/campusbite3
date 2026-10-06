import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { corsResponse, handleCorsOptions } from '@/lib/cors';

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

    return corsResponse({
      success: true,
      data: data || [],
    });
  } catch (error) {
    return corsResponse({ success: false, message: 'Server error' }, { status: 500 });
  }
}