'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

type Step = 'email' | 'otp' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const [signup, setSignup] = useState({
    fullName: '',
    collegeName: 'Campus Institute of Technology',
    hostelName: '',
    roomNumber: '',
    email: '',
    phoneNumber: '9876543210',
  });

  const api = axios.create({ baseURL: '' });

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const cleanEmail = email.trim().toLowerCase();

  const handleSendOtp = async () => {
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid student email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.post('/api/auth/student/send-otp', { email: cleanEmail });
      if (res.data?.token) {
        setVerificationToken(res.data.token);
      }
      setStep('otp');
      setResendTimer(30);
      setCanResend(false);
      setOtp('');
      setSuccessMsg(`Verification OTP sent to ${cleanEmail}. Please check your inbox or spam folder.`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to send OTP email. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.post('/api/auth/student/send-otp', { email: cleanEmail });
      if (res.data?.token) {
        setVerificationToken(res.data.token);
      }
      setResendTimer(30);
      setCanResend(false);
      setOtp('');
      setSuccessMsg(`A fresh OTP code has been sent to ${cleanEmail}`);
    } catch (err: any) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const cleanOtp = otp.trim();
    if (cleanOtp.length < 4) {
      setError('Please enter the 6-digit OTP sent to your email');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/api/auth/student/verify-otp', {
        email: cleanEmail,
        otp: cleanOtp,
        token: verificationToken,
      });

      if (res.data?.success) {
        if (res.data?.isNewUser) {
          setSignup((prev) => ({ ...prev, email: cleanEmail }));
          setStep('signup');
          setError('');
        } else {
          const s = res.data?.student || {};
          const uId = res.data?.userId || s.id || `student-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '')}`;
          localStorage.setItem('userId', uId);
          localStorage.setItem('userEmail', cleanEmail);
          localStorage.setItem('userPhone', s.phone || '9876543210');
          if (s.fullName) localStorage.setItem('userName', s.fullName);
          if (s.hostelName) localStorage.setItem('userHostel', s.hostelName);
          if (s.roomNumber) localStorage.setItem('userRoom', s.roomNumber);
          if (s.collegeName) localStorage.setItem('userCollege', s.collegeName);
          router.push('/home');
        }
      } else {
        setError(res.data?.message || 'Invalid OTP code. Please check your email.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid code. You may also use test code 123456.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signup.fullName.trim()) {
      setError('Please enter your Full Name');
      return;
    }
    if (!signup.hostelName.trim()) {
      setError('Please enter your Hostel Name / Block');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/api/auth/student/signup', {
        ...signup,
        email: cleanEmail,
        phoneNumber: signup.phoneNumber || '9876543210',
      });

      const sId = res.data?.student?.id || `student-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '')}`;
      localStorage.setItem('userId', sId);
      localStorage.setItem('userName', signup.fullName.trim());
      localStorage.setItem('userEmail', cleanEmail);
      localStorage.setItem('userPhone', signup.phoneNumber || '9876543210');
      localStorage.setItem('userCollege', (signup.collegeName || 'Campus').trim());
      localStorage.setItem('userHostel', signup.hostelName.trim());
      localStorage.setItem('userRoom', (signup.roomNumber || '').trim());
      router.push('/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    localStorage.setItem('userId', 'student-demo-1');
    localStorage.setItem('userEmail', 'aarav.sharma@campus.edu');
    localStorage.setItem('userPhone', '9876543210');
    localStorage.setItem('userName', 'Aarav Sharma');
    localStorage.setItem('userHostel', 'Tagore Hostel Block A');
    localStorage.setItem('userRoom', '304');
    localStorage.setItem('userCollege', 'Campus Institute');
    router.push('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-600/25 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-7 md:p-8 z-10 border border-orange-100/50">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-orange-500/30 text-3xl mb-2.5">
            🍔
          </div>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight">CampusBite</h1>
          <p className="text-orange-600 font-bold text-xs tracking-wider uppercase mt-0.5">
            Order Smart • Delivered by Slot
          </p>
          <div className="flex justify-center gap-1.5 mt-3">
            <span className={`h-1.5 rounded-full transition-all ${step === 'email' ? 'w-6 bg-orange-600' : 'w-2 bg-gray-200'}`}></span>
            <span className={`h-1.5 rounded-full transition-all ${step === 'otp' ? 'w-6 bg-orange-600' : 'w-2 bg-gray-200'}`}></span>
            <span className={`h-1.5 rounded-full transition-all ${step === 'signup' ? 'w-6 bg-orange-600' : 'w-2 bg-gray-200'}`}></span>
          </div>
        </div>

        {/* STEP 1: EMAIL INPUT ONLY */}
        {step === 'email' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black text-gray-700 uppercase tracking-widest">
                  Student Email ID
                </label>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ✉️ Free Instant OTP
                </span>
              </div>
              <div className="flex items-center rounded-2xl border-2 border-gray-200 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200 transition-all overflow-hidden bg-gray-50">
                <span className="pl-3.5 text-gray-400 text-base">✉️</span>
                <input
                  type="email"
                  placeholder="Enter college or personal email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                  className="w-full px-3.5 py-3 text-sm font-bold text-gray-900 bg-transparent focus:outline-none"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5">
                We will email a 6-digit verification code to sign in or create your student profile.
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-start gap-2">
                <span className="text-base leading-none">⚠️</span>
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <button
              onClick={handleSendOtp}
              disabled={loading || !cleanEmail.includes('@')}
              className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/30 transition-all transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Sending Code...' : 'Send OTP to Email ➔'}
            </button>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400 font-bold text-[10px]">Or instant preview</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>⚡</span>
              <span>1-Click Demo Student Login</span>
            </button>
          </div>
        )}

        {/* STEP 2: EMAIL OTP VERIFICATION */}
        {step === 'otp' && (
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3.5 text-center">
              <span className="text-[11px] font-bold text-orange-950">
                Code sent to <strong>{cleanEmail}</strong>
              </span>
              <p className="text-[10px] text-orange-700 mt-0.5">
                (Test code: <strong>123456</strong> works instantly for testing)
              </p>
              <button
                onClick={() => {
                  setStep('email');
                  setError('');
                  setSuccessMsg('');
                }}
                className="block mx-auto text-[11px] font-black text-orange-600 underline mt-1"
              >
                Change Email Address
              </button>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 text-center">
                Enter 6-Digit Verification Code
              </label>
              <input
                type="text"
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(val);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                className="w-full py-3 text-center text-2xl font-black tracking-widest text-gray-900 border-2 border-orange-300 focus:border-orange-600 rounded-2xl bg-orange-50/20 focus:outline-none"
                autoFocus
              />
            </div>

            <div className="text-center">
              {canResend ? (
                <button
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-xs font-bold text-orange-600 hover:underline"
                >
                  Resend Verification Email
                </button>
              ) : (
                <p className="text-xs text-gray-400 font-medium">
                  Resend in <strong className="text-gray-600 font-bold">{resendTimer}s</strong>
                </p>
              )}
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-start gap-2">
                <span className="text-base leading-none">⚠️</span>
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {successMsg && !error && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl text-center">
                {successMsg}
              </div>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 4}
              className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/30 transition-all transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Verifying Code...' : 'Verify & Enter CampusBite ➔'}
            </button>
          </div>
        )}

        {/* STEP 3: STUDENT PROFILE REGISTRATION */}
        {step === 'signup' && (
          <div className="space-y-3.5">
            <div className="border-b pb-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold mb-1.5">
                <span>✓ Verified:</span>
                <span>{cleanEmail}</span>
              </div>
              <h2 className="text-base font-black text-gray-900">Student Profile Setup</h2>
              <p className="text-xs text-gray-500">Set up your hostel details for slot meal delivery</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Full Name *</label>
              <input
                type="text"
                value={signup.fullName}
                onChange={(e) => setSignup({ ...signup, fullName: e.target.value })}
                placeholder="e.g. Aarav Sharma"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Hostel / Block *</label>
                <input
                  type="text"
                  value={signup.hostelName}
                  onChange={(e) => setSignup({ ...signup, hostelName: e.target.value })}
                  placeholder="e.g. Tagore Hostel A"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Room Number</label>
                <input
                  type="text"
                  value={signup.roomNumber}
                  onChange={(e) => setSignup({ ...signup, roomNumber: e.target.value })}
                  placeholder="e.g. 304"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">College / Campus Name</label>
              <input
                type="text"
                value={signup.collegeName}
                onChange={(e) => setSignup({ ...signup, collegeName: e.target.value })}
                placeholder="Campus Institute"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-start gap-2">
                <span className="text-base leading-none">⚠️</span>
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/30 transition-all transform active:scale-[0.98]"
            >
              {loading ? 'Saving Profile...' : 'Save Profile & Enter CampusBite ➔'}
            </button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400 font-medium">
            CampusBite Scheduled Slot Delivery Platform
          </p>
        </div>
      </div>
    </div>
  );
}