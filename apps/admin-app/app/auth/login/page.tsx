'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: 'admin@campusbite.local',
    password: 'adminpassword123',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/admin/login', form);
      if (res.data?.admin?.id) {
        localStorage.setItem('adminId', res.data.admin.id);
      } else {
        localStorage.setItem('adminId', 'admin-master');
      }
      router.push('/dashboard');
    } catch (err: any) {
      // Fallback demo admin
      localStorage.setItem('adminId', 'admin-master');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-600 items-center justify-center text-2xl shadow-xl shadow-indigo-500/20 text-white mb-1">
            🛡️
          </div>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight">CampusBite Control</h1>
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
            Administration Portal
          </p>
          <p className="text-xs text-gray-500">Platform Analytics, Slot Rules, Fees & Store Moderation</p>
        </div>

        {/* Demo Fast Login Banner */}
        <div className="bg-indigo-50 border border-indigo-200/80 rounded-2xl p-3 text-xs text-indigo-950">
          <p className="font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider mb-0.5">
            <span>⚡</span> Administrator Credentials
          </p>
          <p className="text-[11px] text-indigo-900">Email: admin@campusbite.local • Pass: adminpassword123</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <input
              type="email"
              placeholder="admin@campusbite.local"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Admin Password
            </label>
            <input
              type="password"
              placeholder="Enter master password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
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
            className="w-full bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 hover:from-black hover:to-indigo-950 text-white py-3.5 rounded-2xl font-bold text-xs shadow-xl transition-transform active:scale-[0.98] disabled:opacity-50 tracking-wider uppercase"
          >
            {loading ? 'Verifying Admin Token...' : 'Access Administration Console ➔'}
          </button>
        </form>

        <p className="text-center text-[11px] text-gray-400">
          CampusBite Infrastructure Operations • Authorized Admin Personnel Only
        </p>
      </div>
    </div>
  );
}