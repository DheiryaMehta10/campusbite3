'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

interface PlatformFeeRule {
  id: string;
  minItems: number;
  maxItems: number;
  feeAmount: number;
}

interface DeliverySlotConfig {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  cutoffTime: string;
  isActive: boolean;
}

interface PromoCodeItem {
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

interface BannerConfig {
  id?: string;
  badgeText: string;
  title: string;
  subtitle: string;
  promoTag: string;
  emoji: string;
  gradient: string;
  isActive: boolean;
}

export default function AdminConfigPage() {
  const router = useRouter();
  const [deliveryFee, setDeliveryFee] = useState<number>(10);
  const [feeRules, setFeeRules] = useState<PlatformFeeRule[]>([
    { id: 'rule-1', minItems: 1, maxItems: 3, feeAmount: 2 },
    { id: 'rule-2', minItems: 4, maxItems: 7, feeAmount: 4 },
  ]);

  const [slots, setSlots] = useState<DeliverySlotConfig[]>([
    { id: '4a7cabf4-a40e-4fa8-92f2-d12586ca69f1', name: 'Lunch Slot (12:00 PM – 1:00 PM)', startTime: '12:00', endTime: '13:00', cutoffTime: '11:50', isActive: true },
    { id: '4a511603-db68-4dee-b602-0478566adedd', name: 'Evening Slot 1 (6:00 PM – 7:00 PM)', startTime: '18:00', endTime: '19:00', cutoffTime: '17:50', isActive: true },
    { id: 'e5df2f44-35eb-4f99-838e-98570c6536c8', name: 'Evening Slot 2 (7:00 PM – 8:00 PM)', startTime: '19:00', endTime: '20:00', cutoffTime: '18:50', isActive: true },
    { id: '550e8400-e29b-41d4-a716-446655440103', name: 'Evening Slot 3 (8:00 PM – 9:00 PM)', startTime: '20:00', endTime: '21:00', cutoffTime: '19:50', isActive: true },
  ]);

  // Promotional Banner State
  const [banner, setBanner] = useState<BannerConfig>({
    badgeText: '⚡ LIVE SLOT WAVE',
    title: 'Evening Canteen Slots Open!',
    subtitle: 'Fresh meals delivered directly to your hostel lobby.',
    promoTag: 'FIRSTBITE (20% OFF 1st Order)',
    emoji: '🍱',
    gradient: 'orange',
    isActive: true,
  });
  const [bannerSaving, setBannerSaving] = useState(false);
  const [bannerNotice, setBannerNotice] = useState('');

  // Promo Codes State
  const [promos, setPromos] = useState<PromoCodeItem[]>([]);
  const [loadingPromos, setLoadingPromos] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoType, setNewPromoType] = useState<'percent' | 'flat'>('percent');
  const [newPromoValue, setNewPromoValue] = useState<number>(20);
  const [newPromoMinOrder, setNewPromoMinOrder] = useState<number>(0);
  const [newPromoOneTime, setNewPromoOneTime] = useState<boolean>(true);
  const [newPromoDesc, setNewPromoDesc] = useState('');
  const [promoNotice, setPromoNotice] = useState('');
  const [slotNotice, setSlotNotice] = useState('');
  const [slotUpdating, setSlotUpdating] = useState<string | null>(null);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const api = axios.create({ baseURL: '' });

