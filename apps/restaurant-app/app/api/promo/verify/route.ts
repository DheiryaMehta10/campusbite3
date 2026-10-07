import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal = 0, studentEmail, studentPhone, studentId } = await request.json();

    if (!code || !code.trim()) {
      return NextResponse.json({ success: false, message: 'Coupon code is required' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanEmail = studentEmail ? String(studentEmail).trim().toLowerCase() : '';
    const cleanPhone = studentPhone ? String(studentPhone).replace(/\D/g, '').slice(-10) : '';

    let promoData: any = null;
    try {
      const { data, error } = await supabaseServer
        .from('promo_codes')
        .select('*')
        .ilike('code', cleanCode)
        .eq('active', true)
        .maybeSingle();

      if (!error && data) {
        promoData = data;
      }
    } catch (e) {
      console.error('Supabase promo verify fetch error:', e);
    }

    if (!promoData) {
      if (cleanCode === 'FIRSTBITE') {
        promoData = {
          code: 'FIRSTBITE',
          discount_type: 'PERCENTAGE',
          discount_value: 20,
          min_order_value: 0,
          active: true,
        };
      } else if (cleanCode === 'HUNGRYSTUDENT') {
        promoData = {
          code: 'HUNGRYSTUDENT',
          discount_type: 'FIXED',
          discount_value: 30,
          min_order_value: 120,
          active: true,
        };
      }
    }

    if (!promoData) {
      return NextResponse.json(
        { success: false, message: `Coupon '${cleanCode}' is invalid, inactive, or expired` },
        { status: 400 }
      );
    }

    const minOrder = Number(promoData.min_order_value || 0);
    if (subtotal < minOrder) {
      return NextResponse.json(
        {
          success: false,
          message: `Minimum cart value of ₹${minOrder} required for coupon '${cleanCode}'`,
        },
        { status: 400 }
      );
    }

    if (cleanEmail || cleanPhone || studentId) {
      try {
        let dbStudentId: string | null = null;

        if (cleanEmail) {
          const { data: st } = await supabaseServer.from('students').select('id').eq('email', cleanEmail).maybeSingle();
          if (st?.id) dbStudentId = st.id;
        }
        if (!dbStudentId && cleanPhone) {
          const { data: st } = await supabaseServer.from('students').select('id').eq('phone_number', cleanPhone).maybeSingle();
          if (st?.id) dbStudentId = st.id;
        }
        if (!dbStudentId && studentId && String(studentId).length >= 10) {
          dbStudentId = studentId;
        }

        if (dbStudentId) {
          const { data: usedOrders } = await supabaseServer
            .from('orders')
            .select('id, special_instructions')
            .eq('student_id', dbStudentId)
            .ilike('special_instructions', `%${cleanCode}%`)
            .neq('order_status', 'cancelled')
            .limit(1);

          if (usedOrders && usedOrders.length > 0) {
            return NextResponse.json(
              {
                success: false,
                message: `You have already redeemed coupon '${cleanCode}'. All coupons are strictly valid for 1-time use per student.`,
              },
              { status: 400 }
            );
          }
        }
      } catch (checkErr) {
        console.warn('Student coupon reuse check warning:', checkErr);
      }
    }

    const isPercent = String(promoData.discount_type || '').toUpperCase() === 'PERCENTAGE';
    const val = Number(promoData.discount_value || 0);

    let discount = 0;
    if (isPercent) {
      discount = Math.min(50, Math.round((subtotal * val) / 100));
    } else {
      discount = Math.round(val);
    }

    discount = Math.min(discount, subtotal);

    return NextResponse.json({
      success: true,
      data: {
        code: cleanCode,
        discount,
        message: isPercent
          ? `Coupon '${cleanCode}' applied! Saved ₹${discount} (${val}% OFF)`
          : `Coupon '${cleanCode}' applied! Saved ₹${discount} (Flat Discount)`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Server error verifying coupon' }, { status: 500 });
  }
}
