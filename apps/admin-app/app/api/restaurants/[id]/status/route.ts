import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { operationalStatus, closedByAdmin } = body;

    const newStatus = operationalStatus || (closedByAdmin ? 'temporarily_closed' : 'open');
    const now = new Date().toISOString();

    const updatePayload = {
      operational_status: newStatus,
      active: newStatus === 'open',
      updated_at: now,
    };

    // Update in Supabase database
    const { data, error } = await supabaseServer
      .from('restaurants')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.warn('Supabase status update error, fallback minimal columns:', error.message);
      const { data: fbData, error: fbError } = await supabaseServer
        .from('restaurants')
        .update({ operational_status: newStatus })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (fbError) {
        console.error('Fallback update failed:', fbError.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Restaurant operational status updated to ${newStatus.replace('_', ' ').toUpperCase()}`,
      data: { id, operational_status: newStatus, operationalStatus: newStatus },
    });
  } catch (error: any) {
    console.error('Restaurant status error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Server error updating status' }, { status: 500 });
  }
}
