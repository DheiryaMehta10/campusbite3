'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AccountDeletionPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('graduated');
  const [otherReason, setOtherReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('userEmail') || '';
      if (savedEmail) setEmail(savedEmail);
    }
  }, []);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid registered email address.');
      return;
    }

    if (!confirmed) {
      setError('Please acknowledge the irreversible deletion notice.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          reason: reason === 'other' ? otherReason : reason,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit account deletion request.');
      }

      // Purge local client storage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-gray-800 selection:bg-red-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm px-4 py-3.5">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.back()}
              className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold hover:bg-gray-200 transition-all active:scale-95"
            >
              ←
            </button>
            <h1 className="text-base font-black text-gray-950 tracking-tight">Delete Account</h1>
          </div>
          <span className="text-[10px] font-black text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Data Deletion
          </span>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-5 md:p-6 space-y-5">
        {/* Play Store Banner */}
        <div className="bg-red-500 text-white rounded-3xl p-6 shadow-lg shadow-red-500/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-100">
            <span>🛡️</span>
            <span>Google Play User Data Privacy Rights</span>
          </div>
          <h2 className="text-xl font-black">Account & Data Removal Portal</h2>
          <p className="text-xs text-red-100 leading-relaxed">
            In accordance with Google Play Store policies and global privacy standards, you have the right to permanently purge your account, identity records, and personal campus delivery addresses from our servers.
          </p>
        </div>

        {success ? (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center space-y-4">
            <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mx-auto font-black shadow-inner">
              ✓
            </div>
            <h3 className="text-lg font-black text-gray-950">Account Deletion Complete</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Your account for <strong className="text-gray-900">{email}</strong> and all associated hostel delivery data, phone numbers, and profile settings have been permanently removed from our active database.
            </p>
            <div className="pt-2">
              <Link
                href="/auth/login"
                className="inline-block w-full py-3.5 bg-gray-900 hover:bg-black text-white text-xs font-black rounded-2xl uppercase tracking-wider transition-all"
              >
                Return to Login Screen
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Information Card */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">
                What data will be permanently deleted:
              </h3>
              <ul className="text-xs text-gray-600 space-y-2 list-disc pl-5">
                <li><strong>Identity & Login:</strong> Student Name, College Email ID, Mobile Phone Number.</li>
                <li><strong>Hostel Delivery Information:</strong> College campus name, Hostel block, and Room number.</li>
                <li><strong>Device Tokens & Saved Carts:</strong> Active session tokens and cached meal selections.</li>
              </ul>
              <p className="text-[11px] text-gray-400 pt-1">
                * Note: Historical financial transaction logs for fulfilled meals may be retained strictly for canteen reconciliation and tax compliance as mandated by law.
              </p>
            </div>

            {/* Deletion Form */}
            <form onSubmit={handleDelete} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700 flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-gray-700 uppercase tracking-wider mb-1">
                  Registered Student Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@campus.edu"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-red-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-700 uppercase tracking-wider mb-1">
                  Reason for leaving (Optional)
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:bg-white focus:border-red-500 outline-none transition-all"
                >
                  <option value="graduated">Graduated / Completed Studies</option>
                  <option value="transferred">Moved out of Hostel / Campus</option>
                  <option value="notifications">Too many notifications</option>
                  <option value="privacy">Privacy / Data concerns</option>
                  <option value="other">Other reason</option>
                </select>
              </div>

              {reason === 'other' && (
                <div>
                  <textarea
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="Please tell us how we can improve..."
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-red-500 outline-none transition-all"
                  />
                </div>
              )}

              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <span className="text-[11px] font-bold text-gray-700 leading-snug">
                    I understand that deleting my account is permanent and cannot be undone. All my profile details and stored delivery addresses will be wiped.
                  </span>
                </label>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={loading || !confirmed}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs rounded-2xl uppercase tracking-wider shadow-md shadow-red-500/20 active:scale-95 transition-all"
                >
                  {loading ? 'Processing Deletion...' : 'Permanently Delete My Account'}
                </button>

                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl uppercase tracking-wider transition-all"
                >
                  Cancel & Keep Account
                </button>
              </div>
            </form>
          </>
        )}

        {/* Footer Links */}
        <div className="text-center pt-2 space-y-2">
          <div className="flex justify-center gap-4 text-xs font-bold text-gray-500">
            <Link href="/privacy" className="hover:underline hover:text-orange-600">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:underline hover:text-orange-600">Terms of Service</Link>
            <span>•</span>
            <Link href="/home" className="hover:underline hover:text-orange-600">Home</Link>
          </div>
          <p className="text-[10px] text-gray-400">© 2026 CampusBite Technologies • Google Play Compliance</p>
        </div>
      </main>
    </div>
  );
}
