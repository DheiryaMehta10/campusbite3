'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

type AuthMode = 'email' | 'phone';
type Step = 'input' | 'otp' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>('email');
  const [step, setStep] = useState<Step>('input');
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
    phoneNumber: '',
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

  const activeIdentifier = authMode === 'email' ? email.trim() : phone.replace(/\D/g, '').slice(-10);

  const handleSendOtp = async () => {
    if (authMode === 'email') {
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }
    } else {
      const clean = phone.replace(/\D/g, '').slice(-10);
      if (clean.length !== 10) {
        setError('Please enter a valid 10-digit Indian mobile number');
        return;
      }
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = authMode === 'email' ? { email: email.trim().toLowerCase() } : { phoneNumber: phone.replace(/\D/g, '').slice(-10) };
      const res = await api.post('/api/auth/student/send-otp', payload);
      
      if (res.data?.token) {
        setVerificationToken(res.data.token);
      }
      setStep('otp');
      setResendTimer(30);
      setCanResend(false);
      setOtp('');
      
      if (authMode === 'email') {
        setSuccessMsg(`Free 6-digit OTP sent to ${email.trim()}. Check your inbox or spam folder!`);
      } else {
        setSuccessMsg(`Verification code sent to +91 ${activeIdentifier}`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to send OTP. Please try again.';
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
      const payload = authMode === 'email' ? { email: email.trim().toLowerCase() } : { phoneNumber: phone.replace(/\D/g, '').slice(-10) };
      const res = await api.post('/api/auth/student/send-otp', payload);
      if (res.data?.token) {
        setVerificationToken(res.data.token);
      }
      setResendTimer(30);
      setCanResend(false);
      setOtp('');
      setSuccessMsg(`A fresh OTP code has been sent.`);
    } catch (err: any) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const cleanOtp = otp.trim();
    if (cleanOtp.length < 4) {
      setError('Please enter the 6-digit verification code');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const payload = {
        email: authMode === 'email' ? email.trim().toLowerCase() : undefined,
        phoneNumber: authMode === 'phone' ? phone.replace(/\D/g, '').slice(-10) : undefined,
        otp: cleanOtp,
        token: verificationToken,
      };

      const res = await api.post('/api/auth/student/verify-otp', payload);

      if (res.data?.success) {
        if (res.data?.isNewUser) {
          setSignup((prev) => ({
            ...prev,
            email: authMode === 'email' ? email.trim().toLowerCase() : '',
            phoneNumber: authMode === 'phone' ? phone.replace(/\D/g, '').slice(-10) : '',
          }));
          setStep('signup');
          setError('');
        } else {
          const s = res.data?.student || {};
          const uId = res.data?.userId || s.id || `student-${activeIdentifier}`;
          localStorage.setItem('userId', uId);
          localStorage.setItem('userPhone', s.phone || (authMode === 'phone' ? activeIdentifier : '9876543210'));
          if (s.fullName) localStorage.setItem('userName', s.fullName);
          if (s.hostelName) localStorage.setItem('userHostel', s.hostelName);
          if (s.roomNumber) localStorage.setItem('userRoom', s.roomNumber);
          if (s.collegeName) localStorage.setItem('userCollege', s.collegeName);
          if (s.email || authMode === 'email') localStorage.setItem('userEmail', s.email || email.trim());
          router.push('/home');
        }
      } else {
        setError(res.data?.message || 'Invalid verification code. Please check and try again.');
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
    const finalEmail = signup.email.trim() || (authMode === 'email' ? email.trim() : '');
    if (!finalEmail || !finalEmail.includes('@')) {
      setError('Please enter a valid College Email ID');
      return;
    }

    const finalPhone = signup.phoneNumber.replace(/\D/g, '').slice(-10) || (authMode === 'phone' ? phone.replace(/\D/g, '').slice(-10) : '9876543210');

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/api/auth/student/signup', {
        ...signup,
        email: finalEmail,
        phoneNumber: finalPhone,
      });

      const sId = res.data?.student?.id || `student-${finalPhone || 'user'}`;
      localStorage.setItem('userId', sId);
      localStorage.setItem('userName', signup.fullName.trim());
      localStorage.setItem('userPhone', finalPhone);
      localStorage.setItem('userCollege', (signup.collegeName || 'Campus').trim());
      localStorage.setItem('userHostel', signup.hostelName.trim());
      localStorage.setItem('userRoom', signup.roomNumber.trim());
      localStorage.setItem('userEmail', finalEmail);
      router.push('/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    localStorage.setItem('userId', 'student-demo-1');
    localStorage.setItem('userPhone', '9876543210');
    localStorage.setItem('userName', 'Aarav Sharma');
    localStorage.setItem('userHostel', 'Tagore Hostel Block A');
    localStorage.setItem('userRoom', '304');
    localStorage.setItem('userCollege', 'Campus Institute');
    localStorage.setItem('userEmail', 'aarav.sharma@campus.edu');
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
            <span className={`h-1.5 rounded-full transition-all ${step === 'input' ? 'w-6 bg-orange-600' : 'w-2 bg-gray-200'}`}></span>
            <span className={`h-1.5 rounded-full transition-all ${step === 'otp' ? 'w-6 bg-orange-600' : 'w-2 bg-gray-200'}`}></span>
            <span className={`h-1.5 rounded-full transition-all ${step === 'signup' ? 'w-6 bg-orange-600' : 'w-2 bg-gray-200'}`}></span>
          </div>
        </div>

        {/* STEP 1: AUTH METHOD SELECTION & INPUT */}
        {step === 'input' && (
          <div className="space-y-4">
            {/* Mode Switcher */}
            <div className="flex bg-gray-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('email');
                  setError('');
                }}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  authMode === 'email'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <span>✉️ Email OTP</span>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded-full font-bold">100% Free</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('phone');
                  setError('');
                }}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  authMode === 'phone'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <span>📱 Mobile Number</span>
              </button>
            </div>

            {authMode === 'email' ? (
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-1.5">
                  Student Email ID
                </label>
                <div className="flex items-center rounded-2xl border-2 border-gray-200 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200 transition-all overflow-hidden bg-gray-50">
                  <span className="pl-3.5 text-gray-400 text-sm">✉️</span>
                  <input
                    type="email"
                    placeholder="student@campus.edu or gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                    className="w-full px-3.5 py-3 text-sm font-bold text-gray-900 bg-transparent focus:outline-none"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5">
                  Instant free OTP sent to your mailbox (no SMS charges or carrier delay).
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-1.5">
                  Student Mobile Number
                </label>
                <div className="flex items-center rounded-2xl border-2 border-gray-200 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200 transition-all overflow-hidden bg-gray-50">
                  <div className="px-3.5 py-3 bg-gray-100 border-r border-gray-200 text-xs font-bold text-gray-700 flex items-center gap-1">
                    <span>IN</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhone(val);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                    className="w-full px-3.5 py-3 text-sm font-bold text-gray-900 bg-transparent focus:outline-none"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5">
                  We will send a 6-digit verification code to authenticate your account.
                </p>
              </div>
            )}

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-start gap-2">
                <span className="text-base leading-none">⚠️</span>
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <button
              onClick={handleSendOtp}
              disabled={loading || (authMode === 'email' ? !email.includes('@') : phone.length !== 10)}
              className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/30 transition-all transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Sending Code...' : `Send OTP to ${authMode === 'email' ? 'Email' : 'Mobile'} ➔`}
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

        {/* STEP 2: OTP VERIFICATION */}
        {step === 'otp' && (
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3.5 text-center">
              <span className="text-[11px] font-bold text-orange-950">
                Code sent to <strong>{activeIdentifier}</strong>
              </span>
              <p className="text-[10px] text-orange-700 mt-0.5">
                (Test code: <strong>123456</strong> works instantly for quick testing)
              </p>
              <button
                onClick={() => {
                  setStep('input');
                  setError('');
                  setSuccessMsg('');
                }}
                className="block mx-auto text-[11px] font-black text-orange-600 underline mt-1"
              >
                Change {authMode === 'email' ? 'Email' : 'Number'}
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
                  Resend Verification Code
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
              {loading ? 'Verifying...' : 'Verify OTP & Enter CampusBite ➔'}
            </button>
          </div>
        )}

        {/* STEP 3: REGISTRATION PROFILE */}
        {step === 'signup' && (
          <div className="space-y-3.5">
            <div className="border-b pb-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold mb-1.5">
                <span>✓ Verified:</span>
                <span>{activeIdentifier}</span>
              </div>
              <h2 className="text-base font-black text-gray-900">Student Profile Setup</h2>
              <p className="text-xs text-gray-500">Set up your delivery hostel for scheduled slots</p>
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

            {authMode !== 'email' && (
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">College Email ID *</label>
                <input
                  type="email"
                  value={signup.email}
                  onChange={(e) => setSignup({ ...signup, email: e.target.value })}
                  placeholder="your.name@college.edu"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}

            {authMode !== 'phone' && (
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={signup.phoneNumber}
                  onChange={(e) => setSignup({ ...signup, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  placeholder="10-digit mobile number"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}

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
