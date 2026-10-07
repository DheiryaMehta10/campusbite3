'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
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
            <h1 className="text-base font-black text-gray-950 tracking-tight">Privacy Policy</h1>
          </div>
          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Google Play Compliant
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-5 md:p-8 space-y-6">
        {/* Policy Intro Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-widest">
            <span>🛡️</span>
            <span>UniBite Data Protection Policy</span>
          </div>
          <h2 className="text-xl font-black text-gray-950">Privacy & Personal Data Guidelines</h2>
          <p className="text-xs text-gray-500">
            Last Updated: October 5, 2026 • Effective for all UniBite applications (Student, Kitchen Partner, Admin).
          </p>
          <p className="text-xs text-gray-600 leading-relaxed">
            UniBite (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy and ensuring transparency in how your information is collected, used, and safeguarded during campus food ordering and batch hostel delivery operations.
          </p>
        </div>

        {/* Sections */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6 text-xs text-gray-700 leading-relaxed divide-y divide-gray-100">
          {/* Section 1 */}
          <div className="space-y-2 pt-2 first:pt-0">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
              <span>1.</span> Information We Collect
            </h3>
            <p>We only collect information necessary to facilitate scheduled food delivery within college campuses:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li><strong>Student Profile Data:</strong> Full Name, College Email ID, and Mobile Phone Number for OTP authentication and delivery communication.</li>
              <li><strong>Campus Delivery Address:</strong> College Name, Hostel Name / Block, and Room Number for batch room drop-offs.</li>
              <li><strong>Order & Transaction Data:</strong> Items ordered, selected scheduled delivery slot, cooking instructions, payment method (COD / UPI QR), and bill total.</li>
              <li><strong>Device & Technical Telemetry:</strong> Log timestamps, IP address, and browser headers required for fraud prevention and service uptime.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
              <span>2.</span> How We Use Your Information
            </h3>
            <p>Your information is used strictly for:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Generating and sending one-time verification passwords (OTP) via Email SMTP to secure your account.</li>
              <li>Transmitting order line-items to campus canteens and kitchen partners for preparation.</li>
              <li>Coordinating batch delivery slot runners to deliver meals directly to designated hostel drop-off points.</li>
              <li>Maintaining live order tracking and order history for student support.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
              <span>3.</span> Third-Party Service Providers
            </h3>
            <p>
              We do not sell, rent, or trade your personal data. We utilize trusted cloud infrastructure providers bound by strict confidentiality:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li><strong>Supabase (PostgreSQL Cloud):</strong> Encrypted database storage for orders and profiles.</li>
              <li><strong>Vercel Cloud Hosting:</strong> Secure, globally distributed application servers.</li>
              <li><strong>Gmail SMTP Service:</strong> Secure transmission of authentication OTP emails.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
              <span>4.</span> Mandatory Account & Data Deletion (Google Play Requirement)
            </h3>
            <p>
              In full compliance with Google Play Store User Data Policies, students and partners retain the right to permanently delete their account and associated personal data at any time:
            </p>
            <div className="p-3.5 bg-orange-50/80 border border-orange-200 rounded-2xl space-y-1.5">
              <p className="font-bold text-orange-950">How to request data deletion:</p>
              <p className="text-orange-900">
                1. Navigate to <strong>Student Profile ➔ Delete Account</strong> inside the app.
              </p>
              <p className="text-orange-900">
                2. Or visit our public deletion portal at <Link href="/account/delete" className="font-bold underline text-orange-700">/account/delete</Link>.
              </p>
              <p className="text-orange-900">
                3. Or email <a href="mailto:privacy@unibite.local" className="font-bold underline text-orange-700">privacy@unibite.local</a> with your registered email ID.
              </p>
            </div>
            <p className="text-[11px] text-gray-500">
              Upon request, all student profile details, phone numbers, and delivery addresses will be permanently purged from our database within 48 hours.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
              <span>5.</span> Security & Encryption
            </h3>
            <p>
              All traffic between your device and UniBite is encrypted using industry-standard TLS 1.3 encryption. Backend database access is protected by service-role authentication keys and row-level security.
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
              <span>6.</span> Grievance Officer & Contact Information
            </h3>
            <p>
              If you have any questions regarding this Privacy Policy or wish to exercise your data protection rights, please contact our designated Grievance Officer:
            </p>
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-0.5">
              <p className="font-bold text-gray-900">UniBite Privacy & Compliance Desk</p>
              <p className="text-gray-600">Email: <a href="mailto:privacy@unibite.local" className="text-orange-600 font-bold">privacy@unibite.local</a></p>
              <p className="text-gray-600">Campus Delivery Operations Office, North Campus Quadrangle</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="text-center space-y-2">
          <div className="flex justify-center gap-4 text-xs font-bold text-orange-600">
            <Link href="/terms" className="hover:underline">Terms & Conditions</Link>
            <span>•</span>
            <Link href="/account/delete" className="hover:underline">Data Deletion</Link>
            <span>•</span>
            <Link href="/home" className="hover:underline">Return to App</Link>
          </div>
          <p className="text-[10px] text-gray-400">© 2026 UniBite Technologies. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}
