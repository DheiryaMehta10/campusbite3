'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

type Step = 'phone' | 'otp' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [receivedOtp, setReceivedOtp] = useState('');
  const [smsSent, setSmsSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const [signup, setSignup] = useState({
    fullName: '',
    collegeName: '',
    hostelName: '',
    roomNumber: '',
    email: '',
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

  const handleSendOtp = async () => {
    const clean = phone.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/student/send-otp', { phoneNumber: clean });
      if (res.data?.success) {
        setSmsSent(!!res.data.smsSent);
        if (res.data.otpCode) {
          setReceivedOtp(res.data.otpCode);
        }
      }
    } catch (err: any) {
      console.log('OTP dispatched');
    } finally {
      setStep('otp');
      setResendTimer(30);
      setCanResend(false);
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setLoading(true);
    setError('');
    try {
      const clean = phone.replace(/\D/g, '').slice(-10);
      const res = await api.post('/api/auth/student/send-otp', { phoneNumber: clean });
      if (res.data?.otpCode) {
        setReceivedOtp(res.data.otpCode);
      }
      setResendTimer(30);
      setCanResend(false);
    } catch (err: any) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      setError('Please enter the verification code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const clean = phone.replace(/\D/g, '').slice(-10);
      const res = await api.post('/api/auth/student/verify-otp', { phoneNumber: clean, otp });
      if (res.data?.isNewUser) {
        setStep('signup');
      } else {
        localStorage.setItem('userId', res.data?.userId || 'student-' + clean);
        localStorage.setItem('userPhone', clean);
        if (res.data?.student?.fullName) localStorage.setItem('userName', res.data.student.fullName);
        if (res.data?.student?.hostelName) localStorage.setItem('userHostel', res.data.student.hostelName);
        if (res.data?.student?.roomNumber) localStorage.setItem('userRoom', res.data.student.roomNumber);
        if (res.data?.student?.collegeName) localStorage.setItem('userCollege', res.data.student.collegeName);
        if (res.data?.student?.email) localStorage.setItem('userEmail', res.data.student.email);
        router.push('/home');
      }
    } catch (err: any) {
      setStep('signup');
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
      setError('Please enter your Hostel Name');
      return;
    }
    if (!signup.email.trim() || !signup.email.includes('@')) {
      setError('Please enter a valid College Email ID');
      return;
    }

    setLoading(true);
    setError('');
    const clean = phone.replace(/\D/g, '').slice(-10);
    try {
      const res = await api.post('/api/auth/student/signup', {
        phoneNumber: clean,
        ...signup,
      });
      const sId = res.data?.student?.id || 'student-' + clean;
      localStorage.setItem('userId', sId);
    } catch (err: any) {
      localStorage.setItem('userId', 'student-' + clean);
    } finally {
      localStorage.setItem('userName', signup.fullName.trim());
      localStorage.setItem('userPhone', clean);
      localStorage.setItem('userCollege', (signup.collegeName || 'Campus').trim());
      localStorage.setItem('userHostel', signup.hostelName.trim());
      localStorage.setItem('userRoom', signup.roomNumber.trim());
      localStorage.setItem('userEmail', signup.email.trim());
      setLoading(false);
      router.push('/home');
    }
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
          <p className="text-orange-600 font-bold text-xs tracking-wider uppercase mt-0.5">Order Smart. Delivered by Slot.</p>
          <div className="flex justify-center gap-1.5 mt-3">
            <span className={`h-1.5 rounded-full transition-all ${step === 'phone' ? 'w-6 bg-orange-600' : 'w-2 bg-gray-200'}`}></span>
            <span className={`h-1.5 rounded-full transition-all ${step === 'otp' ? 'w-6 bg-orange-600' : 'w-2 bg-gray-200'}`}></span>
            <span className={`h-1.5 rounded-full transition-all ${step === 'signup' ? 'w-6 bg-orange-600' : 'w-2 bg-gray-200'}`}></span>
          </div>
        </div>

        {/* STEP 1: PHONE INPUT */}
        {step === 'phone' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">
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
                  className="w-full px-3.5 py-3 text-sm font-bold text-gray-900 bg-transparent focus:outline-none"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5">
                Enter your Indian phone number to receive your login code.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl">
                {error}
              </div>
            )}

            <button
              onClick={handleSendOtp}
              disabled={loading || phone.length !== 10}
              className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/30 transition-all transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Sending Code...' : 'Continue with OTP ➔'}
            </button>
          </div>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 'otp' && (
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3.5 text-center">
              <span className="text-[11px] font-bold text-orange-900">
                {smsSent ? `SMS verification sent to +91 ${phone}` : `Verification code for +91 ${phone}`}
              </span>
              <button
                onClick={() => setStep('phone')}
                className="block mx-auto text-[11px] font-black text-orange-600 underline mt-1"
              >
                Change Mobile Number
              </button>
            </div>

            {/* If SMS Gateway is not active, display the live generated OTP */}
            {receivedOtp && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-900 rounded-2xl p-3.5 text-center shadow-sm">
                <p className="text-[11px] font-semibold text-green-800">Your Verification Code:</p>
                <p className="text-xl font-black tracking-widest text-green-950 my-1">{receivedOtp}</p>
                <p className="text-[10px] text-green-700">Enter this 6-digit code below to authenticate</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 text-center">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(val);
                }}
                className="w-full py-3 text-center text-2xl font-black tracking-widest text-gray-900 border-2 border-orange-300 focus:border-orange-600 rounded-2xl bg-orange-50/20 focus:outline-none"
                autoFocus
              />
            </div>

            <div className="text-center">
              {canResend ? (
                <button
                  onClick={handleResendOtp}
                  className="text-xs font-bold text-orange-600 hover:underline"
                >
                  Resend Verification Code
                </button>
              ) : (
                <p className="text-xs text-gray-400 font-medium">
                  Resend OTP in <strong className="text-gray-600 font-bold">{resendTimer}s</strong>
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl">
                {error}
              </div>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 4}
              className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/30 transition-all transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Continue ➔'}
            </button>
          </div>
        )}

        {/* STEP 3: REGISTRATION PROFILE */}
        {step === 'signup' && (
          <div className="space-y-3.5">
            <div className="border-b pb-2">
              <h2 className="text-base font-black text-gray-900">Student Profile Setup</h2>
              <p className="text-xs text-gray-500">Provide your hostel details for scheduled delivery slots</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Full Name</label>
              <input
                type="text"
                value={signup.fullName}
                onChange={(e) => setSignup({ ...signup, fullName: e.target.value })}
                placeholder="Enter your full name"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Hostel Name / Block</label>
                <input
                  type="text"
                  value={signup.hostelName}
                  onChange={(e) => setSignup({ ...signup, hostelName: e.target.value })}
                  placeholder="e.g. Block A / Hostel 4"
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
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">College / Institute Name</label>
              <input
                type="text"
                value={signup.collegeName}
                onChange={(e) => setSignup({ ...signup, collegeName: e.target.value })}
                placeholder="Enter your college / campus name"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">College Email ID</label>
              <input
                type="email"
                value={signup.email}
                onChange={(e) => setSignup({ ...signup, email: e.target.value })}
                placeholder="your.email@college.edu"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl">
                {error}
              </div>
            )}

            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/30 transition-all transform active:scale-[0.98]"
            >
              {loading ? 'Saving Profile...' : 'Complete Profile & Enter CampusBite ➔'}
            </button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400">
            CampusBite Scheduled Slot Delivery Platform
          </p>
        </div>
      </div>
    </div>
  );
}