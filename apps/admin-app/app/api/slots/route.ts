import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: slots, error } = await supabaseServer
      .from('delivery_slots')
      .select('*')
      .order('start_time');

    // Check blackout dates for today
    const today = new Date().toISOString().split('T')[0];
    const { data: blackout } = await supabaseServer
      .from('blackout_dates')
      .select('*')
      .eq('blackout_date', today)
      .maybeSingle();

    const isBlackout = !!blackout;

    // Calculate current time for server-side cutoff check
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeStr = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}:00`;

    const processedSlots = (slots || []).map((slot: any) => {
      // Slot cutoff check
      const isPastCutoff = currentTimeStr > slot.cutoff_time;
      const isAvailable = slot.active && !isBlackout && !isPastCutoff;

      return {
        ...slot,
        isPastCutoff,
        isAvailable,
        isBlackout,
        blackoutReason: blackout?.reason || null,
      };
    });

    return NextResponse.json({
      success: true,
      data: processedSlots,
      isBlackout,
      currentTime: currentTimeStr,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error fetching slots' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { slotId, active, cutoff_time, max_orders } = await request.json();

    const updateData: any = {};
    if (active !== undefined) updateData.active = active;
    if (cutoff_time !== undefined) updateData.cutoff_time = cutoff_time;
    if (max_orders !== undefined) updateData.max_orders = max_orders;

    const { error } = await supabaseServer
      .from('delivery_slots')
      .update(updateData)
      .eq('id', slotId);

    if (error) throw error;
    return NextResponse.json({ success: true, message: 'Slot updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update slot' }, { status: 500 });
  }
}
