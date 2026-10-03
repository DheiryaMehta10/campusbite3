import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: feeConfig } = await supabaseServer
      .from('delivery_fee_config')
      .select('*')
      .maybeSingle();

    const { data: platformRules } = await supabaseServer
      .from('platform_fee_rules')
      .select('*')
      .order('min_items');

    return NextResponse.json({
      success: true,
      data: {
        deliveryFee: feeConfig?.fee_amount ?? 10.00,
        platformFeeRules: platformRules || [
          { min_items: 1, max_items: 3, fee_amount: 2.00, active: true },
          { min_items: 4, max_items: 7, fee_amount: 4.00, active: true }
        ],
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error fetching fees' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { deliveryFee, platformFeeRules } = await request.json();

    if (deliveryFee !== undefined) {
      await supabaseServer
        .from('delivery_fee_config')
        .update({ fee_amount: deliveryFee, updated_at: new Date().toISOString() })
        .eq('id', (await supabaseServer.from('delivery_fee_config').select('id').single()).data?.id);
    }

    if (platformFeeRules && Array.isArray(platformFeeRules)) {
      for (const rule of platformFeeRules) {
        if (rule.id) {
          await supabaseServer
            .from('platform_fee_rules')
            .update({
              min_items: rule.min_items,
              max_items: rule.max_items,
              fee_amount: rule.fee_amount,
              active: rule.active,
            })
            .eq('id', rule.id);
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Fee configuration updated' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update fee config' }, { status: 500 });
  }
}
