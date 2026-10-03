import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: uncollectedId } = await params;
    const { contacted, collected, notes } = await request.json();

    const updateData: any = {};
    const now = new Date().toISOString();

    if (contacted !== undefined) {
      updateData.contacted = contacted;
      if (contacted) updateData.contacted_at = now;
    }
    if (collected !== undefined) {
      updateData.collected = collected;
      if (collected) updateData.collected_at = now;
    }
    if (notes !== undefined) updateData.notes = notes;

    const { data, error } = await supabaseServer
      .from('uncollected_orders')
      .update(updateData)
      .eq('id', uncollectedId)
      .select('*, order:orders(*), student:students(*)')
      .single();

    if (error) throw error;

    // If marked collected, also update the main order status to 'delivered'
    if (collected && data?.order_id) {
      await supabaseServer
        .from('orders')
        .update({ order_status: 'delivered', delivered_at: now })
        .eq('id', data.order_id);
    }

    return NextResponse.json({ success: true, message: 'Uncollected order updated', data });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update uncollected order' }, { status: 500 });
  }
}
