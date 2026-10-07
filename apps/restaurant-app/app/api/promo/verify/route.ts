import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal = 0, studentEmail, studentPhone, studentId } = await request.json();

    if (!code || !code.trim()) {
      return NextResponse.json({ success: false, message: 'Promo code is required' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Check one-time usage for FIRSTBITE / UNIBITE20
    const ONE_TIME_CODES = ['FIRSTBITE', 'UNIBITE20', 'FIRSTORDER'];
    if (ONE_TIME_CODES.includes(cleanCode)) {
      if (studentEmail || studentPhone || studentId) {
        try {
          let query = supabaseServer.from('orders').select('id, promo_code', { count: 'exact' });
          if (studentEmail) query = query.eq('student_email', studentEmail.trim().toLowerCase());
          else if (studentPhone) query = query.eq('student_phone', studentPhone.trim());
          else if (studentId) query = query.eq('student_id', studentId.trim());

          const { count } = await query;
          if (count && count > 0) {
            return NextResponse.json({
              success: false,
              message: `Coupon '${cleanCode}' is valid for one-time use only on your first order.`,
            }, { status: 400 });
          }
        } catch (e) {
          console.warn('Promo orders check notice:', e);
        }
      }

      const discount = Math.min(50, Math.round(subtotal * 0.2));
      return NextResponse.json({
        success: true,
        data: {
          code: cleanCode,
          discount,
          message: `Applied successfully! Saved ₹${discount} (1st Order Special)`,
        },
      });
    }

    if (cleanCode === 'UNIBITE50' || cleanCode === 'CAMPUS50') {
      if (subtotal < 150) {
        return NextResponse.json({
          success: false,
          message: `Cart total must be at least ₹150 for '${cleanCode}'`,
        }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        data: {
          code: cleanCode,
          discount: 50,
          message: `Applied successfully! Saved ₹50`,
        },
      });
    }

    // Database lookup for custom admin promo codes
    try {
      const { data: promo, error } = await supabaseServer
        .from('promo_codes')
        .select('*')
        .ilike('code', cleanCode)
        .eq('active', true)
        .maybeSingle();

      if (!error && promo) {
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
      }
    } catch (e) {}

    return NextResponse.json({ success: false, message: 'Invalid or expired promo code' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Server error verifying promo' }, { status: 500 });
  }
}
