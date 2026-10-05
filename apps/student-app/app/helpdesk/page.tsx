'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  actionText?: string;
  actionHref?: string;
}

const FAQS: FAQ[] = [
  {
    id: '1',
    category: 'Delivery',
    question: 'How do scheduled batch delivery waves work?',
    answer:
      'CampusBite bundles orders into specific campus waves (Evening 6-7 PM, 7-8 PM, and Night Canteen 9:30-10:30 PM) to ensure meals arrive piping hot at your hostel drop-off point with zero delivery fees.',
    actionText: 'View Active Orders',
    actionHref: '/orders',
  },
  {
    id: '2',
    category: 'Orders',
    question: 'Can I cancel my order or change items?',
    answer:
      'Orders can only be cancelled before the canteen kitchen marks them as "Cooking". Once preparation starts, perishable food cancellation is locked in accordance with campus canteen policies.',
    actionText: 'Check Order Status',
    actionHref: '/orders',
  },
  {
    id: '3',
    category: 'Address',
    question: 'How do I change my hostel room or drop-off location?',
    answer:
      'You can update your default Hostel and Room Number anytime from your Profile. If you have an active order already en route, please contact the runner hotline immediately below.',
    actionText: 'Update Profile Address',
    actionHref: '/profile',
  },
  {
    id: '4',
    category: 'Refunds',
    question: 'What if an item is out of stock or missing?',
    answer:
      'If a kitchen runs out of a specific dish, the item cost will be credited or refunded immediately. For missing items upon collection, report it below for an instant canteen voucher.',
  },
];

