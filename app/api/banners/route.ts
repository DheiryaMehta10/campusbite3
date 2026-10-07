import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const FIXED_BANNER_ID = '00000000-0000-0000-0000-000000000001';

export interface BannerConfig {
  id?: string;
  badgeText: string;
  title: string;
  subtitle: string;
  promoTag: string;
  emoji: string;
  gradient: string;
  isActive: boolean;
  imageUrl?: string;
  updatedAt?: string;
}

let inMemoryBanner: BannerConfig = {
  id: FIXED_BANNER_ID,
  badgeText: '⚡ LIVE SLOT WAVE',
  title: 'Evening Canteen Slots Open!',
  subtitle: 'Fresh meals delivered directly to your hostel lobby.',
  promoTag: 'FIRSTBITE (20% OFF 1st Order)',
  emoji: '🍱',
  gradient: 'orange',
  isActive: true,
  updatedAt: new Date().toISOString(),
};

function parseBannerRecord(b: any): BannerConfig {
  let meta: any = {};
  if (b.action_url) {
    try {
      meta = typeof b.action_url === 'string' ? JSON.parse(b.action_url) : b.action_url;
    } catch {}
  }

  return {
    id: b.id || FIXED_BANNER_ID,
    badgeText: meta.badgeText || b.badge_text || inMemoryBanner.badgeText,
    title: b.title || inMemoryBanner.title,
    subtitle: b.description || meta.subtitle || inMemoryBanner.subtitle,
    promoTag: meta.promoTag || b.promo_tag || inMemoryBanner.promoTag,
    emoji: meta.emoji || b.emoji || inMemoryBanner.emoji,
    gradient: meta.gradient || b.gradient || inMemoryBanner.gradient,
    isActive: b.active !== undefined ? Boolean(b.active) : inMemoryBanner.isActive,
    imageUrl: b.image_url || '',
    updatedAt: b.created_at || new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const { data: dbBanners, error } = await supabaseServer
      .from('banners')
      .select('*')
      .order('display_order', { ascending: true })
      .limit(1);

    if (!error && dbBanners && dbBanners.length > 0) {
      const banner = parseBannerRecord(dbBanners[0]);
      inMemoryBanner = banner;
      return NextResponse.json({
        success: true,
        data: banner,
      });
    }
  } catch (e) {
    console.error('Root banner GET error:', e);
  }

  return NextResponse.json({
    success: true,
    data: inMemoryBanner,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      badgeText,
      title,
      subtitle,
      promoTag,
      emoji,
      gradient,
      isActive,
      imageUrl,
    } = body;

    inMemoryBanner = {
      ...inMemoryBanner,
      badgeText: badgeText !== undefined ? badgeText : inMemoryBanner.badgeText,
      title: title !== undefined ? title : inMemoryBanner.title,
      subtitle: subtitle !== undefined ? subtitle : inMemoryBanner.subtitle,
      promoTag: promoTag !== undefined ? promoTag : inMemoryBanner.promoTag,
      emoji: emoji !== undefined ? emoji : inMemoryBanner.emoji,
      gradient: gradient !== undefined ? gradient : inMemoryBanner.gradient,
      isActive: isActive !== undefined ? Boolean(isActive) : inMemoryBanner.isActive,
      imageUrl: imageUrl !== undefined ? imageUrl : inMemoryBanner.imageUrl,
      updatedAt: new Date().toISOString(),
    };

    const meta = JSON.stringify({
      badgeText: inMemoryBanner.badgeText,
      promoTag: inMemoryBanner.promoTag,
      emoji: inMemoryBanner.emoji,
      gradient: inMemoryBanner.gradient,
    });

    try {
      const dbPayload = {
        id: FIXED_BANNER_ID,
        title: inMemoryBanner.title,
        description: inMemoryBanner.subtitle,
        image_url: inMemoryBanner.imageUrl || null,
        action_url: meta,
        active: inMemoryBanner.isActive,
        display_order: 1,
      };

      const { data: upsertData, error: dbErr } = await supabaseServer
        .from('banners')
        .upsert(dbPayload, { onConflict: 'id' })
        .select();

      if (dbErr) {
        console.error('Supabase root banner save error:', dbErr);
      } else if (upsertData && upsertData[0]) {
        inMemoryBanner = parseBannerRecord(upsertData[0]);
      }
    } catch (dbEx) {
      console.error('Supabase root banner save exception:', dbEx);
    }

    return NextResponse.json({
      success: true,
      message: 'Explore banner updated live in backend database and Student App',
      data: inMemoryBanner,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Failed to update banner' }, { status: 500 });
  }
}
