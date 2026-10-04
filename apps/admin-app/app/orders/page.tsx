'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface OrderItem {
  name?: string;
  itemName?: string;
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
  studentName?: string;
  studentPhone?: string;
  hostelName?: string;
  roomNumber?: string;
  restaurantName?: string;
  items?: OrderItem[];
  order_items?: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://campusbite-amber.vercel.app',
  });

  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => {
      loadOrders(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async (isPolling = false) => {
    if (!isPolling) setLoading(true);
    let fetched = false;
    let list: Order[] = [];

    try {
      const res = await api.get('/api/orders');
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        list = res.data.data;
        fetched = true;
      }
    } catch (e) {
      // API fallback
    }

    if (!fetched && typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('cb_orders');
        if (local) {
          list = JSON.parse(local);
        } else {
          const sample: Order[] = [
            {
              id: 'ord-301',
              orderNumber: 'CB-9412',
              totalAmount: 200,
              orderStatus: 'ORDER_PLACED',
              placedAt: new Date().toISOString(),
              deliverySlot: 'Evening Slot 1 (6:00 PM – 7:00 PM)',
              studentName: 'Rahul Sharma',
              studentPhone: '9876543210',
              hostelName: 'Tagore Hostel Block A',
              roomNumber: '304',
              restaurantName: 'North Campus Central Canteen',
              items: [{ name: 'Paneer Butter Masala Combo', quantity: 1, price: 140 }, { name: 'Cold Coffee', quantity: 1, price: 60 }],
            },
            {
              id: 'ord-302',
              orderNumber: 'CB-9413',
              totalAmount: 320,
              orderStatus: 'PREPARING',
              placedAt: new Date(Date.now() - 15 * 60000).toISOString(),
              deliverySlot: 'Evening Slot 1 (6:00 PM – 7:00 PM)',
              studentName: 'Priya Verma',
              studentPhone: '9876543211',
              hostelName: 'Gargi Hostel Block C',
              roomNumber: '112',
              restaurantName: 'South Mess & Food Court',
              items: [{ name: 'Chicken Biryani Bowl', quantity: 2, price: 160 }],
            },
          ];
          list = sample;
        }
      } catch {}
    }

    setOrders(list);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cb_orders', JSON.stringify(list));
    }
    if (!isPolling) setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, orderStatus: newStatus, order_status: newStatus } : o
    );
    setOrders(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cb_orders', JSON.stringify(updated));
    }
    try {
      await api.patch(`/api/orders/${orderId}/status`, { orderStatus: newStatus });
    } catch {}
  };

  const filteredOrders = orders.filter((ord) => {
    let status = String(ord.orderStatus || ord.order_status || 'ORDER_PLACED').toUpperCase();
    if (status === 'PLACED') status = 'ORDER_PLACED';

    if (filterStatus !== 'ALL') {
      let f = filterStatus.toUpperCase();
      if (f === 'PLACED') f = 'ORDER_PLACED';
      if (status !== f) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const num = String(ord.orderNumber || ord.order_number || ord.id).toLowerCase();
      const name = String(ord.studentName || '').toLowerCase();
      const phone = String(ord.studentPhone || '').toLowerCase();
      const hostel = String(ord.hostelName || '').toLowerCase();
      if (!num.includes(q) && !name.includes(q) && !phone.includes(q) && !hostel.includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Top Header */}
      <div className="bg-white shadow-sm p-4 border-b flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CampusBite Admin</h1>
          <p className="text-sm text-gray-600">All Orders Management</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b p-3">
        <div className="flex gap-2 overflow-x-auto max-w-7xl mx-auto">
          <Link href="/dashboard" className="px-4 py-2 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-700">
            Dashboard
          </Link>
          <Link href="/orders" className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold">
            Orders ({orders.length})
          </Link>
          <Link href="/orders/uncollected" className="px-4 py-2 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-700">
            Uncollected Hub
          </Link>
          <Link href="/restaurants" className="px-4 py-2 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-700">
            Restaurants
          </Link>
          <Link href="/config" className="px-4 py-2 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-700">
            Config & Fees
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-4 rounded-2xl border shadow-sm">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by order #, student name, phone, hostel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {['ALL', 'ORDER_PLACED', 'PREPARING', 'READY_FOR_DELIVERY', 'DELIVERED', 'UNCOLLECTED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  filterStatus === st ? 'bg-orange-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-3xl p-6 border shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="font-bold text-base text-gray-900">Orders Stream ({filteredOrders.length})</h2>
            <button onClick={() => loadOrders(false)} className="text-xs text-orange-600 font-bold hover:underline">
              🔄 Refresh List
            </button>
          </div>

          {loading ? (
            <p className="py-8 text-center text-xs text-gray-500">Loading orders...</p>
          ) : filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-xs">No orders matching current filter</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredOrders.map((order) => {
                const num = order.orderNumber || order.order_number || order.id;
                const status = order.orderStatus || order.order_status || 'ORDER_PLACED';
                const total = order.totalAmount ?? order.total_amount ?? 0;
                const slot = order.deliverySlot || 'Scheduled Slot';
                const itemsList = order.items || order.order_items || [];

                return (
                  <div key={order.id} className="py-4 space-y-3">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400">ORDER NO.</span>
                        <h3 className="font-black text-base text-gray-900">#{num}</h3>
                        <p className="text-xs text-orange-600 font-semibold mt-0.5">⏱ {slot}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            status === 'DELIVERED'
                              ? 'bg-green-100 text-green-800'
                              : status === 'UNCOLLECTED'
                              ? 'bg-red-100 text-red-800'
                              : status === 'CANCELLED'
                              ? 'bg-gray-200 text-gray-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {status.replace(/_/g, ' ')}
                        </span>

                        <select
                          value={status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="text-xs font-bold border border-gray-300 rounded-xl px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="ORDER_PLACED">Order Placed</option>
                          <option value="RESTAURANT_ACCEPTED">Accepted</option>
                          <option value="PREPARING">Preparing</option>
                          <option value="READY_FOR_DELIVERY">Ready for Dispatch</option>
                          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                          <option value="ARRIVED">Arrived at Hostel</option>
                          <option value="DELIVERED">Delivered ✓</option>
                          <option value="UNCOLLECTED">Uncollected ⚠️</option>
                          <option value="CANCELLED">Cancelled ✕</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-3.5 text-xs text-gray-700 flex flex-wrap justify-between gap-4">
                      <div className="space-y-1">
                        <p><strong>Student:</strong> {order.studentName || 'Student'} (📱 {order.studentPhone || '9876543210'})</p>
                        <p><strong>Location:</strong> {order.hostelName || 'Hostel'} (Room {order.roomNumber || '304'})</p>
                        <p><strong>Canteen:</strong> {order.restaurantName || 'North Campus Central Canteen'}</p>
                      </div>

                      <div className="space-y-1 text-right">
                        <p className="font-black text-sm text-gray-900">Total: ₹{total}</p>
                        <p className="text-[11px] text-gray-400">Placed: {new Date(order.placedAt || Date.now()).toLocaleTimeString()}</p>
                      </div>
                    </div>

                    {itemsList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {itemsList.map((itm, idx) => (
                          <span key={idx} className="bg-white border rounded-lg px-2.5 py-1 text-[11px] font-medium text-gray-700">
                            {itm.quantity}x {itm.name || itm.itemName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
