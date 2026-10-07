'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PartnerTermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-gray-800">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm px-4 py-3.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.back()}
              className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold hover:bg-gray-200 transition-all"
            >
              ←
            </button>
            <h1 className="text-base font-black text-gray-950 tracking-tight">Partner Terms & Conditions</h1>
          </div>
          <span className="text-[10px] font-black text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Kitchen Partner
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-5 md:p-8 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-widest">
            <span>📜</span>
            <span>UniBite Kitchen Merchant Agreement</span>
          </div>
          <h2 className="text-xl font-black text-gray-950">Partner Service Terms</h2>
          <p className="text-xs text-gray-500">
            Last Updated: October 5, 2026 • Governing campus food preparation and order fulfillment.
          </p>
          <p className="text-xs text-gray-600 leading-relaxed">
            By operating the UniBite Kitchen POS terminal, restaurant partners agree to maintain campus food quality standards, timely wave prep, and accurate stock management.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6 text-xs text-gray-700 leading-relaxed divide-y divide-gray-100">
          <div className="space-y-2 pt-2 first:pt-0">
            <h3 className="text-sm font-black text-gray-900">1. Order Fulfillment & Wave Timelines</h3>
            <p>Partners agree to accept and prepare meals before designated wave cutoff windows to ensure prompt runner collection.</p>
          </div>

          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-black text-gray-900">2. Food Safety & Hygiene Standards</h3>
            <p>All partners must comply with relevant university health guidelines and FSSAI sanitary norms for campus dining establishments.</p>
          </div>

          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-black text-gray-900">3. Menu Pricing & Stock Accuracy</h3>
            <p>Kitchen staff are required to promptly toggle &quot;Out of Stock&quot; for sold-out dishes to avoid order cancellations.</p>
          </div>
        </div>

        <div className="text-center space-y-2">
          <div className="flex justify-center gap-4 text-xs font-bold text-orange-600">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <span>•</span>
            <Link href="/auth/login" className="hover:underline">Partner Login</Link>
          </div>
          <p className="text-[10px] text-gray-400">© 2026 UniBite Technologies • Partner Operations</p>
        </div>
      </main>
    </div>
  );
}
