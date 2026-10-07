import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

let liveBanner = {
  id: 'banner-live-1',
  badgeText: '⚡ LIVE SLOT WAVE',
  title: 'Evening Canteen Slots Open!',
  subtitle: 'Fresh meals delivered directly to your hostel lobby.',
  promoTag: 'FIRSTBITE (20% OFF 1st Order)',
  emoji: '🍱',
  gradient: 'orange',
  isActive: true,
  updatedAt: new Date().toISOString(),
};

export async function GET() {
  try {
    const { data: dbBanners } = await supabaseServer
      .from('banners')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (dbBanners && dbBanners.length > 0) {
      const b = dbBanners[0];
      return NextResponse.json({
        success: true,
        data: {
          id: b.id,
          badgeText: b.badge_text || liveBanner.badgeText,
          title: b.title || liveBanner.title,
          subtitle: b.description || b.subtitle || liveBanner.subtitle,
          promoTag: b.promo_tag || liveBanner.promoTag,
          emoji: b.emoji || liveBanner.emoji,
          gradient: b.gradient || liveBanner.gradient,
          isActive: b.active ?? true,
          imageUrl: b.image_url,
          updatedAt: b.updated_at,
        },
      });
    }
  } catch (e) {}

  return NextResponse.json({
    success: true,
    data: liveBanner,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { badgeText, title, subtitle, promoTag, emoji, gradient, isActive, imageUrl } = body;

    liveBanner = {
      ...liveBanner,
      badgeText: badgeText || liveBanner.badgeText,
      title: title || liveBanner.title,
      subtitle: subtitle || liveBanner.subtitle,
      promoTag: promoTag !== undefined ? promoTag : liveBanner.promoTag,
      emoji: emoji || liveBanner.emoji,
      gradient: gradient || liveBanner.gradient,
      isActive: isActive !== undefined ? isActive : liveBanner.isActive,
      updatedAt: new Date().toISOString(),
    };

    try {
      const dbPayload = {
        title: liveBanner.title,
        description: liveBanner.subtitle,
        image_url: imageUrl || '',
        active: liveBanner.isActive,
        updated_at: liveBanner.updatedAt,
      };
      await supabaseServer.from('banners').upsert(dbPayload);
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: 'Explore banner updated successfully',
      data: liveBanner,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Failed to update banner' }, { status: 500 });
  }
}
