'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PartnerPrivacyPolicyPage() {
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
            <h1 className="text-base font-black text-gray-950 tracking-tight">Partner Privacy Policy</h1>
          </div>
          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Google Play Compliant
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-5 md:p-8 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-widest">
            <span>🛡️</span>
            <span>UniBite Kitchen & Partner Data Protection</span>
          </div>
          <h2 className="text-xl font-black text-gray-950">Partner Privacy Policy</h2>
          <p className="text-xs text-gray-500">
            Last Updated: October 5, 2026 • Governing kitchen merchant accounts and canteen operations.
          </p>
          <p className="text-xs text-gray-600 leading-relaxed">
            UniBite is dedicated to maintaining the highest security and data privacy standards for all partnered canteens, university vendors, and operational staff.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6 text-xs text-gray-700 leading-relaxed divide-y divide-gray-100">
          <div className="space-y-2 pt-2 first:pt-0">
            <h3 className="text-sm font-black text-gray-900">1. Information We Collect from Partners</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li><strong>Merchant Credentials:</strong> Authorized partner email, business phone number, and kitchen operating hours.</li>
              <li><strong>Menu & Inventory Data:</strong> Dish listings, category tags, veg/non-veg classifications, and live item stock toggles.</li>
              <li><strong>Order Processing Data:</strong> Preparation timestamps, dispatched batch counts, and order collection logs.</li>
            </ul>
          </div>

          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-black text-gray-900">2. Data Security & Storage</h3>
            <p>All kitchen credentials and operations logs are stored on encrypted Supabase PostgreSQL clusters with role-based access limits.</p>
          </div>

          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-black text-gray-900">3. Partner Account Deletion & Data Purge</h3>
            <p>
              Kitchen partners seeking to offboard or delete operational account data may email our administrative compliance desk at <a href="mailto:privacy@unibite.local" className="text-orange-600 font-bold underline">privacy@unibite.local</a>.
            </p>
          </div>
        </div>

        <div className="text-center space-y-2">
          <div className="flex justify-center gap-4 text-xs font-bold text-orange-600">
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <span>•</span>
            <Link href="/auth/login" className="hover:underline">Partner Login</Link>
          </div>
          <p className="text-[10px] text-gray-400">© 2026 UniBite Technologies • Partner Network</p>
        </div>
      </main>
    </div>
  );
}
