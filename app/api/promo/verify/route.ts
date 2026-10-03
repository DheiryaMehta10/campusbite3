import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json();

    if (!code) {
      return NextResponse.json({ success: false, message: 'Promo code is required' }, { status: 400 });
    }

    const { data: promo, error } = await supabaseServer
      .from('promo_codes')
      .select('*')
      .ilike('code', code.trim())
      .eq('active', true)
      .maybeSingle();

    if (error || !promo) {
      return NextResponse.json({ success: false, message: 'Invalid or expired promo code' }, { status: 400 });
    }

    if (subtotal < (promo.min_order_amount || 0)) {
      return NextResponse.json({
        success: false,
        message: `Minimum order amount of ₹${promo.min_order_amount} required`,
      }, { status: 400 });
    }

    let discount = 0;
    if (promo.discount_amount > 0) {
      discount = promo.discount_amount;
    } else if (promo.discount_percent > 0) {
      discount = (subtotal * promo.discount_percent) / 100;
    }

    discount = Math.min(discount, subtotal);

    return NextResponse.json({
      success: true,
      data: {
        code: promo.code,
        discount: Number(discount.toFixed(2)),
        message: `Applied successfully! Saved ₹${discount.toFixed(2)}`,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
