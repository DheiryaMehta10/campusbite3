import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { operationalStatus, closedBy = 'RESTAURANT', closureReason } = await request.json();

    // Fetch current restaurant status
    const { data: currentRest, error: fetchErr } = await supabaseServer
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !currentRest) {
      return NextResponse.json({ success: false, message: 'Restaurant not found' }, { status: 404 });
    }

    // BUSINESS RULE: Restaurant cannot reopen an Admin-forced closure!
    if (
      currentRest.operational_status === 'temporarily_closed' &&
      currentRest.closed_by === 'ADMIN' &&
      operationalStatus === 'open' &&
      closedBy === 'RESTAURANT'
    ) {
      return NextResponse.json({
        success: false,
        message: 'This restaurant was closed by UniBite Admin. Only an Admin can reopen it.',
      }, { status: 403 });
    }

    const now = new Date().toISOString();
    const updateData: any = {
      operational_status: operationalStatus,
      closed_by: operationalStatus === 'temporarily_closed' ? closedBy : null,
      closure_reason: closureReason || null,
      closed_at: operationalStatus === 'temporarily_closed' ? now : null,
      reopened_at: operationalStatus === 'open' ? now : null,
    };

    const { error } = await supabaseServer
      .from('restaurants')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `Restaurant is now ${operationalStatus.replace('_', ' ').toUpperCase()}`,
      data: updateData,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error updating status' }, { status: 500 });
  }
}
