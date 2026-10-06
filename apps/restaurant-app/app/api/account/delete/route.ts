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
    const { email, phone, outletName, reason } = body;

    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);

    if (cleanEmail) {
      try {
        await supabaseServer
          .from('restaurants')
          .update({
            active: false,
            operational_status: 'permanently_closed',
          })
          .or(`email.eq.${cleanEmail},phone_number.eq.${cleanPhone}`);
      } catch (e) {
        console.warn('Supabase restaurant deactivation warning:', e);
      }
    }

    return corsResponse({
      success: true,
      message: 'Account deletion request received and restaurant marked for permanent deletion.',
    });
  } catch (error: any) {
    return corsResponse({ success: false, message: 'Server error' }, { status: 500 });
  }
}
