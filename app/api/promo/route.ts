import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export interface PromoCodeItem {
  id: string;
  code: string;
  discount_type: 'percent' | 'flat';
  discount_percent: number;
  discount_amount: number;
  discount_value: number;
  min_order_amount: number;
  max_discount?: number;
  is_one_time: boolean;
  active: boolean;
  description?: string;
  created_at?: string;
}

let inMemoryPromoCodes: PromoCodeItem[] = [
  {
    id: 'promo-1',
    code: 'FIRSTBITE',
    discount_type: 'percent',
    discount_percent: 20,
    discount_amount: 0,
    discount_value: 20,
    min_order_amount: 0,
    max_discount: 50,
    is_one_time: true,
    active: true,
    description: '20% OFF on your very first order (Max ₹50)',
    created_at: new Date().toISOString(),
  },
  {
    id: 'promo-2',
    code: 'HUNGRYSTUDENT',
    discount_type: 'flat',
    discount_percent: 0,
    discount_amount: 30,
    discount_value: 30,
    min_order_amount: 120,
    max_discount: 30,
    is_one_time: true,
    active: true,
    description: 'Flat ₹30 OFF on orders above ₹120 (1-Time Use)',
    created_at: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('promo_codes')
      .select('*')
      .eq('active', true)
      .order('code', { ascending: true });

    if (!error && data && data.length > 0) {
      const formatted: PromoCodeItem[] = data.map((p) => {
        const isPercent = String(p.discount_type || '').toUpperCase() === 'PERCENTAGE' || String(p.discount_type || '').toLowerCase() === 'percent';
        const val = Number(p.discount_value || 0);
        return {
          id: p.id || p.code,
          code: String(p.code).toUpperCase(),
          discount_type: isPercent ? 'percent' : 'flat',
          discount_percent: isPercent ? val : 0,
          discount_amount: !isPercent ? val : 0,
          discount_value: val,
          min_order_amount: Number(p.min_order_value || 0),
          max_discount: isPercent ? 50 : val,
          is_one_time: true,
          active: true,
          description: isPercent ? `${val}% OFF (Max ₹50) • 1-Time Use` : `Flat ₹${val} OFF • 1-Time Use`,
          created_at: p.valid_from || new Date().toISOString(),
        };
      });

      inMemoryPromoCodes = formatted;
      return NextResponse.json({
        success: true,
        data: formatted,
      });
    }
  } catch (e) {
    console.error('Root promo GET error:', e);
  }

  return NextResponse.json({
    success: true,
    data: inMemoryPromoCodes.filter((p) => p.active),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code,
      discount_type = 'percent',
      discount_value = 0,
      min_order_amount = 0,
      description = '',
      active = true,
    } = body;

    if (!code || !code.trim()) {
      return NextResponse.json({ success: false, message: 'Promo code is required' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const isPercent = discount_type === 'percent' || discount_type === 'PERCENTAGE';
    const numValue = Number(discount_value) || 0;
    const minOrderVal = Number(min_order_amount) || 0;

    const newPromo: PromoCodeItem = {
      id: 'promo-' + Date.now(),
      code: cleanCode,
      discount_type: isPercent ? 'percent' : 'flat',
      discount_percent: isPercent ? numValue : 0,
      discount_amount: !isPercent ? numValue : 0,
      discount_value: numValue,
      min_order_amount: minOrderVal,
      max_discount: isPercent ? 50 : numValue,
      is_one_time: true,
      active: active ?? true,
      description: description || (isPercent ? `${numValue}% OFF • 1-Time Student Coupon` : `Flat ₹${numValue} OFF • 1-Time Student Coupon`),
      created_at: new Date().toISOString(),
    };

    const existingIdx = inMemoryPromoCodes.findIndex((p) => p.code === cleanCode);
    if (existingIdx > -1) {
      inMemoryPromoCodes[existingIdx] = { ...inMemoryPromoCodes[existingIdx], ...newPromo };
    } else {
      inMemoryPromoCodes.unshift(newPromo);
    }

    try {
      await supabaseServer.from('promo_codes').upsert(
        {
          code: cleanCode,
          discount_type: isPercent ? 'PERCENTAGE' : 'FIXED',
          discount_value: numValue,
          min_order_value: minOrderVal,
          max_uses: 1000,
          active: active ?? true,
        },
        { onConflict: 'code' }
      );
    } catch (dbEx) {
      console.error('Supabase root promo upsert error:', dbEx);
    }

    return NextResponse.json({
      success: true,
      message: `Coupon ${cleanCode} saved successfully`,
      data: newPromo,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Server error creating promo' }, { status: 500 });
  }
}
