import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// In-memory persistent cache across requests in the instance
let cachedConfig = {
  deliveryFee: 10.0,
  platformFeeRules: [
    { id: 'rule-1', min_items: 1, max_items: 3, fee_amount: 2.0, feeAmount: 2.0, active: true },
    { id: 'rule-2', min_items: 4, max_items: 7, fee_amount: 4.0, feeAmount: 4.0, active: true },
  ],
};

export async function GET() {
  try {
    const { data: feeConfig } = await supabaseServer
      .from('delivery_fee_config')
      .select('*')
      .maybeSingle();

    if (feeConfig && feeConfig.fee_amount !== undefined) {
      cachedConfig.deliveryFee = Number(feeConfig.fee_amount);
    }

    const { data: platformRules } = await supabaseServer
      .from('platform_fee_rules')
      .select('*')
      .order('min_items');

    if (platformRules && platformRules.length > 0) {
      cachedConfig.platformFeeRules = platformRules.map((r: any) => ({
        ...r,
        feeAmount: r.fee_amount,
      }));
    }

    return NextResponse.json({
      success: true,
      data: cachedConfig,
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      data: cachedConfig,
    });
  }
}

export async function POST(request: NextRequest) {
  return handleUpdate(request);
}

export async function PATCH(request: NextRequest) {
  return handleUpdate(request);
}

async function handleUpdate(request: NextRequest) {
  try {
    const body = await request.json();
    const { deliveryFee, platformFeeRules } = body;

    if (deliveryFee !== undefined) {
      cachedConfig.deliveryFee = Number(deliveryFee);
      try {
        const { data: existing } = await supabaseServer
          .from('delivery_fee_config')
          .select('id')
          .maybeSingle();

        if (existing?.id) {
          await supabaseServer
            .from('delivery_fee_config')
            .update({ fee_amount: Number(deliveryFee), updated_at: new Date().toISOString() })
            .eq('id', existing.id);
        }
      } catch (e) {
        console.warn('Database delivery fee update skipped:', e);
      }
    }

    if (platformFeeRules && Array.isArray(platformFeeRules)) {
      cachedConfig.platformFeeRules = platformFeeRules;
    }

    return NextResponse.json({
      success: true,
      message: 'Fee configuration updated successfully',
      data: cachedConfig,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Failed to update fee config' }, { status: 500 });
  }
}
