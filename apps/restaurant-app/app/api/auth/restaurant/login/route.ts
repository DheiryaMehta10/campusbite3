import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, email } = await request.json();

    const { data: restUser } = await supabaseServer
      .from('restaurant_users')
      .select('*, restaurants(*)')
      .eq('phone_number', phoneNumber)
      .eq('email', email)
      .single();

    if (!restUser) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      restaurant: restUser.restaurants,
      restaurantId: restUser.restaurant_id,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}