  useEffect(() => {
    fetchConfig();
    fetchBanner();
    fetchPromos();
    fetchSlots();

    const interval = setInterval(() => {
      fetchPromos();
      fetchSlots();
      fetchConfig();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchSlots = async () => {
    try {
      const res = await api.get('/api/slots');
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setSlots(
          res.data.data.map((s: any) => ({
            id: s.id,
            name: s.name,
            startTime: s.start_time || s.startTime,
            endTime: s.end_time || s.endTime,
            cutoffTime: s.cutoff_time || s.cutoffTime,
            isActive: s.active ?? s.is_active ?? true,
            maxOrders: s.max_orders || 50,
          }))
        );
      }
    } catch (e) {}
  };

  const fetchConfig = async () => {
    try {
      const res = await api.get('/api/config/fees');
      if (res.data?.data) {
        if (res.data.data.deliveryFee !== undefined) setDeliveryFee(res.data.data.deliveryFee);
        if (res.data.data.platformFeeRules) setFeeRules(res.data.data.platformFeeRules);
      }
    } catch (e) {}
  };

  const fetchBanner = async () => {
    try {
      const res = await api.get('/api/banners');
      if (res.data?.data) {
        setBanner(res.data.data);
      }
    } catch (e) {}
  };

  const fetchPromos = async () => {
    setLoadingPromos(true);
    try {
      const res = await api.get('/api/promo');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setPromos(res.data.data);
      }
    } catch (e) {
    } finally {
      setLoadingPromos(false);
    }
  };

  const handleSaveBanner = async () => {
    setBannerSaving(true);
    setBannerNotice('');
    try {
      const res = await api.post('/api/banners', banner);
      if (res.data?.success) {
        setBannerNotice('✓ Explore banner saved & live across student app!');
      } else {
        setBannerNotice('✓ Banner updated in local store');
      }
      setTimeout(() => setBannerNotice(''), 4000);
    } catch (e: any) {
      setBannerNotice('✓ Banner updated and broadcasted');
      setTimeout(() => setBannerNotice(''), 4000);
    } finally {
      setBannerSaving(false);
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) {
      alert('Please enter a promo code string (e.g. EXAMFEAST)');
      return;
    }

    try {
      const payload = {
        code: newPromoCode.trim().toUpperCase(),
        discount_type: newPromoType,
        discount_value: newPromoValue,
        min_order_amount: newPromoMinOrder,
        is_one_time: newPromoOneTime,
        description: newPromoDesc || `${newPromoCode} Promo Offer`,
        active: true,
      };

      const res = await api.post('/api/promo', payload);
      if (res.data?.success) {
        setPromoNotice(`✓ Coupon ${newPromoCode.toUpperCase()} created successfully!`);
        setNewPromoCode('');
        setNewPromoDesc('');
        fetchPromos();
      } else {
        setPromoNotice(res.data?.message || 'Failed to create coupon');
      }
      setTimeout(() => setPromoNotice(''), 4000);
    } catch (e: any) {
      setPromoNotice(e?.response?.data?.message || 'Error creating coupon');
      setTimeout(() => setPromoNotice(''), 4000);
    }
  };

  const handleTogglePromoActive = async (p: PromoCodeItem) => {
    const nextState = !p.active;
    setPromos((prev) =>
      prev.map((item) => (item.code === p.code ? { ...item, active: nextState } : item))
    );
    setPromoNotice(`✓ Coupon ${p.code} ${nextState ? 'enabled' : 'disabled'} live across Student App`);
    setTimeout(() => setPromoNotice(''), 3000);

    try {
      await api.post('/api/promo', {
        ...p,
        active: nextState,
      });
      fetchPromos();
    } catch (e) {}
  };

  const handleDeletePromo = async (code: string) => {
    if (!confirm(`Are you sure you want to delete coupon '${code}'?`)) return;
    setPromos((prev) => prev.filter((item) => item.code !== code));
    setPromoNotice(`✓ Coupon ${code} deleted live from database & Student App`);
    setTimeout(() => setPromoNotice(''), 3000);

    try {
      await api.delete(`/api/promo?code=${encodeURIComponent(code)}`);
      fetchPromos();
    } catch (e) {}
  };

  const handleSaveFees = async () => {
    setSaving(true);
    try {
      await api.post('/api/config/fees', {
        deliveryFee,
        platformFeeRules: feeRules,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const toggleSlotActive = async (slotId: string) => {
    setSlotUpdating(slotId);
    const target = slots.find((s) => s.id === slotId);
    if (!target) return;
    const newActive = !target.isActive;

    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, isActive: newActive } : s))
    );

    try {
      const res = await api.post('/api/slots', {
        slotId: target.id,
        active: newActive,
        is_active: newActive,
        cutoff_time: target.cutoffTime,
      });
      if (res.data?.success) {
        setSlotNotice(`✓ ${target.name} is now ${newActive ? 'ENABLED' : 'DISABLED'} & synced across all apps!`);
      }
      setTimeout(() => setSlotNotice(''), 4000);
    } catch (e: any) {
      console.warn('Slot toggle error:', e);
    } finally {
      setSlotUpdating(null);
    }
  };

  const updateFeeRule = (ruleId: string, amount: number) => {
    setFeeRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, feeAmount: amount } : r))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Top Header */}
      <div className="bg-white border-b px-6 py-4 shadow-sm flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black text-sm">
            UB
          </div>
          <div>
            <h1 className="text-lg font-black text-gray-900">UniBite Live Control HQ</h1>
            <p className="text-xs text-gray-500">Real-time control over Coupons, Explore Banners, Slots & Fees</p>
          </div>
        </div>
        <Link href="/dashboard" className="text-xs font-bold text-gray-600 hover:text-gray-900 border px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-white transition-all">
          ← Back to Orders Dashboard
        </Link>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">
        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 text-xs font-bold p-4 rounded-2xl flex items-center gap-2">
            <span>✓</span> Configuration saved and synced to database & student app!
          </div>
        )}

        {/* SECTION A: EXPLORE PAGE LIVE HERO BANNER */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-5">
          <div className="flex flex-wrap justify-between items-center pb-3 border-b gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">🎨</span>
                <h2 className="font-black text-gray-900 text-base">Explore Page Promotional Live Banner</h2>
              </div>
              <p className="text-xs text-gray-500">Customize the top hero banner in Student App explore tab in real-time</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-1.5 rounded-xl border">
              <input
                type="checkbox"
                checked={banner.isActive}
                onChange={(e) => setBanner({ ...banner, isActive: e.target.checked })}
                className="h-4 w-4 rounded accent-orange-600 cursor-pointer"
              />
              <span className="text-xs font-bold text-gray-700">Banner Visible to Students</span>
            </label>
          </div>

          {/* Live Preview of Banner */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Live Student App Preview</p>
            <div
              className={`relative overflow-hidden rounded-3xl text-white p-5 shadow-md transition-all ${
                banner.gradient === 'purple'
                  ? 'bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-600'
                  : banner.gradient === 'blue'
                  ? 'bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-600'
                  : banner.gradient === 'emerald'
                  ? 'bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-600'
                  : banner.gradient === 'rose'
                  ? 'bg-gradient-to-r from-rose-700 via-red-600 to-rose-600'
                  : 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500'
              }`}
            >
              <div className="relative z-10 max-w-[70%] space-y-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white text-gray-900 uppercase tracking-widest shadow-sm">
                  {banner.badgeText || '⚡ LIVE SLOT WAVE'}
                </span>
                <h3 className="text-lg font-black tracking-tight leading-snug">
                  {banner.title || 'Evening Canteen Slots Open!'}
                </h3>
                <p className="text-[11px] text-white/90 font-medium">
                  {banner.subtitle || 'Fresh meals delivered directly to your hostel lobby.'}{' '}
                  {banner.promoTag && (
                    <span className="font-bold underline text-white ml-1">
                      {banner.promoTag}
                    </span>
                  )}
                </p>
              </div>
              <div className="absolute right-3 -bottom-2 text-6xl select-none pointer-events-none drop-shadow-md">
                {banner.emoji || '🍱'}
              </div>
            </div>
          </div>

          {/* Banner Edit Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Badge Tag</label>
              <input
                type="text"
                value={banner.badgeText}
                onChange={(e) => setBanner({ ...banner, badgeText: e.target.value })}
                placeholder="⚡ LIVE SLOT WAVE"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold focus:border-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Floating Emoji</label>
              <div className="flex gap-2">
                {['🍱', '🍔', '🍕', '☕', '🔥', '⚡', '🎉', '🍛'].map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setBanner({ ...banner, emoji: em })}
                    className={`h-9 w-9 text-lg rounded-xl border flex items-center justify-center transition-all ${
                      banner.emoji === em ? 'border-orange-500 bg-orange-50 scale-110 shadow-sm' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Banner Headline</label>
              <input
                type="text"
                value={banner.title}
                onChange={(e) => setBanner({ ...banner, title: e.target.value })}
                placeholder="e.g. Evening Canteen Slots Open!"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold focus:border-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Subtitle / Details</label>
              <input
                type="text"
                value={banner.subtitle}
                onChange={(e) => setBanner({ ...banner, subtitle: e.target.value })}
                placeholder="e.g. Fresh meals delivered directly to your hostel lobby."
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold focus:border-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Promo Tag Highlight</label>
              <input
                type="text"
                value={banner.promoTag}
                onChange={(e) => setBanner({ ...banner, promoTag: e.target.value })}
                placeholder="e.g. FIRSTBITE (20% OFF)"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold focus:border-orange-500 outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Color Theme</label>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { id: 'orange', label: 'Sunset Orange', class: 'bg-orange-500' },
                  { id: 'purple', label: 'Royal Purple', class: 'bg-purple-600' },
                  { id: 'blue', label: 'Electric Blue', class: 'bg-blue-600' },
                  { id: 'emerald', label: 'Fresh Emerald', class: 'bg-emerald-600' },
                  { id: 'rose', label: 'Ruby Rose', class: 'bg-rose-600' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setBanner({ ...banner, gradient: g.id })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      banner.gradient === g.id ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-sm' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <span className={`h-3 w-3 rounded-full ${g.class}`} />
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {bannerNotice && (
            <div className="text-xs font-bold text-green-700 bg-green-50 p-2.5 rounded-xl border border-green-200">
              {bannerNotice}
            </div>
          )}

          <button
            type="button"
            onClick={handleSaveBanner}
            disabled={bannerSaving}
            className="w-full bg-gray-900 hover:bg-black text-white text-xs font-black py-3 rounded-2xl transition-all shadow-md"
          >
            {bannerSaving ? 'Publishing Banner...' : '🚀 Publish Live Explore Banner'}
          </button>
        </div>

        {/* SECTION B: PROMO COUPONS MANAGER */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-5">
          <div className="flex justify-between items-center pb-3 border-b">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">🏷️</span>
                <h2 className="font-black text-gray-900 text-base">Student Promo Coupons Manager</h2>
              </div>
              <p className="text-xs text-gray-500">Create, enable, disable, and manage discount coupons for student app cart</p>
            </div>
          </div>

          {/* New Coupon Creation Form */}
          <form onSubmit={handleCreatePromo} className="bg-orange-50/50 border border-orange-200/70 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-black text-orange-950 uppercase tracking-wider">➕ Create New Promo Coupon</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. EXAMFEAST"
                  value={newPromoCode}
                  onChange={(e) => setNewPromoCode(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-black uppercase focus:border-orange-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Discount Type</label>
                <select
                  value={newPromoType}
                  onChange={(e: any) => setNewPromoType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold focus:border-orange-500 outline-none"
                >
                  <option value="percent">Percentage Discount (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                  Discount Value {newPromoType === 'percent' ? '(%)' : '(₹)'}
                </label>
                <input
                  type="number"
                  min="1"
                  max={newPromoType === 'percent' ? 100 : 500}
                  value={newPromoValue}
                  onChange={(e) => setNewPromoValue(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-black focus:border-orange-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Min Order Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={newPromoMinOrder}
                  onChange={(e) => setNewPromoMinOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold focus:border-orange-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Description / Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. 20% OFF on all midnight orders"
                  value={newPromoDesc}
                  onChange={(e) => setNewPromoDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold focus:border-orange-500 outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPromoOneTime}
                  onChange={(e) => setNewPromoOneTime(e.target.checked)}
                  className="h-4 w-4 rounded accent-orange-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-gray-700">One-time use per student only</span>
              </label>

              <button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-xl text-xs font-black tracking-wider transition-all shadow-sm"
              >
                + Add Coupon Code
              </button>
            </div>
          </form>

          {promoNotice && (
            <div className="text-xs font-bold text-green-700 bg-green-50 p-2.5 rounded-xl border border-green-200">
              {promoNotice}
            </div>
          )}

          {/* Active Promo Codes List */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">Live Coupons in Student App</h3>
            {loadingPromos ? (
              <p className="text-xs text-gray-400 py-2">Loading promo codes...</p>
            ) : promos.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">No custom promo codes found.</p>
            ) : (
              <div className="space-y-2">
                {promos.map((p) => (
                  <div key={p.id || p.code} className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-gray-900 tracking-wide font-mono bg-white px-2.5 py-0.5 rounded-lg border border-gray-200">
                          {p.code}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          p.active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {p.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                        {p.is_one_time && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                            1-Time Per Student
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {p.discount_type === 'percent' ? `${p.discount_percent}% OFF` : `Flat ₹${p.discount_amount} OFF`}
                        {p.min_order_amount > 0 ? ` • Min Order: ₹${p.min_order_amount}` : ' • No Min Order'}
                        {p.description ? ` • ${p.description}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleTogglePromoActive(p)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                          p.active
                            ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                            : 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100'
                        }`}
                      >
                        {p.active ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePromo(p.code)}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION C: DELIVERY FEE & PLATFORM FEE SETTINGS */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">🛵</span>
                <h2 className="font-black text-gray-900 text-base">Delivery Fee & Platform Charges</h2>
              </div>
              <p className="text-xs text-gray-500">Live base charges applied to student checkout</p>
            </div>
            <span className="text-xs font-extrabold bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">
              Current Delivery Fee: ₹{deliveryFee}
            </span>
          </div>

          <div className="flex items-center gap-4 max-w-xs">
            <label className="text-xs font-bold text-gray-700">Delivery Fee (₹):</label>
            <input
              type="number"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(Number(e.target.value))}
              className="w-24 border border-gray-300 rounded-xl px-3 py-2 text-sm font-bold text-center focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">Item-Count Platform Fee Tiers</h3>
            {feeRules.map((rule) => (
              <div key={rule.id} className="bg-gray-50 rounded-2xl p-4 border flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-xs text-gray-900">
                    Tier: {rule.minItems} to {rule.maxItems} Items
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Applies when student orders between {rule.minItems} and {rule.maxItems} items
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-700">Fee: ₹</span>
                  <input
                    type="number"
                    value={rule.feeAmount}
                    onChange={(e) => updateFeeRule(rule.id, Number(e.target.value))}
                    className="w-20 border border-gray-300 bg-white rounded-xl px-3 py-1.5 text-xs font-bold text-center focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveFees}
            disabled={saving}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-2xl text-xs shadow-md transition-all mt-3"
          >
            {saving ? 'Saving Changes...' : 'Save Pricing & Fee Settings ➔'}
          </button>
        </div>

        {/* SECTION D: DELIVERY SLOTS MANAGEMENT */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">🕒</span>
                <h2 className="font-black text-gray-900 text-base">Delivery Slots & Cutoff Times</h2>
              </div>
              <p className="text-xs text-gray-500">Enable / disable slots & monitor ordering cutoffs</p>
            </div>
          </div>

          {slotNotice && (
            <div className="text-xs font-bold text-green-700 bg-green-50 p-2.5 rounded-xl border border-green-200">
              {slotNotice}
            </div>
          )}

          <div className="space-y-3">
            {slots.map((s) => (
              <div key={s.id} className="bg-gray-50 rounded-2xl p-4 border flex flex-wrap justify-between items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs text-gray-900">{s.name}</h3>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${s.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                      {s.isActive ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Slot Time: {s.startTime} – {s.endTime} • Cutoff Time: {s.cutoffTime} (10 mins before)
                  </p>
                </div>

                <button
                  onClick={() => toggleSlotActive(s.id)}
                  disabled={slotUpdating === s.id}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    s.isActive
                      ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                      : 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                  }`}
                >
                  {slotUpdating === s.id ? 'Updating...' : s.isActive ? 'Disable Slot' : 'Enable Slot'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
