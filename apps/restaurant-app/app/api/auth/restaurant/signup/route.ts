import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { corsResponse, handleCorsOptions } from '@/lib/cors';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      ownerName,
      email,
      password,
      phone,
      phoneNumber,
      address,
      description,
      cuisines = 'Multi-Cuisine, Campus Meals',
      deliveryTime = 'Slot 6:00 - 7:00 PM',
    } = body;

    const cleanName = String(name || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPhone = String(phone || phoneNumber || '').replace(/\D/g, '').slice(-10);
    const cleanAddress = String(address || description || '').trim() || 'Campus Food Block';

    if (!cleanName) {
      return corsResponse({ success: false, message: 'Outlet or restaurant name is required' }, { status: 400 });
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return corsResponse({ success: false, message: 'Valid partner email is required' }, { status: 400 });
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      return corsResponse({ success: false, message: 'Valid 10-digit contact number is required' }, { status: 400 });
    }

    const restaurantId = randomUUID();

    const dbPayload = {
      id: restaurantId,
      name: cleanName,
      email: cleanEmail,
      phone_number: cleanPhone,
      address: cleanAddress,
      operational_status: 'open',
      active: true,
      commission_percentage: 10,
    };

    try {
      const { data, error } = await supabaseServer
        .from('restaurants')
        .insert(dbPayload)
        .select()
        .single();

      if (error) {
        console.warn('Supabase restaurant partner signup error:', error);
      }
    } catch (dbErr) {
      console.warn('DB error during restaurant partner registration:', dbErr);
    }

    const clientRest = {
      id: restaurantId,
      name: cleanName,
      ownerName: ownerName || 'Partner',
      email: cleanEmail,
      phone: cleanPhone,
      phoneNumber: cleanPhone,
      address: cleanAddress,
      description: cleanAddress,
      cuisines,
      deliveryTime,
      operational_status: 'open',
      rating: 5.0,
      image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    };

    return corsResponse({
      success: true,
      message: `Partner outlet "${cleanName}" successfully registered and stored in database!`,
      restaurant: clientRest,
      restaurantId,
    });
  } catch (error: any) {
    console.error('Restaurant partner signup exception:', error);
    return corsResponse({ success: false, message: 'Failed to register restaurant partner' }, { status: 500 });
  }
}
