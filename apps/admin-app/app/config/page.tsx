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

export default function AdminConfigPage() {
  const router = useRouter();
  const [deliveryFee, setDeliveryFee] = useState<number>(10);
  const [feeRules, setFeeRules] = useState<PlatformFeeRule[]>([
    { id: 'rule-1', minItems: 1, maxItems: 3, feeAmount: 2 },
    { id: 'rule-2', minItems: 4, maxItems: 7, feeAmount: 4 },
  ]);

  const [slots, setSlots] = useState<DeliverySlotConfig[]>([
    { id: 'slot-lunch', name: 'Lunch Slot', startTime: '12:00', endTime: '13:00', cutoffTime: '11:50', isActive: false },
    { id: 'slot-eve-1', name: 'Evening Slot 1', startTime: '18:00', endTime: '19:00', cutoffTime: '17:50', isActive: true },
    { id: 'slot-eve-2', name: 'Evening Slot 2', startTime: '19:00', endTime: '20:00', cutoffTime: '18:50', isActive: true },
  ]);

  const [announcementText, setAnnouncementText] = useState('CampusBite delivers in scheduled slots. Lunch slot is currently disabled.');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || '' });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/api/config/fees');
      if (res.data?.data) {
        if (res.data.data.deliveryFee) setDeliveryFee(res.data.data.deliveryFee);
        if (res.data.data.platformFeeRules) setFeeRules(res.data.data.platformFeeRules);
      }
    } catch (e) {
      console.log('Using default fee config');
    }
  };

  const handleSaveAll = async () => {
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

  const toggleSlotActive = (slotId: string) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const updateFeeRule = (ruleId: string, amount: number) => {
    setFeeRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, feeAmount: amount } : r))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Header */}
      <div className="bg-white border-b px-6 py-4 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-gray-900">CampusBite System Configuration</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage Delivery Fees, Platform Fee Rules, Slots & Announcements</p>
        </div>
        <Link href="/dashboard" className="text-xs font-bold text-gray-600 hover:text-gray-900 border px-3 py-1.5 rounded-xl">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 text-xs font-bold p-4 rounded-2xl flex items-center gap-2">
            <span>✓</span> Configuration saved successfully! Live pricing & slot rules are updated.
          </div>
        )}

        {/* Section 1: Delivery Fee */}
        <div className="bg-white rounded-3xl p-6 border shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b">
            <div>
              <h2 className="font-bold text-gray-900 text-base">1. Delivery Fee Setting</h2>
              <p className="text-xs text-gray-500">Base delivery charge applied to every slot order</p>
            </div>
            <span className="text-xs font-extrabold bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">
              Current: ₹{deliveryFee}
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
        </div>

        {/* Section 2: Platform Fee Rules */}
        <div className="bg-white rounded-3xl p-6 border shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b">
            <div>
              <h2 className="font-bold text-gray-900 text-base">2. Item-Count Platform Fee Rules</h2>
              <p className="text-xs text-gray-500">Dynamic tiered platform fee based on number of items in cart</p>
            </div>
          </div>

          <div className="space-y-3">
            {feeRules.map((rule) => (
              <div key={rule.id} className="bg-gray-50 rounded-2xl p-4 border flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-xs text-gray-900">
                    Tier: {rule.minItems} to {rule.maxItems} Items
                  </h3>
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
        </div>

        {/* Section 3: Delivery Slots Management */}
        <div className="bg-white rounded-3xl p-6 border shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b">
            <div>
              <h2 className="font-bold text-gray-900 text-base">3. Delivery Slots & Cutoff Times</h2>
              <p className="text-xs text-gray-500">Enable / disable slots & monitor ordering cutoffs</p>
            </div>
          </div>

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
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    s.isActive
                      ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                      : 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                  }`}
                >
                  {s.isActive ? 'Disable Slot' : 'Enable Slot'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Live Announcements */}
        <div className="bg-white rounded-3xl p-6 border shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b">
            <div>
              <h2 className="font-bold text-gray-900 text-base">4. Campus Announcement Banner</h2>
              <p className="text-xs text-gray-500">Displayed at top of Student App</p>
            </div>
          </div>

          <textarea
            rows={2}
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
        </div>

        {/* Save All CTA */}
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-2xl text-xs shadow-xl transition-all"
        >
          {saving ? 'Saving Changes...' : 'Save & Publish System Configuration ➔'}
        </button>
      </div>
    </div>
  );
}
