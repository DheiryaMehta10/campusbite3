'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TermsAndConditionsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-gray-800 selection:bg-orange-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm px-4 py-3.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.back()}
              className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold hover:bg-gray-200 transition-all active:scale-95"
            >
              ←
            </button>
            <h1 className="text-base font-black text-gray-950 tracking-tight">Terms & Conditions</h1>
          </div>
          <span className="text-[10px] font-black text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Campus Rules
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-5 md:p-8 space-y-6">
        {/* Intro Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-widest">
            <span>📜</span>
            <span>CampusBite Terms of Service</span>
          </div>
          <h2 className="text-xl font-black text-gray-950">Student & Partner Service Agreement</h2>
          <p className="text-xs text-gray-500">
            Last Updated: October 5, 2026 • Governing all campus ordering and scheduled delivery slot services.
          </p>
          <p className="text-xs text-gray-600 leading-relaxed">
            By downloading, accessing, or placing an order through the CampusBite application, you agree to comply with and be bound by the following terms, conditions, and delivery guidelines.
          </p>
        </div>

        {/* Sections */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6 text-xs text-gray-700 leading-relaxed divide-y divide-gray-100">
          {/* Section 1 */}
          <div className="space-y-2 pt-2 first:pt-0">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
              <span>1.</span> User Eligibility & Account Responsibility
            </h3>
            <p>
              CampusBite services are designated specifically for active students, faculty, and authorized staff residing within or visiting the campus premises.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Users must verify their identity using a valid student email address via OTP.</li>
              <li>You agree to provide accurate Hostel Name, Block, and Room Number for scheduled batch delivery.</li>
              <li>You are responsible for all orders placed through your authenticated account.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
              <span>2.</span> Scheduled Batch Delivery Slots & Cut-off Times
            </h3>
            <p>
              To maintain food quality and eliminate campus delivery traffic, orders operate strictly on <strong>Scheduled Batch Waves</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li><strong>Evening Slot 1:</strong> 6:00 PM – 7:00 PM (Orders Cutoff at 5:45 PM).</li>
              <li><strong>Evening Slot 2:</strong> 7:00 PM – 8:00 PM (Orders Cutoff at 6:45 PM).</li>
              <li><strong>Night Canteen Slot:</strong> 9:30 PM – 10:30 PM (Orders Cutoff at 9:15 PM).</li>
            </ul>
            <p className="text-gray-500 text-[11px]">
              Orders placed after the cutoff time will be automatically scheduled for the next available wave.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
              <span>3.</span> Cancellation & Refund Policy
            </h3>
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl space-y-1.5">
              <p className="font-bold text-gray-900">Order Cancellation Rules:</p>
              <ul className="list-disc pl-4 space-y-1 text-gray-600">
                <li>Orders can be cancelled before the restaurant or kitchen marks the order as <strong>&quot;Cooking in Progress&quot;</strong>.</li>
                <li>Once the kitchen begins meal preparation, cancellations are strictly prohibited due to perishable food waste policies.</li>
              </ul>
              <p className="font-bold text-gray-900 pt-1">Refunds & Replacements:</p>
              <ul className="list-disc pl-4 space-y-1 text-gray-600">
                <li>In the event an item is unavailable or out of stock, full credit or refund will be processed immediately.</li>
                <li>In the rare case of uncollected delivery, our campus runners hold the package for up to 30 minutes at the hostel collection point before recording it in the Uncollected Hub.</li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
              <span>4.</span> Pricing, Fees & Promotional Coupons
            </h3>
            <p>
              All prices listed on CampusBite reflect actual canteen partner menus.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li><strong>Delivery Fee:</strong> Batch scheduled delivery to hostel collection points is free or subsidized by the campus partner program.</li>
              <li><strong>Platform Fee:</strong> A small technology fee (₹2 to ₹4) supports cloud server operations and live OTP delivery infrastructure.</li>
              <li><strong>Coupons:</strong> Discount codes such as <code>FIRSTBITE</code> and <code>CAMPUS50</code> are subject to fair use limits and minimum cart thresholds.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
              <span>5.</span> Food Quality, Allergens & Vendor Liability
            </h3>
            <p>
              Meals and beverages are prepared directly by licensed campus canteens and food courts.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Students with food allergies (e.g. nuts, dairy, gluten) must specify requirements in the <strong>&quot;Cooking Requests&quot;</strong> field at checkout.</li>
              <li>Canteen partners maintain full responsibility for hygiene, freshness, and regulatory FSSAI standards.</li>
            </ul>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="text-center space-y-2">
          <div className="flex justify-center gap-4 text-xs font-bold text-orange-600">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <span>•</span>
            <Link href="/account/delete" className="hover:underline">Account Deletion</Link>
            <span>•</span>
            <Link href="/home" className="hover:underline">Return to App</Link>
          </div>
          <p className="text-[10px] text-gray-400">© 2026 CampusBite Technologies. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}
