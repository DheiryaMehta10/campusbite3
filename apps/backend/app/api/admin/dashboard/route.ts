import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

const otpStore = new Map();
// FILE: apps/backend/app/api/admin/dashboard/route.ts
export async function GET_ADMIN_DASHBOARD(request: NextRequest) {
  try {
    const { count: totalOrders } = await supabaseServer
      .from('orders')
      .select('*', { count: 'exact' });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count: todayOrders } = await supabaseServer
      .from('orders')
      .select('*', { count: 'exact' })
      .gte('placed_at', todayStart.toISOString());

    const { data: restaurants } = await supabaseServer
      .from('restaurants')
      .select('*')
      .eq('operational_status', 'open');

    const { count: uncollectedCount } = await supabaseServer
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('payment_status', 'pending');

    return NextResponse.json({
      success: true,
      data: {
        totalOrders: totalOrders || 0,
        todayOrders: todayOrders || 0,
        activeRestaurants: restaurants?.length || 0,
        uncollectedOrdersCount: uncollectedCount || 0,
        ordersBySlot: [
          { slot: 'Lunch (12-1 PM)', count: 0 },
          { slot: 'Evening (6-7 PM)', count: 0 },
          { slot: 'Evening (7-8 PM)', count: 0 },
        ],
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error' }, { status: 500 });
  }
}