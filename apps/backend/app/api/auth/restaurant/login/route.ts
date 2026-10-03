import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

const otpStore = new Map();
//FILE: apps/backend/app/api/auth/restaurant/login/route.ts
export async function POST_REST_LOGIN(request: NextRequest) {
  try {
    const { phoneNumber, email, password } = await request.json();

    const { data: restUser } = await supabaseServer
      .from('restaurant_users')
      .select('*, restaurants(*)')
      .eq('phone_number', phoneNumber)
      .eq('email', email)
      .single();

    if (!restUser) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    // For MVP, just verify phone and email (real password would be hashed)
    return NextResponse.json({
      success: true,
      restaurant: restUser.restaurants,
      restaurantId: restUser.restaurant_id,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error' }, { status: 500 });
  }
}