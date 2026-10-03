'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    phoneNumber: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/auth/restaurant/login', form);
      if (res.data.restaurant?.id) {
        localStorage.setItem('restaurantId', res.data.restaurant.id);
        localStorage.setItem('restaurantName', res.data.restaurant.name || 'Restaurant');
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-orange-600 text-center mb-2">CampusBite</h1>
        <p className="text-gray-600 text-center text-sm mb-8">Restaurant Portal</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              placeholder="10-digit phone"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value.slice(0, 10) })}
              maxLength={10}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              placeholder="restaurant@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-medium"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">Contact support to register your restaurant</p>
      </div>
    </div>
  );
}