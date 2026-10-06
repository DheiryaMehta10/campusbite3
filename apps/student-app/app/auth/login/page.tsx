'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import ThemeToggle from '@/components/ThemeToggle';

type AuthMode = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login Form
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  // Sign Up Form
  const [signupForm, setSignupForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    collegeName: 'Campus Institute of Technology',
    hostelName: '',
    roomNumber: '',
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const api = axios.create({ baseURL: '' });

  useEffect(() => {
    // Check if student already logged in
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('userEmail');
      const savedId = localStorage.getItem('userId');
      if (savedEmail && savedId) {
        // Pre-fill email for quick login
        setLoginForm((prev) => ({ ...prev, email: savedEmail }));
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = loginForm.email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your student email or mobile number');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.post('/api/auth/student/login', {
        email: cleanEmail,
        password: loginForm.password,
      });

      if (res.data?.success && res.data.student) {
        const s = res.data.student;
        localStorage.setItem('userId', s.id);
        localStorage.setItem('userEmail', s.email);
        localStorage.setItem('userName', s.fullName || 'Student');
        localStorage.setItem('userPhone', s.phoneNumber || s.phone || '');
        localStorage.setItem('userHostel', s.hostelName || '');
        localStorage.setItem('userRoom', s.roomNumber || '');
        localStorage.setItem('userCollege', s.collegeName || 'Campus University');

        router.push('/home');
      } else {
        setError(res.data?.message || 'Login failed. Please verify credentials.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Account not found. Please click Sign Up to register your student profile.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = signupForm.email.trim().toLowerCase();
    const cleanPhone = signupForm.phoneNumber.replace(/\D/g, '').slice(-10);

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid student email address');
      return;
    }
    if (!signupForm.fullName.trim()) {
      setError('Please enter your Full Name');
      return;
    }
    if (!signupForm.hostelName.trim()) {
      setError('Please enter your Hostel Name / Block');
      return;
    }
    if (!signupForm.roomNumber.trim()) {
      setError('Please enter your Room Number');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number for order delivery updates');
      return;
    }
    if (!agreedToTerms) {
      setError('You must agree to the Terms & Conditions and Privacy Policy to register');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.post('/api/auth/student/signup', {
        email: cleanEmail,
        password: signupForm.password,
        fullName: signupForm.fullName.trim(),
        phoneNumber: cleanPhone,
        collegeName: signupForm.collegeName.trim(),
        hostelName: signupForm.hostelName.trim(),
        roomNumber: signupForm.roomNumber.trim(),
      });

      if (res.data?.success && res.data.student) {
        const s = res.data.student;
        localStorage.setItem('userId', s.id);
        localStorage.setItem('userEmail', s.email);
        localStorage.setItem('userName', s.fullName || signupForm.fullName.trim());
        localStorage.setItem('userPhone', s.phoneNumber || cleanPhone);
        localStorage.setItem('userHostel', s.hostelName || signupForm.hostelName.trim());
        localStorage.setItem('userRoom', s.roomNumber || signupForm.roomNumber.trim());
        localStorage.setItem('userCollege', s.collegeName || signupForm.collegeName.trim());

        // Clear outdated carts for fresh registration
        localStorage.removeItem('cb_cart');
        localStorage.removeItem('cb_orders');

        router.push('/home');
      } else {
        setError(res.data?.message || 'Failed to register account');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create student account. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Bar with Logo & Theme Toggle */}
      <div className="w-full max-w-md mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl overflow-hidden border border-orange-500/30 bg-slate-950 flex-shrink-0 shadow-md shadow-orange-500/15">
            <img src="/logo-icon.png" alt="CampusBite" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
              Campus<span className="text-orange-600">Bite</span>
            </span>
            <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Student App</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Main Auth Container */}
      <div className="w-full max-w-md mx-auto px-4 py-2 flex-1 flex flex-col justify-center">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl dark:shadow-2xl dark:shadow-black/50 border border-slate-100 dark:border-slate-800 p-6 md:p-8 space-y-5 transition-all">
          {/* Header Emblem & Title */}
          <div className="text-center space-y-2">
            <div className="inline-block mx-auto">
              <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-orange-500/30 shadow-xl shadow-orange-600/15 bg-slate-950 p-1 mx-auto">
                <img src="/logo-icon.png" alt="CampusBite Logo" className="w-full h-full object-cover rounded-2xl" />
              </div>
            </div>

            <div className="space-y-0.5">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {mode === 'login' ? 'Welcome Back!' : 'Create Student Account'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {mode === 'login'
                  ? 'Sign in to order canteen meals straight to your hostel'
                  : 'Register once to order food, midnight snacks & grocery'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-500 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                  ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-500 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign Up (New Student)
            </button>
          </div>

          {/* Error / Success Alerts */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <span>✓</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Student Email or Mobile Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="student@campus.edu or 10-digit phone"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 dark:focus:border-orange-500 transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Default: campus123</span>
                </div>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 dark:focus:border-orange-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-2xl text-xs font-black tracking-wider uppercase shadow-lg shadow-orange-600/25 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Signing In...' : 'Sign In to CampusBite ➔'}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  New to CampusBite?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setError('');
                    }}
                    className="text-orange-600 dark:text-orange-400 font-black hover:underline"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* 2. SIGN UP FORM */
            <form onSubmit={handleSignup} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Alex Johnson"
                  value={signupForm.fullName}
                  onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@campus.edu"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit phone"
                    value={signupForm.phoneNumber}
                    onChange={(e) => setSignupForm({ ...signupForm, phoneNumber: e.target.value.slice(0, 10) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Create secure password"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hostel / Block *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tagore Hostel Block B"
                    value={signupForm.hostelName}
                    onChange={(e) => setSignupForm({ ...signupForm, hostelName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 304"
                    value={signupForm.roomNumber}
                    onChange={(e) => setSignupForm({ ...signupForm, roomNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
                <label htmlFor="agreeTerms" className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug cursor-pointer">
                  I agree to the{' '}
                  <Link href="/terms" target="_blank" className="text-orange-600 dark:text-orange-400 font-bold underline">
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" target="_blank" className="text-orange-600 dark:text-orange-400 font-bold underline">
                    Privacy Policy
                  </Link>{' '}
                  of CampusBite.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-2xl text-xs font-black tracking-wider uppercase shadow-lg shadow-orange-600/25 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Creating Profile...' : 'Complete Sign Up ➔'}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                    }}
                    className="text-orange-600 dark:text-orange-400 font-black hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer Play Store Badges */}
      <footer className="w-full max-w-md mx-auto p-4 text-center space-y-2">
        <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Link href="/terms" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            Terms of Service
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/account/delete" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            Delete Account
          </Link>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          CampusBite v2.4 • Google Play Store Certified
        </p>
      </footer>
    </div>
  );
}