import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { corsResponse, handleCorsOptions } from '@/lib/cors';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return handleCorsOptions();
}

const DEFAULT_PARTNERS: Record<string, { id: string; name: string; cuisines: string }> = {
  'canteen1@campusbite.local': { id: '550e8400-e29b-41d4-a716-446655440001', name: 'North Campus Central Canteen', cuisines: 'North Indian, Street Food, Chinese' },
  'canteen2@campusbite.local': { id: '550e8400-e29b-41d4-a716-446655440002', name: 'South Mess & Food Court', cuisines: 'Biryani, South Indian, Dosa' },
  'canteen3@campusbite.local': { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Night Canteen & Snacks Hub', cuisines: 'Snacks, Burgers, Fast Food' },
  'canteen4@campusbite.local': { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Campus Chai & Fast Food Corner', cuisines: 'Beverages, Tea, Snacks' },
  'samosa@cafe.com': { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Samosa Cafe', cuisines: 'Street Food, Fast Food' },
  'canteen@campusbite.local': { id: '550e8400-e29b-41d4-a716-446655440001', name: 'North Campus Central Canteen', cuisines: 'North Indian • Thalis • Butter Naan' },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, email, password } = body;

    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPhone = String(phoneNumber || '').replace(/\D/g, '').slice(-10);

    let restaurant: any = null;

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

    // Check default partner preset map
    if (!restaurant && cleanEmail && DEFAULT_PARTNERS[cleanEmail]) {
      const preset = DEFAULT_PARTNERS[cleanEmail];
      restaurant = {
        id: preset.id,
        name: preset.name,
        email: cleanEmail,
        phone_number: cleanPhone || '9876543210',
        address: 'Campus Food Court',
        operational_status: 'open',
      };
    }

    // Auto-provision if partner is registering on the fly
    if (!restaurant) {
      const newId = uuidv4();
      const generatedName = cleanEmail.includes('@')
        ? cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) + ' Canteen'
        : 'Campus Canteen Partner';

      const newRestaurant = {
        id: newId,
        name: generatedName,
        email: cleanEmail || `partner-${Date.now()}@campusbite.local`,
        phone_number: cleanPhone || '9876543210',
        address: 'Campus Food Court',
        operational_status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
        await supabaseServer.from('restaurants').upsert(newRestaurant, { onConflict: 'id' });
      } catch (dbErr) {
        console.warn('Auto-provisioning DB save warning for restaurant:', dbErr);
      }

      restaurant = newRestaurant;
    }

    return corsResponse({
      success: true,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        email: restaurant.email || cleanEmail,
        phone: restaurant.phone_number || cleanPhone || '9876543210',
        phoneNumber: restaurant.phone_number || cleanPhone || '9876543210',
        description: restaurant.address || 'Campus Canteen',
        operational_status: restaurant.operational_status || 'open',
      },
      restaurantId: restaurant.id,
    });
  } catch (error) {
    console.error('Restaurant login error:', error);
    return corsResponse({ success: false, message: 'Server error during restaurant login' }, { status: 500 });
  }
}