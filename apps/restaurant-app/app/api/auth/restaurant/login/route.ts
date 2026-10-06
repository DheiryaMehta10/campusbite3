import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { corsResponse, handleCorsOptions } from '@/lib/cors';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, email, password } = body;

    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPhone = String(phoneNumber || '').replace(/\D/g, '').slice(-10);

    let restaurant = null;

    try {
      if (cleanEmail) {
        const { data } = await supabaseServer
          .from('restaurants')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();
        if (data) restaurant = data;
      }

      if (!restaurant && cleanPhone) {
        const { data } = await supabaseServer
          .from('restaurants')
          .select('*')
          .eq('phone_number', cleanPhone)
          .maybeSingle();
        if (data) restaurant = data;
      }
    } catch (e) {
      console.warn('Supabase restaurant login query warning:', e);
    }

    if (restaurant) {
      return corsResponse({
        success: true,
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          email: restaurant.email,
          phone: restaurant.phone_number,
          phoneNumber: restaurant.phone_number,
          description: restaurant.address || 'Campus Canteen',
          operational_status: restaurant.operational_status || 'open',
        },
        restaurantId: restaurant.id,
      });
    }

    // Default partner fallback if legacy match
    if (cleanEmail === 'canteen@campusbite.local' || cleanPhone === '9876543210') {
      return corsResponse({
        success: true,
        restaurant: {
          id: 'canteen-1',
          name: 'North Campus Central Canteen',
          email: 'canteen@campusbite.local',
          phone: '9876543210',
          phoneNumber: '9876543210',
          description: 'North Indian • Thalis • Butter Naan • Beverages',
          operational_status: 'open',
        },
        restaurantId: 'canteen-1',
      });
    }

    return corsResponse({
      success: false,
      message: 'No registered restaurant partner found with these credentials. Please switch to "Register Outlet" to create your canteen account.',
    }, { status: 404 });
  } catch (error) {
    return corsResponse({ success: false, message: 'Server error during restaurant login' }, { status: 500 });
  }
}