'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

interface OrderItem {
  id?: string;
  name?: string;
  itemName?: string;
  item_name?: string;
  price?: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber?: string;
  order_number?: string;
  totalAmount?: number;
  total_amount?: number;
  orderStatus?: string;
  order_status?: string;
  placedAt?: string;
  placed_at?: string;
  deliverySlot?: string;
  delivery_slot?: { name: string };
  hostelName?: string;
  hostel_name?: string;
  roomNumber?: string;
  room_number?: string;
  items?: OrderItem[];
  order_items?: OrderItem[];
  restaurantName?: string;
}

const ORDER_STEPS = [
  { key: 'ORDER_PLACED', label: 'Order Placed', desc: 'Received by kitchen', icon: '📝' },
  { key: 'RESTAURANT_ACCEPTED', label: 'Accepted', desc: 'Canteen accepted', icon: '👨‍🍳' },
  { key: 'PREPARING', label: 'Cooking', desc: 'Fresh meal in preparation', icon: '🍳' },
  { key: 'READY_FOR_DELIVERY', label: 'Ready', desc: 'Packed for slot dispatch', icon: '📦' },
  { key: 'OUT_FOR_DELIVERY', label: 'Dispatched', desc: 'Runner en route to hostel', icon: '🛵' },
  { key: 'ARRIVED', label: 'Arrived', desc: 'At hostel pickup point', icon: '📍' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Order completed', icon: '🎉' },
];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  const api = axios.create({ baseURL: '' });

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async (isPolling = false) => {
    if (!isPolling) setLoading(true);
    let apiOrders: Order[] = [];
    try {
      const res = await api.get('/api/orders');
      if (res.data?.data && Array.isArray(res.data.data)) {
        apiOrders = res.data.data;
      }
    } catch (e) {
      try {
        const fallbackRes = await axios.get('https://student-app-xi-bice.vercel.app/api/orders');
        if (fallbackRes.data?.data && Array.isArray(fallbackRes.data.data)) {
          apiOrders = fallbackRes.data.data;
        }
      } catch {}
    }

    let localOrders: Order[] = [];
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('cb_orders');
        if (local) localOrders = JSON.parse(local);
      } catch (e) {}
    }

    const mergedMap = new Map<string, Order>();
    for (const ord of localOrders) {
      if (ord.id) mergedMap.set(ord.id, ord);
      if (ord.orderNumber) mergedMap.set(ord.orderNumber, ord);
    }
    for (const ord of apiOrders) {
      if (ord.id) mergedMap.set(ord.id, ord);
      if (ord.orderNumber) mergedMap.set(ord.orderNumber, ord);
    }

    const uniqueList = Array.from(new Set(Array.from(mergedMap.values())));
    uniqueList.sort((a, b) => new Date(b.placedAt || b.placed_at || 0).getTime() - new Date(a.placedAt || a.placed_at || 0).getTime());

    setOrders(uniqueList);
    if (!isPolling) setLoading(false);
  };

  const getStepIndex = (status?: string) => {
    const s = String(status || 'ORDER_PLACED').toUpperCase();
    if (s === 'PLACED' || s === 'ORDER_PLACED') return 0;
    if (s === 'RESTAURANT_ACCEPTED' || s === 'ACCEPTED') return 1;
    if (s === 'PREPARING') return 2;
    if (s === 'READY_FOR_DELIVERY' || s === 'READY') return 3;
    if (s === 'OUT_FOR_DELIVERY') return 4;
    if (s === 'ARRIVED') return 5;
    if (s === 'DELIVERED') return 6;
    return 0;
  };

  const activeOrders = orders.filter((o) => {
    const s = String(o.orderStatus || o.order_status || '').toUpperCase();
    return s !== 'DELIVERED' && s !== 'CANCELLED';
  });

  const pastOrders = orders.filter((o) => {
    const s = String(o.orderStatus || o.order_status || '').toUpperCase();
    return s === 'DELIVERED' || s === 'CANCELLED';
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 font-sans selection:bg-orange-500 selection:text-white">
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm px-4 py-3">
        <div className="max-w-md md:max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.push('/home')}
              className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold hover:bg-gray-200 transition-all active:scale-95"
            >
              ←
            </button>
            <h1 className="text-base font-black text-gray-900 tracking-tight">Your Orders</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/helpdesk"
              className="text-[10px] font-black text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-orange-100 transition-all"
            >
              <span>💬</span>
              <span>Helpdesk</span>
            </Link>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
              <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Live Sync</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. TABS */}
      <div className="max-w-md md:max-w-2xl mx-auto p-4 space-y-4">
        <div className="bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm flex gap-1">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'active'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>⚡ Active Orders</span>
            {activeOrders.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'active' ? 'bg-white text-orange-600' : 'bg-orange-100 text-orange-800'
              }`}>
                {activeOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'past'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>📜 Past History</span>
            {pastOrders.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'past' ? 'bg-white text-gray-900' : 'bg-gray-100 text-gray-700'
              }`}>
                {pastOrders.length}
              </span>
            )}
          </button>
        </div>

        {/* 3. ACTIVE ORDERS VIEW (ZOMATO LIVE TRACKING STYLE) */}
        {activeTab === 'active' && (
          <div className="space-y-4">
            {activeOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm space-y-3">
                <div className="h-14 w-14 mx-auto bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-3xl">
                  🍱
                </div>
                <h3 className="text-sm font-black text-gray-900">No active orders right now</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Browse the menu and order fresh meals delivered right to your hostel!
                </p>
                <div className="pt-2">
                  <Link
                    href="/home"
                    className="bg-orange-600 hover:bg-orange-700 text-white font-black text-xs px-5 py-2.5 rounded-2xl shadow-md inline-block uppercase tracking-wider active:scale-95 transition-all"
                  >
                    Browse Menu
                  </Link>
                </div>
              </div>
            ) : (
              activeOrders.map((order) => {
                const currentStep = getStepIndex(order.orderStatus || order.order_status);
                const items = order.items || order.order_items || [];
                const orderNum = order.orderNumber || order.order_number || 'CB-XXXX';
                const slotName = order.deliverySlot || order.delivery_slot?.name || 'Evening Slot 1 (6:00 PM – 7:00 PM)';

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl p-5 border border-orange-100 shadow-lg shadow-orange-500/5 space-y-4 relative overflow-hidden"
                  >
                    {/* Live Pulse Top Bar */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-gray-900">Order #{orderNum}</span>
                          <span className="bg-orange-100 text-orange-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-md animate-pulse">
                            ● Live Tracking
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-semibold mt-0.5">
                          {order.restaurantName || 'Campus Central Canteen'}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-black text-gray-900">
                          ₹{order.totalAmount || order.total_amount || 0}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium">COD / Paid</p>
                      </div>
                    </div>

                    {/* Scheduled Slot Badge */}
                    <div className="bg-orange-50/80 border border-orange-200/80 rounded-2xl p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🕒</span>
                        <div>
                          <p className="font-bold text-orange-950">{slotName}</p>
                          <p className="text-[10px] text-orange-700 font-medium">
                            Delivery to: {order.hostelName || order.hostel_name || 'Hostel'}, Room {order.roomNumber || order.room_number || '304'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Visual Stepper */}
                    <div className="py-2">
                      <div className="relative flex justify-between items-center">
                        {/* Connecting Line */}
                        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-gray-100 -z-0">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-green-500 transition-all duration-500"
                            style={{ width: `${(currentStep / (ORDER_STEPS.length - 1)) * 100}%` }}
                          ></div>
                        </div>

                        {ORDER_STEPS.slice(0, 4).map((step, idx) => {
                          const isDone = currentStep >= idx;
                          const isCurrent = currentStep === idx;
                          return (
                            <div key={step.key} className="flex flex-col items-center relative z-10">
                              <div
                                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                  isCurrent
                                    ? 'bg-orange-600 text-white ring-4 ring-orange-200 scale-110 shadow-md'
                                    : isDone
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                }`}
                              >
                                {isDone ? step.icon : idx + 1}
                              </div>
                              <span className="text-[10px] font-bold text-gray-700 mt-1.5 text-center max-w-[65px] leading-tight">
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Ordered Items Accordion */}
                    <div className="border-t border-gray-100 pt-3 space-y-1.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Items Breakdown
                      </p>
                      <div className="space-y-1">
                        {items.map((itm: any, i: number) => (
                          <div key={i} className="flex justify-between text-xs text-gray-700 font-medium">
                            <span>
                              {itm.quantity}x {itm.name || itm.itemName || itm.item_name || 'Food Item'}
                            </span>
                            <span className="font-bold">₹{(itm.price || 50) * itm.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 4. PAST ORDERS HISTORY VIEW */}
        {activeTab === 'past' && (
          <div className="space-y-3">
            {pastOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm text-xs text-gray-500">
                No past delivered orders yet.
              </div>
            ) : (
              pastOrders.map((order) => {
                const orderNum = order.orderNumber || order.order_number || 'CB-XXXX';
                const items = order.items || order.order_items || [];
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-2.5"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-black text-gray-900">Order #{orderNum}</h4>
                        <p className="text-[10px] text-gray-400 font-medium">
                          {order.placedAt ? new Date(order.placedAt).toLocaleDateString() : 'Delivered'} • {order.restaurantName || 'Campus Central Canteen'}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-green-100 text-green-800 uppercase">
                        ✓ Delivered
                      </span>
                    </div>

                    <div className="text-xs text-gray-600">
                      {items.map((it: any) => `${it.quantity}x ${it.name || it.item_name || 'Item'}`).join(', ')}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-xs">
                      <span className="font-black text-gray-900">
                        Total: ₹{order.totalAmount || order.total_amount || 0}
                      </span>
                      <Link
                        href="/home"
                        className="text-orange-600 font-bold hover:underline"
                      >
                        Reorder ➔
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 5. BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 py-2">
        <div className="max-w-md md:max-w-2xl mx-auto px-6 flex justify-around items-center">
          <Link href="/home" className="flex flex-col items-center text-gray-400 hover:text-gray-900 font-bold text-[10px] gap-0.5">
            <span className="text-lg">🍔</span>
            <span>Explore</span>
          </Link>

          <Link href="/orders" className="flex flex-col items-center text-orange-600 font-black text-[10px] gap-0.5 relative">
            <span className="text-lg">📜</span>
            <span>Orders</span>
            {activeOrders.length > 0 && (
              <span className="absolute -top-1 right-2 bg-orange-600 text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center">
                {activeOrders.length}
              </span>
            )}
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