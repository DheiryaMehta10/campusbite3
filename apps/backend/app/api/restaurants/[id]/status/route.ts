import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

const otpStore = new Map();
// FILE: apps/backend/app/api/restaurants/[id]/status/route.ts
export async function PATCH_STATUS(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { operationalStatus } = await request.json();

    const { error } = await supabaseServer
      .from('restaurants')
      .update({ operational_status: operationalStatus })
      .eq('id', params.id);

    if (error) throw error;
    return NextResponse.json({ success: true, message: 'Status updated' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error' }, { status: 500 });
  }
}
