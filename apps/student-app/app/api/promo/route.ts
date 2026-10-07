import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export interface PromoCodeItem {
  id: string;
  code: string;
  discount_type: 'percent' | 'flat';
  discount_percent: number;
  discount_amount: number;
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
    min_order_amount: 120,
    max_discount: 30,
    is_one_time: false,
    active: true,
    description: 'Flat ₹30 OFF on orders above ₹120',
    created_at: new Date().toISOString(),
  }
];

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('promo_codes')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return NextResponse.json({
        success: true,
        data: data.map((p) => ({
          id: p.id || p.code,
          code: p.code,
          discount_type: p.discount_percent > 0 ? 'percent' : 'flat',
          discount_percent: Number(p.discount_percent || 0),
          discount_amount: Number(p.discount_amount || 0),
          min_order_amount: Number(p.min_order_amount || 0),
          max_discount: Number(p.max_discount || p.discount_amount || 50),
          is_one_time: Boolean(p.is_one_time),
          active: p.active ?? true,
          description: p.description || '',
          created_at: p.created_at || new Date().toISOString(),
        })),
      });
    }
  } catch (e) {}

  return NextResponse.json({
    success: true,
    data: inMemoryPromoCodes.filter((p) => p.active),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, discount_type, discount_value, min_order_amount = 0, is_one_time = false, description = '', active = true } = body;

    if (!code || !code.trim()) {
      return NextResponse.json({ success: false, message: 'Promo code string is required' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const discountPercent = discount_type === 'percent' ? Number(discount_value) || 0 : 0;
    const discountAmount = discount_type === 'flat' ? Number(discount_value) || 0 : 0;

    const newPromo: PromoCodeItem = {
      id: 'promo-' + Date.now(),
      code: cleanCode,
      discount_type: discount_type === 'percent' ? 'percent' : 'flat',
      discount_percent: discountPercent,
      discount_amount: discountAmount,
      min_order_amount: Number(min_order_amount) || 0,
      max_discount: discountPercent > 0 ? 50 : discountAmount,
      is_one_time: Boolean(is_one_time),
      active: active ?? true,
      description: description || `${cleanCode} offer`,
      created_at: new Date().toISOString(),
    };

    const existingIdx = inMemoryPromoCodes.findIndex((p) => p.code === cleanCode);
    if (existingIdx > -1) {
      inMemoryPromoCodes[existingIdx] = { ...inMemoryPromoCodes[existingIdx], ...newPromo };
    } else {
      inMemoryPromoCodes.unshift(newPromo);
    }

    try {
      await supabaseServer.from('promo_codes').upsert({
        code: cleanCode,
        discount_percent: discountPercent,
        discount_amount: discountAmount,
        min_order_amount: Number(min_order_amount) || 0,
        is_one_time: Boolean(is_one_time),
        active: active ?? true,
        description: description,
      }, { onConflict: 'code' });
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: `Coupon ${cleanCode} saved successfully`,
      data: newPromo,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Server error creating promo' }, { status: 500 });
  }
}
