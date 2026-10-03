import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { operationalStatus } = await request.json();

    const { error } = await supabaseServer
      .from('restaurants')
      .update({ operational_status: operationalStatus })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true, message: 'Status updated' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
