'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

type Mode = 'login' | 'signup';

export default function RestaurantLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login Form
  const [loginForm, setLoginForm] = useState({
    email: '',
    phoneNumber: '',
    password: '',
  });

  // Sign Up Form
  const [signupForm, setSignupForm] = useState({
    name: '',
    ownerName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    cuisines: 'North Indian, Snacks, Beverages',
    deliveryTime: 'Slot 6:00 - 7:00 PM',
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const api = axios.create({ baseURL: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = loginForm.email.trim().toLowerCase();
    const cleanPhone = loginForm.phoneNumber.replace(/\D/g, '').slice(-10);

    if (!cleanEmail && !cleanPhone) {
      setError('Please enter your partner email or phone number');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.post('/api/auth/restaurant/login', {
        email: cleanEmail,
        phoneNumber: cleanPhone,
        password: loginForm.password,
      });
      if (res.data?.success && res.data?.restaurant?.id) {
        const rest = res.data.restaurant;
        localStorage.setItem('restaurantId', rest.id);
        localStorage.setItem('restaurantName', rest.name || 'Campus Canteen');
        localStorage.setItem('restaurantEmail', rest.email || cleanEmail);
        localStorage.setItem('restaurantPhone', rest.phone || rest.phoneNumber || cleanPhone || '');
        router.push('/dashboard');
        return;
      } else {
        setError(res.data?.message || 'Login failed. Please verify credentials.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'No registered restaurant partner found with these credentials. Please switch to "Register Outlet" to create your canteen account.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = signupForm.name.trim();
    const cleanEmail = signupForm.email.trim().toLowerCase();
    const cleanPhone = signupForm.phone.replace(/\D/g, '').slice(-10);

    if (!cleanName) {
      setError('Please enter your Restaurant / Outlet Name');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid Partner Email');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number for order dispatch alerts');
      return;
    }
    if (!signupForm.address.trim()) {
      setError('Please enter your Campus Location / Block');
      return;
    }
    if (!agreedToTerms) {
      setError('You must accept the Partner Terms, Merchant Agreement, and Privacy Policy to register');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.post('/api/auth/restaurant/signup', {
        name: cleanName,
        ownerName: signupForm.ownerName.trim(),
        email: cleanEmail,
        password: signupForm.password,
        phone: cleanPhone,
        address: signupForm.address.trim(),
        cuisines: signupForm.cuisines.trim(),
        deliveryTime: signupForm.deliveryTime,
      });

      if (res.data?.restaurant?.id) {
        const rest = res.data.restaurant;
        localStorage.setItem('restaurantId', rest.id);
        localStorage.setItem('restaurantName', rest.name);
        localStorage.setItem('restaurantEmail', rest.email);
        localStorage.setItem('restaurantPhone', rest.phone);

        // Store as newly created restaurant so menu starts clean
        localStorage.setItem(`cb_restaurant_menu_${rest.id}`, JSON.stringify([]));

        // Append to all restaurants list
        try {
          const currentList = JSON.parse((localStorage.getItem('ub_all_restaurants') || localStorage.getItem('cb_all_restaurants')) || '[]');
          currentList.unshift(rest);
          localStorage.setItem('ub_all_restaurants', JSON.stringify(currentList));
        } catch {}

        router.push('/dashboard');
      } else {
        setError(res.data?.message || 'Registration failed');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to register outlet. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-br from-amber-50 via-orange-50 to-orange-100 p-4 font-sans text-slate-900">
      <div className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-100 p-6 md:p-8 space-y-5 my-auto">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="relative inline-flex items-center justify-center mb-1">
            <div className="w-14 h-14 bg-gradient-to-tr from-[#1E293B] via-[#0F172A] to-[#334155] rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/30 border border-slate-700">
              <svg className="w-8 h-8 text-amber-400" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8 20C8 13.3726 13.3726 8 20 8C26.6274 8 32 13.3726 32 20C32 26.6274 26.6274 32 20 32C15.5 32 11.6 29.5 9.6 25.8"
                  stroke="currentColor"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                <path
                  d="M22 13L15 21H23L17 28"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="28" cy="12" r="2" fill="currentColor" />
              </svg>
            </div>
            <span className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full shadow-md border border-white">
              Partner
            </span>
          </div>

          <h1 className="text-2xl font-black text-gray-900 tracking-tight">UniBite Partner Portal</h1>
          <p className="text-[11px] font-black text-orange-600 uppercase tracking-widest">
            Kitchen POS • Live Orders • Menu Control
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
              mode === 'login'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Sign In (Existing)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
              mode === 'signup'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Register Outlet (New Partner)
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-red-700 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* 1. SIGN IN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Partner Email or Registered Phone
              </label>
              <input
                type="text"
                required
                placeholder="canteen@unibite.local or 10-digit mobile"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter kitchen password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white py-3.5 rounded-2xl font-bold text-xs shadow-lg shadow-orange-500/25 transition-transform active:scale-[0.98] disabled:opacity-50 tracking-wider uppercase"
            >
              {loading ? 'Authenticating...' : 'Enter Kitchen Dashboard ➔'}
            </button>
          </form>
        ) : (
          /* 2. SIGN UP / REGISTER OUTLET FORM */
          <form onSubmit={handleSignup} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Restaurant / Canteen Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Royal Biryani & Fast Food Hub"
                value={signupForm.name}
                onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Manager / Owner Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Chef Sharma"
                  value={signupForm.ownerName}
                  onChange={(e) => setSignupForm({ ...signupForm, ownerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit phone"
                  value={signupForm.phone}
                  onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value.slice(0, 10) })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Partner Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="partner@unibite.local"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Create kitchen password"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Campus Location / Academic Block *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., South Hostel Complex, Ground Floor"
                value={signupForm.address}
                onChange={(e) => setSignupForm({ ...signupForm, address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Cuisines / Specialties
              </label>
              <input
                type="text"
                placeholder="e.g., Biryani, South Indian, Rolls, Burgers"
                value={signupForm.cuisines}
                onChange={(e) => setSignupForm({ ...signupForm, cuisines: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Terms Agreement Checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="partnerAgreeTerms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
              <label htmlFor="partnerAgreeTerms" className="text-[11px] text-gray-600 leading-snug cursor-pointer">
                I agree to the{' '}
                <Link href="/terms" target="_blank" className="text-orange-600 font-bold underline">
                  Partner Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" target="_blank" className="text-orange-600 font-bold underline">
                  Merchant Privacy Policy
                </Link>
                .
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white py-3.5 rounded-2xl font-bold text-xs shadow-lg shadow-orange-500/25 transition-transform active:scale-[0.98] disabled:opacity-50 tracking-wider uppercase"
            >
              {loading ? 'Registering Outlet...' : 'Register Kitchen & Start Menu ➔'}
            </button>
          </form>
        )}

        <div className="pt-2 text-center space-y-1.5 border-t border-gray-100">
          <div className="flex justify-center gap-4 text-xs font-semibold text-gray-500">
            <Link href="/terms" className="text-orange-600 font-bold hover:underline">Terms</Link>
            <span>•</span>
            <Link href="/privacy" className="text-orange-600 font-bold hover:underline">Privacy</Link>
            <span>•</span>
            <Link href="/account/delete" className="text-gray-500 hover:underline">Data Safety</Link>
          </div>
          <p className="text-[10px] font-medium text-gray-400">
            UniBite Kitchen POS v2.4 • Play Store Certified
          </p>
        </div>
      </div>
    </div>
  );
}