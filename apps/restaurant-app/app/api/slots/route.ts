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

const DEFAULT_SLOTS: DeliverySlotItem[] = [
  {
    id: '4a7cabf4-a40e-4fa8-92f2-d12586ca69f1',
    name: 'Lunch Slot (12:00 PM – 1:00 PM)',
    start_time: '12:00',
    end_time: '13:00',
    cutoff_time: '11:50',
    active: true,
    is_active: true,
    status: 'active',
    max_orders: 50,
  },
  {
    id: '4a511603-db68-4dee-b602-0478566adedd',
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
    id: 'e5df2f44-35eb-4f99-838e-98570c6536c8',
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
    id: '550e8400-e29b-41d4-a716-446655440103',
    name: 'Evening Slot 3 (8:00 PM – 9:00 PM)',
    start_time: '20:00',
    end_time: '21:00',
    cutoff_time: '19:50',
    active: true,
    is_active: true,
    status: 'active',
    max_orders: 50,
  },
];

let inMemorySlots: DeliverySlotItem[] = [...DEFAULT_SLOTS];

export async function GET() {
  try {
    const { data: dbSlots, error } = await supabaseServer
      .from('delivery_slots')
      .select('*')
      .order('start_time', { ascending: true });

    if (!error && dbSlots && dbSlots.length > 0) {
      const mapped = dbSlots.map((d: any) => {
        const isActive = Boolean(d.active ?? d.is_active);
        return {
          id: d.id,
          name: d.name,
          start_time: (d.start_time || '').slice(0, 5) || '18:00',
          end_time: (d.end_time || '').slice(0, 5) || '19:00',
          cutoff_time: (d.cutoff_time || '').slice(0, 5) || '17:50',
          active: isActive,
          is_active: isActive,
          status: (isActive ? 'active' : 'disabled') as any,
          max_orders: d.max_orders || 50,
        };
      });

      inMemorySlots = mapped;

      return NextResponse.json({
        success: true,
        data: mapped,
      });
    }
  } catch (e) {
    console.warn('DB Slots fetch warning:', e);
  }

  return NextResponse.json({
    success: true,
    data: inMemorySlots,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slotId, id, active, is_active, cutoff_time, max_orders } = body;

    const targetId = slotId || id;
    if (!targetId) {
      return NextResponse.json({ success: false, message: 'Slot ID is required' }, { status: 400 });
    }

    const targetActive = active !== undefined ? Boolean(active) : (is_active !== undefined ? Boolean(is_active) : true);

    inMemorySlots = inMemorySlots.map((s) => {
      if (s.id === targetId || s.name.includes(targetId)) {
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
      const updatePayload: any = {
        active: targetActive,
      };
      if (cutoff_time) {
        updatePayload.cutoff_time = cutoff_time.length === 5 ? `${cutoff_time}:00` : cutoff_time;
      }
      if (max_orders) {
        updatePayload.max_orders = max_orders;
      }

      await supabaseServer
        .from('delivery_slots')
        .update(updatePayload)
        .eq('id', targetId);
    } catch (e) {
      console.warn('DB Slot update warning:', e);
    }

    return NextResponse.json({
      success: true,
      message: `Slot updated successfully`,
      data: inMemorySlots,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Server error updating slot' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  return POST(request);
}
