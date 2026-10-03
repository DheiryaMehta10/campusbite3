'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    phoneNumber: '9876500001',
    email: 'canteen1@campusbite.local',
    password: 'password123',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/restaurant/login', form);
      if (res.data?.restaurant?.id) {
        localStorage.setItem('restaurantId', res.data.restaurant.id);
        localStorage.setItem('restaurantName', res.data.restaurant.name || 'North Campus Central Canteen');
      } else {
        localStorage.setItem('restaurantId', 'canteen-1');
        localStorage.setItem('restaurantName', 'North Campus Central Canteen');
      }
      router.push('/dashboard');
    } catch (err: any) {
      // Fallback demo login
      localStorage.setItem('restaurantId', 'canteen-1');
      localStorage.setItem('restaurantName', 'North Campus Central Canteen');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-orange-100 p-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-100/80 p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 items-center justify-center text-2xl shadow-lg shadow-orange-500/30 text-white mb-1">
            👨‍🍳
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">CampusBite Partner</h1>
          <p className="text-xs font-semibold text-orange-600 uppercase tracking-widest">
            Kitchen & Restaurant Portal
          </p>
          <p className="text-xs text-gray-500">Log in to manage live slot orders and canteen menus</p>
        </div>

        {/* Demo Fast Login Banner */}
        <div className="bg-orange-50/80 border border-orange-200/80 rounded-2xl p-3 text-xs text-orange-900">
          <p className="font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider mb-0.5">
            <span>⚡</span> Quick Demo Login Filled
          </p>
          <p className="text-[11px] text-orange-800">Phone: 9876500001 • Password: password123</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-gray-400 text-xs font-bold">+91</span>
              <input
                type="tel"
                placeholder="10-digit mobile"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value.slice(0, 10) })}
                maxLength={10}
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="canteen@campusbite.local"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter kitchen password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all shadow-sm"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white py-3.5 rounded-2xl font-bold text-xs shadow-lg shadow-orange-500/25 transition-transform active:scale-[0.98] disabled:opacity-50 tracking-wider uppercase"
          >
            {loading ? 'Authenticating...' : 'Enter Kitchen Dashboard ➔'}
          </button>
        </form>

        <p className="text-center text-[11px] text-gray-400">
          CampusBite Partner Network • Contact Admin for new canteen onboarding
        </p>
      </div>
    </div>
  );
}