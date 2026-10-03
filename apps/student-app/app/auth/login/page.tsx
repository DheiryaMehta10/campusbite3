import { redirect } from 'next/navigation';
// FILE: apps/student-app/app/auth/login/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

type Step = 'phone' | 'otp' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

  const [signup, setSignup] = useState({
    fullName: '',
    collegeName: '',
    hostelName: '',
    email: '',
  });

  const handleSendOtp = async () => {
    if (!/^[0-9]{10}$/.test(phone)) {
      setError('Enter 10-digit phone number');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/auth/student/send-otp', { phoneNumber: phone });
      setStep('otp');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/student/verify-otp', { phoneNumber: phone, otp });
      if (res.data.isNewUser) {
        setStep('signup');
      } else {
        localStorage.setItem('userId', res.data.userId);
        router.push('/home');
      }
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/student/signup', {
        phoneNumber: phone,
        ...signup,
      });
      localStorage.setItem('userId', res.data.student.id);
      router.push('/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-orange-600 text-center mb-2">CampusBite</h1>
        <p className="text-gray-600 text-center text-sm mb-8">Order Smart. Delivered by Slot.</p>

        {(step === 'phone' || step === 'otp') && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.slice(0, 10))}
                disabled={step === 'otp'}
                maxLength={10}
                className="w-full border rounded-lg px-4 py-2 text-lg"
              />
            </div>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-2">OTP</label>
              <input
                type="text"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                maxLength={6}
                className="w-full border rounded-lg px-4 py-2 text-lg text-center"
              />
              <p className="text-xs text-gray-500 mt-2">Sent to +91{phone}</p>
            </div>
          </div>
        )}

        {step === 'signup' && (
          <div className="space-y-4">
            <input
              placeholder="Full Name"
              value={signup.fullName}
              onChange={(e) => setSignup({ ...signup, fullName: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
            />
            <input
              placeholder="College Name"
              value={signup.collegeName}
              onChange={(e) => setSignup({ ...signup, collegeName: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
            />
            <input
              placeholder="Hostel Name"
              value={signup.hostelName}
              onChange={(e) => setSignup({ ...signup, hostelName: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
            />
            <input
              type="email"
              placeholder="Email"
              value={signup.email}
              onChange={(e) => setSignup({ ...signup, email: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>
        )}

        {error && <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm mt-4">{error}</div>}

        <button
          onClick={step === 'phone' ? handleSendOtp : step === 'otp' ? handleVerifyOtp : handleSignup}
          disabled={loading}
          className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-medium"
        >
          {loading ? 'Loading...' : step === 'phone' ? 'Send OTP' : step === 'otp' ? 'Verify OTP' : 'Complete Signup'}
        </button>

        {(step === 'otp' || step === 'signup') && (
          <button
            onClick={() => {
              setStep('phone');
              setOtp('');
              setError('');
            }}
            className="w-full mt-3 text-gray-600 text-sm hover:text-gray-800"
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}