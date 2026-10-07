'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface OrderItem {
  name?: string;
  itemName?: string;
  item_name?: string;
  quantity: number;
  price?: number;
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
  studentName?: string;
  student_name?: string;
  studentPhone?: string;
  student_phone?: string;
  hostelName?: string;
  hostel_name?: string;
  roomNumber?: string;
  room_number?: string;
  restaurantName?: string;
  items?: OrderItem[];
  order_items?: OrderItem[];
}

const STATUS_OPTIONS = [
  'ALL',
  'ORDER_PLACED',
  'PREPARING',
  'READY_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const api = axios.create({ baseURL: '' });

  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => {
      loadOrders(true);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async (isPolling = false) => {
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
        const local = (localStorage.getItem('ub_orders') || localStorage.getItem('cb_orders'));
        if (local) localOrders = JSON.parse(local);
      } catch {}
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
    if (typeof window !== 'undefined' && uniqueList.length > 0) {
      localStorage.setItem('ub_orders', JSON.stringify(uniqueList));
    }
    if (!isPolling) setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, orderStatus: newStatus, order_status: newStatus } : o
    );
    setOrders(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ub_orders', JSON.stringify(updated));
    }
    try {
      await api.patch(`/api/orders/${orderId}/status`, { orderStatus: newStatus });
    } catch {
      try {
        await axios.patch(`https://student-app-xi-bice.vercel.app/api/orders/${orderId}/status`, { orderStatus: newStatus });
      } catch {}
    }
  };

  const filteredOrders = orders.filter((ord) => {
    let status = String(ord.orderStatus || ord.order_status || 'ORDER_PLACED').toUpperCase();
    if (status === 'PLACED') status = 'ORDER_PLACED';

    if (filterStatus !== 'ALL') {
      let f = filterStatus.toUpperCase();
      if (status !== f) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const num = String(ord.orderNumber || ord.order_number || '').toLowerCase();
      const sName = String(ord.studentName || ord.student_name || '').toLowerCase();
      const hName = String(ord.hostelName || ord.hostel_name || '').toLowerCase();
      const rNum = String(ord.roomNumber || ord.room_number || '').toLowerCase();
      return num.includes(q) || sName.includes(q) || hName.includes(q) || rNum.includes(q);
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans selection:bg-orange-500 selection:text-white">
      {/* 1. TOP HEADER */}
      <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-xl font-black shadow-lg shadow-orange-500/20">
              📦
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight">Live Campus Orders Monitor</h1>
              <p className="text-[11px] text-slate-400">Real-Time Kitchen Status & Delivery Waves</p>
            </div>
          </div>

          <button
            onClick={() => loadOrders()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border border-slate-700"
          >
            ↻ Refresh Feed
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-slate-800 px-6 py-2.5">
          <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-7xl mx-auto">
            <Link href="/dashboard" className="px-4 py-2 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-300 whitespace-nowrap transition-colors">
              📊 Analytics Overview
            </Link>
            <Link href="/orders" className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-black whitespace-nowrap shadow-md shadow-orange-600/20">
              📦 Live Orders Feed
            </Link>
            <Link href="/orders/uncollected" className="px-4 py-2 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-300 whitespace-nowrap transition-colors">
              🚨 Uncollected Hub
            </Link>
            <Link href="/restaurants" className="px-4 py-2 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-300 whitespace-nowrap transition-colors">
              🏪 Canteen Partners
            </Link>
            <Link href="/config" className="px-4 py-2 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-300 whitespace-nowrap transition-colors">
              ⚙️ Slots & Fee Config
            </Link>
          </div>
        </div>
      </header>

      {/* 2. FILTERS & SEARCH */}
      <main className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">
        <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setFilterStatus(opt)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                  filterStatus === opt
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {opt.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search order #, student, room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:border-orange-500 outline-none"
            />
          </div>
        </div>

        {/* 3. LIVE ORDERS FEED */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-2">
            <p className="text-3xl">📦</p>
            <h3 className="text-sm font-bold text-gray-700">No matching orders found</h3>
            <p className="text-xs text-gray-400">Orders placed by students will appear in this feed automatically.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((ord) => {
              const items = ord.items || ord.order_items || [];
              const orderNum = ord.orderNumber || ord.order_number || 'CB-XXXX';
              const status = String(ord.orderStatus || ord.order_status || 'ORDER_PLACED').toUpperCase();
              const slot = ord.deliverySlot || ord.delivery_slot?.name || 'Evening Slot (6-7 PM)';

              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left Details */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-black text-gray-900">#{orderNum}</span>
                      <span className="text-xs text-gray-400 font-bold">•</span>
                      <span className="text-xs font-bold text-orange-600">
                        {ord.restaurantName || 'Campus Central Canteen'}
                      </span>
                      <span className="text-xs text-gray-400 font-bold">•</span>
                      <span className="text-[11px] font-bold text-slate-500">🕒 {slot}</span>
                    </div>

                    <div className="text-xs text-gray-600 font-medium">
                      <span className="font-bold text-gray-900">
                        👤 {ord.studentName || ord.student_name || 'Student'}
                      </span>
                      <span className="text-gray-400"> • </span>
                      <span>📍 {ord.hostelName || ord.hostel_name || 'Campus Hostel'}{ord.roomNumber || ord.room_number ? `, Room ${ord.roomNumber || ord.room_number}` : ''}</span>
                      <span className="text-gray-400"> • </span>
                      <span>📞 {ord.studentPhone || ord.student_phone ? `+91 ${ord.studentPhone || ord.student_phone}` : 'No phone'}</span>
                    </div>

                    <div className="text-xs text-slate-500 pt-0.5">
                      <span className="font-bold text-gray-700">Items: </span>
                      {items.map((it: any) => `${it.quantity}x ${it.name || it.itemName || it.item_name || 'Food Item'}`).join(', ')}
                    </div>
                  </div>

                  {/* Right Status & Controls */}
                  <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900">
                        ₹{ord.totalAmount || ord.total_amount || 0}
                      </p>
                      <p className="text-[10px] text-gray-400 font-semibold">COD</p>
                    </div>

                    <select
                      value={status}
                      onChange={(e) => updateOrderStatus(ord.id, e.target.value)}
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black text-gray-800 focus:outline-none focus:border-orange-500"
                    >
                      <option value="ORDER_PLACED">Order Placed</option>
                      <option value="PREPARING">Preparing / Cooking</option>
                      <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="UNCOLLECTED">Uncollected</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
