import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export interface DeliverySlotItem {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  cutoff_time: string;
  active: boolean;
  is_active: boolean;
  status: 'active' | 'disabled' | 'cutoff_passed';
  max_orders?: number;
}

let inMemorySlots: DeliverySlotItem[] = [
  {
    id: 'slot-lunch',
    name: 'Lunch Slot (12:00 PM – 1:00 PM)',
    start_time: '12:00',
    end_time: '13:00',
    cutoff_time: '11:50',
    active: false,
    is_active: false,
    status: 'disabled',
    max_orders: 50,
  },
  {
    id: 'slot-eve-1',
    name: 'Evening Slot 1 (6:00 PM – 7:00 PM)',
    start_time: '18:00',
    end_time: '19:00',
    cutoff_time: '17:50',
    active: true,
    is_active: true,
    status: 'active',
    max_orders: 50,
  },
  {
    id: 'slot-eve-2',
    name: 'Evening Slot 2 (7:00 PM – 8:00 PM)',
    start_time: '19:00',
    end_time: '20:00',
    cutoff_time: '18:50',
    active: true,
    is_active: true,
    status: 'active',
    max_orders: 50,
  },
  {
    id: 'slot-eve-3',
    name: 'Evening Slot 3 (8:00 PM – 9:00 PM)',
    start_time: '20:00',
    end_time: '21:00',
    cutoff_time: '19:50',
    active: true,
    is_active: true,
    status: 'active',
    max_orders: 50,
  },
  {
    id: 'slot-night',
    name: 'Night Canteen Slot (9:30 PM – 10:30 PM)',
    start_time: '21:30',
    end_time: '22:30',
    cutoff_time: '21:20',
    active: true,
    is_active: true,
    status: 'active',
    max_orders: 50,
  },
  {
    id: 'slot-late-night',
    name: 'Late Night Snack Slot (11:30 PM – 12:30 AM)',
    start_time: '23:30',
    end_time: '00:30',
    cutoff_time: '23:20',
    active: true,
    is_active: true,
    status: 'active',
    max_orders: 50,
  },
];

export async function GET() {
  try {
    const { data: dbSlots } = await supabaseServer
      .from('delivery_slots')
      .select('*')
      .order('start_time');

    if (dbSlots && dbSlots.length > 0) {
      const merged = inMemorySlots.map((defSlot) => {
        const found = dbSlots.find((d: any) => d.id === defSlot.id || d.name === defSlot.name);
        if (found) {
          const isActive = found.active ?? found.is_active ?? defSlot.active;
          return {
            ...defSlot,
            active: isActive,
            is_active: isActive,
            status: (isActive ? 'active' : 'disabled') as any,
            cutoff_time: found.cutoff_time || defSlot.cutoff_time,
            max_orders: found.max_orders || defSlot.max_orders,
          };
        }
        return defSlot;
      });

      return NextResponse.json({
        success: true,
        data: merged,
      });
    }
  } catch (e) {}

  return NextResponse.json({
    success: true,
    data: inMemorySlots,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slotId, id, active, is_active, cutoff_time, max_orders, slots } = body;

    if (Array.isArray(slots)) {
      inMemorySlots = slots.map((s) => ({
        ...s,
        active: s.active ?? s.is_active ?? true,
        is_active: s.active ?? s.is_active ?? true,
        status: (s.active ?? s.is_active ?? true) ? 'active' : 'disabled',
      }));

      // Try bulk update in Supabase
      try {
        for (const s of inMemorySlots) {
          await supabaseServer
            .from('delivery_slots')
            .upsert({
              id: s.id,
              name: s.name,
              start_time: s.start_time,
              end_time: s.end_time,
              cutoff_time: s.cutoff_time,
              active: s.active,
              max_orders: s.max_orders || 50,
            });
        }
      } catch (e) {}

      return NextResponse.json({
        success: true,
        message: 'All slots updated successfully',
        data: inMemorySlots,
      });
    }

    const targetId = slotId || id;
    if (!targetId) {
      return NextResponse.json({ success: false, message: 'Slot ID is required' }, { status: 400 });
    }

    const targetActive = active !== undefined ? active : (is_active !== undefined ? is_active : true);

    inMemorySlots = inMemorySlots.map((s) => {
      if (s.id === targetId) {
        return {
          ...s,
          active: targetActive,
          is_active: targetActive,
          status: targetActive ? 'active' : 'disabled',
          cutoff_time: cutoff_time || s.cutoff_time,
          max_orders: max_orders || s.max_orders,
        };
      }
      return s;
    });

    try {
      await supabaseServer
        .from('delivery_slots')
        .update({
          active: targetActive,
          ...(cutoff_time ? { cutoff_time } : {}),
          ...(max_orders ? { max_orders } : {}),
        })
        .eq('id', targetId);
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: `Slot ${targetId} updated successfully`,
      data: inMemorySlots,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Server error updating slot' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  return POST(request);
}