export default function HelpdeskPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Student');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userHostel, setUserHostel] = useState('');
  const [userRoom, setUserRoom] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaq, setSelectedFaq] = useState<string | null>(null);

  // Ticket Form
  const [issueType, setIssueType] = useState('order_delay');
  const [orderRef, setOrderRef] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{
    id: string;
    type: string;
    message: string;
    createdAt: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserName(localStorage.getItem('userName') || 'Student');
      setUserEmail(localStorage.getItem('userEmail') || '');
      setUserPhone(localStorage.getItem('userPhone') || '');
      setUserHostel(localStorage.getItem('userHostel') || 'Hostel Block');
      setUserRoom(localStorage.getItem('userRoom') || 'Room');
    }
  }, []);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage.trim()) return;

    setTicketSubmitting(true);
    setTimeout(() => {
      const newTicketId = `CB-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedTicket({
        id: newTicketId,
        type: issueType,
        message: ticketMessage,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      setTicketSubmitting(false);
      setTicketMessage('');
      setOrderRef('');
    }, 600);
  };

  const filteredFaqs = FAQS.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 font-sans selection:bg-orange-500 selection:text-white">
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm px-4 py-3.5">
        <div className="max-w-md md:max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.back()}
              className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold hover:bg-gray-200 transition-all active:scale-95"
            >
              ←
            </button>
            <div>
              <h1 className="text-base font-black text-gray-950 tracking-tight">Campus Helpdesk</h1>
              <p className="text-[10px] text-gray-400 font-bold">24/7 Student Delivery Support</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Desk Online
          </span>
        </div>
      </header>

      <main className="max-w-md md:max-w-2xl mx-auto p-4 space-y-4">
        {/* 2. HERO SUPPORT BANNER */}
        <div className="bg-gradient-to-tr from-slate-900 via-orange-950 to-orange-600 rounded-3xl p-5 text-white shadow-xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <span className="text-[10px] font-black text-orange-300 uppercase tracking-widest bg-orange-900/60 px-2 py-0.5 rounded-md border border-orange-500/30">
                Priority Campus Assistance
              </span>
              <h2 className="text-lg font-black tracking-tight mt-1">
                Hi {userName.split(' ')[0]} 👋 Need help with an order?
              </h2>
              <p className="text-xs text-orange-100/90 font-medium">
                Our hostel runners and canteen dispatch managers are standing by.
              </p>
            </div>
            <div className="text-3xl">🛟</div>
          </div>

          {/* Quick Search */}
          <div className="relative z-10 pt-1">
            <input
              type="text"
              placeholder="Search help topics (e.g. delay, slot, refund)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl text-xs font-bold text-white placeholder:text-orange-200 focus:bg-white focus:text-gray-900 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* 3. DIRECT CONTACT CHANNELS */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Channel 1: Phone Hotline */}
          <a
            href="tel:+919876543210"
            className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm flex flex-col items-center text-center gap-1.5 hover:border-orange-500 transition-all active:scale-95 group"
          >
            <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
              📞
            </div>
            <span className="text-xs font-black text-gray-900">Call Desk</span>
            <span className="text-[9px] font-bold text-gray-400">Direct Runner</span>
          </a>

          {/* Channel 2: WhatsApp Chat */}
          <a
            href="https://wa.me/919876543210?text=Hi%20CampusBite%20Support,%20I%20need%20help%20with%20my%20order"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm flex flex-col items-center text-center gap-1.5 hover:border-emerald-500 transition-all active:scale-95 group"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
              💬
            </div>
            <span className="text-xs font-black text-gray-900">WhatsApp</span>
            <span className="text-[9px] font-bold text-gray-400">Fast Response</span>
          </a>

          {/* Channel 3: Email Ticket */}
          <a
            href={`mailto:support@campusbite.local?subject=CampusBite%20Help%20Request%20(${userEmail})`}
            className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm flex flex-col items-center text-center gap-1.5 hover:border-indigo-500 transition-all active:scale-95 group"
          >
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
              ✉️
            </div>
            <span className="text-xs font-black text-gray-900">Email Us</span>
            <span className="text-[9px] font-bold text-gray-400">Official Ticket</span>
          </a>
        </div>

        {/* 4. ACTIVE SUPPORT TICKET STATUS (IF SUBMITTED) */}
        {submittedTicket && (
          <div className="bg-emerald-500 text-white rounded-3xl p-5 shadow-lg shadow-emerald-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-700/60 px-2 py-0.5 rounded">
                Ticket Created #{submittedTicket.id}
              </span>
              <span className="text-[10px] font-bold text-emerald-100">{submittedTicket.createdAt}</span>
            </div>
            <h3 className="text-sm font-black">Support Ticket Assigned to Runner Desk</h3>
            <p className="text-xs text-emerald-100 leading-snug">
              &quot;{submittedTicket.message}&quot;
            </p>
            <div className="pt-1 flex items-center justify-between text-[11px] font-bold text-emerald-100 border-t border-emerald-400/40">
              <span>Status: In Review by Campus Coordinator</span>
              <span className="underline">ETA &lt; 5 mins</span>
            </div>
          </div>
        )}

        {/* 5. SUBMIT AN IN-APP SUPPORT TICKET */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                <span>📝</span>
                <span>Raise an Instant Support Request</span>
              </h3>
              <p className="text-[11px] text-gray-400">Directly alerts campus canteen and runner lead</p>
            </div>
          </div>

          <form onSubmit={handleCreateTicket} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                Select Issue Category
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-orange-500 outline-none transition-all"
              >
                <option value="order_delay">🛵 Batch Wave Delay / Order Tracking</option>
                <option value="missing_item">🍲 Missing Dish / Wrong Item Delivered</option>
                <option value="wrong_address">📍 Change Hostel Block or Room Number</option>
                <option value="payment_refund">💳 Payment / UPI Refund Assistance</option>
                <option value="other">💬 Other Food Quality / General Feedback</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                Order Reference / ID (Optional)
              </label>
              <input
                type="text"
                value={orderRef}
                onChange={(e) => setOrderRef(e.target.value)}
                placeholder="e.g. #ORD-1049 (leave blank for general query)"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-orange-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                Describe the Issue *
              </label>
              <textarea
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                rows={3}
                placeholder="Describe what happened so we can resolve it immediately..."
                required
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-orange-500 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={ticketSubmitting || !ticketMessage.trim()}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>{ticketSubmitting ? 'Submitting Ticket...' : 'Submit Support Request ➔'}</span>
            </button>
          </form>
        </div>

        {/* 6. INSTANT FAQ ACCORDION */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
            <span>❓</span>
            <span>Frequently Asked Questions</span>
          </h3>

          <div className="space-y-2 text-xs">
            {filteredFaqs.map((faq) => {
              const isOpen = selectedFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`border rounded-2xl transition-all overflow-hidden ${
                    isOpen ? 'border-orange-300 bg-orange-50/30' : 'border-gray-100 bg-gray-50/50'
                  }`}
                >
                  <button
                    onClick={() => setSelectedFaq(isOpen ? null : faq.id)}
                    className="w-full p-3.5 flex items-center justify-between text-left font-bold text-gray-900 hover:text-orange-600 gap-2"
                  >
                    <span>{faq.question}</span>
                    <span className="text-gray-400 font-black text-sm shrink-0">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-3.5 pb-3.5 space-y-2.5 text-xs text-gray-600 border-t border-gray-100/80 pt-2">
                      <p>{faq.answer}</p>
                      {faq.actionText && faq.actionHref && (
                        <Link
                          href={faq.actionHref}
                          className="inline-block font-black text-orange-600 text-[11px] underline"
                        >
                          {faq.actionText} ➔
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 7. PLAY STORE LEGAL LINKS */}
        <div className="text-center pt-2 space-y-2">
          <div className="flex justify-center gap-4 text-xs font-bold text-gray-400">
            <Link href="/privacy" className="hover:text-orange-600 hover:underline">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-orange-600 hover:underline">Terms of Service</Link>
            <span>•</span>
            <Link href="/account/delete" className="hover:text-red-600 hover:underline">Delete Account</Link>
          </div>
          <p className="text-[10px] text-gray-400">© 2026 CampusBite Technologies • Helpdesk Support</p>
        </div>
      </main>

      {/* 8. BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 py-2">
        <div className="max-w-md md:max-w-2xl mx-auto px-6 flex justify-around items-center">
          <Link href="/home" className="flex flex-col items-center text-gray-400 hover:text-gray-900 font-bold text-[10px] gap-0.5">
            <span className="text-lg">🍔</span>
            <span>Explore</span>
          </Link>

          <Link href="/orders" className="flex flex-col items-center text-gray-400 hover:text-gray-900 font-bold text-[10px] gap-0.5">
            <span className="text-lg">📜</span>
            <span>Orders</span>
          </Link>

          <Link href="/profile" className="flex flex-col items-center text-gray-400 hover:text-gray-900 font-bold text-[10px] gap-0.5">
            <span className="text-lg">👤</span>
            <span>Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
