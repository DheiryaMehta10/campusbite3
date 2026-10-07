'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminTermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0F172A] pb-24 font-sans text-slate-200">
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-sm px-4 py-3.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.back()}
              className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold hover:bg-slate-700 transition-all"
            >
              ←
            </button>
            <h1 className="text-base font-black text-white tracking-tight">Admin Terms & Guidelines</h1>
          </div>
          <span className="text-[10px] font-black text-indigo-400 bg-indigo-950/60 border border-indigo-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Admin Console
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-5 md:p-8 space-y-6">
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
            <span>📜</span>
            <span>UniBite Administrative Service Terms</span>
          </div>
          <h2 className="text-xl font-black text-white">Console Terms of Use</h2>
          <p className="text-xs text-slate-400">
            Last Updated: October 5, 2026 • Governing platform configuration and campus network operations.
          </p>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm space-y-6 text-xs text-slate-300 leading-relaxed divide-y divide-slate-800">
          <div className="space-y-2 pt-2 first:pt-0">
            <h3 className="text-sm font-black text-white">1. Authorized Operator Guidelines</h3>
            <p>Access to the administration portal is restricted to authorized campus food operations managers and campus delivery coordinators.</p>
          </div>

          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-black text-white">2. Fee Configuration & Promo Codes</h3>
            <p>Platform delivery and service fees must be configured according to institutional agreements and published student rates.</p>
          </div>
        </div>

        <div className="text-center space-y-2">
          <div className="flex justify-center gap-4 text-xs font-bold text-indigo-400">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <span>•</span>
            <Link href="/auth/login" className="hover:underline">Admin Login</Link>
          </div>
          <p className="text-[10px] text-slate-500">© 2026 UniBite Technologies • Admin Operations</p>
        </div>
      </main>
    </div>
  );
}
