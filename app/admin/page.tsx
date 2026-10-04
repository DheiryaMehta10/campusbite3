'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

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
  items?: any[];
}

interface Restaurant {
  id: string;
  name: string;
  rating: number;
  status: 'open' | 'temporarily_closed';
  adminLocked: boolean;
  totalOrders: number;
}

export default function AdminPortalPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'uncollected' | 'restaurants' | 'fees'>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([
    { id: 'canteen-1', name: 'North Campus Central Canteen', rating: 4.6, status: 'open', adminLocked: false, totalOrders: 142 },
    { id: 'canteen-2', name: 'South Mess & Food Court', rating: 4.5, status: 'open', adminLocked: false, totalOrders: 98 },
    { id: 'canteen-3', name: 'Night Canteen & Snacks Hub', rating: 4.4, status: 'open', adminLocked: false, totalOrders: 74 },
    { id: 'canteen-4', name: 'Campus Chai & Fast Food Corner', rating: 4.7, status: 'open', adminLocked: false, totalOrders: 110 },
  ]);

  const [deliveryFee, setDeliveryFee] = useState(10);
  const [platformFeeTier1, setPlatformFeeTier1] = useState(2);
  const [platformFeeTier2, setPlatformFeeTier2] = useState(4);
  const [feeSaveSuccess, setFeeSaveSuccess] = useState(false);

  useEffect(() => {
    loadOrders();
    const savedDeliveryFee = localStorage.getItem('cb_delivery_fee');
    if (savedDeliveryFee) setDeliveryFee(Number(savedDeliveryFee));
  }, []);

  const loadOrders = () => {
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('cb_orders');
        if (local) {
          setOrders(JSON.parse(local));
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
            {
              id: 'ord-304',
              orderNumber: 'CB-8890',
              totalAmount: 165,
              orderStatus: 'UNCOLLECTED',
              placedAt: new Date(Date.now() - 120 * 60000).toISOString(),
              deliverySlot: 'Lunch Slot (12:00 PM – 1:00 PM)',
              studentName: 'Vikram Singh',
              studentPhone: '9876543219',
              hostelName: 'Tagore Hostel Block B',
              roomNumber: '102',
              restaurantName: 'North Campus Central Canteen',
              items: [{ name: 'Thali Special', quantity: 1, price: 150 }],
            },
          ];
          setOrders(sample);
          localStorage.setItem('cb_orders', JSON.stringify(sample));
        }
      } catch {}
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, orderStatus: newStatus, order_status: newStatus } : o
    );
    setOrders(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cb_orders', JSON.stringify(updated));
    }
  };

  const toggleRestaurantLock = (id: string) => {
    setRestaurants((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              adminLocked: !r.adminLocked,
              status: !r.adminLocked ? 'temporarily_closed' : 'open',
            }
          : r
      )
    );
  };

  const handleSaveFees = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cb_delivery_fee', String(deliveryFee));
      localStorage.setItem('cb_platform_fee_tier1', String(platformFeeTier1));
      localStorage.setItem('cb_platform_fee_tier2', String(platformFeeTier2));
    }
    setFeeSaveSuccess(true);
    setTimeout(() => setFeeSaveSuccess(false), 3000);
  };

  const uncollectedOrders = orders.filter(
    (o) => (o.orderStatus || o.order_status) === 'UNCOLLECTED'
  );
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || o.total_amount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Universal Quick Portal Switcher */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-orange-400">CampusBite System:</span>
            <Link href="/home" className="hover:text-white font-medium">📱 Student App</Link>
            <span className="text-slate-600">|</span>
            <Link href="/restaurant-portal" className="hover:text-white font-medium">🍳 Kitchen Portal</Link>
            <span className="text-slate-600">|</span>
            <Link href="/admin" className="text-orange-400 font-bold underline">⚙️ Admin Hub</Link>
          </div>
          <span className="hidden sm:inline-block bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded text-[10px] font-bold">
            Administrator Access
          </span>
        </div>
      </div>

      {/* Admin Top Header */}
      <header className="bg-white border-b shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-md">
              ⚙️
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-950">CampusBite Admin Control Center</h1>
              <p className="text-xs text-gray-500">Live Campus Delivery Fleet, Slots, Partner Management & Fee Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
              ● Fleet Operational
            </span>
            <Link
              href="/home"
              className="text-xs text-gray-700 hover:text-orange-600 font-bold border px-3.5 py-1.5 rounded-xl bg-gray-50 hover:bg-white"
            >
              ← Student View
            </Link>
          </div>
        </div>
      </header>

      {/* Admin Navigation Bar */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex overflow-x-auto px-6 py-2 gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'dashboard' ? 'bg-slate-950 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>📊 Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'orders' ? 'bg-slate-950 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>📦 All Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('uncollected')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'uncollected' ? 'bg-red-600 text-white shadow-sm' : 'text-red-700 bg-red-50 hover:bg-red-100'
            }`}
          >
            <span>⚠️ Uncollected Hub ({uncollectedOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('restaurants')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'restaurants' ? 'bg-slate-950 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>🏪 Canteens ({restaurants.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('fees')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'fees' ? 'bg-slate-950 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>💰 Fee & Slot Config</span>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* 1. DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm border-l-4 border-l-blue-600">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Orders Handled</p>
                <h3 className="text-3xl font-black text-gray-950 mt-1">{orders.length + 420}</h3>
                <p className="text-[11px] text-green-600 font-bold mt-1">↑ 14% vs last week</p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm border-l-4 border-l-emerald-600">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Slot GMV Revenue</p>
                <h3 className="text-3xl font-black text-gray-950 mt-1">₹{totalRevenue + 48200}</h3>
                <p className="text-[11px] text-emerald-600 font-bold mt-1">✓ Automated Fee Split Active</p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm border-l-4 border-l-orange-500">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Canteens</p>
                <h3 className="text-3xl font-black text-gray-950 mt-1">
                  {restaurants.filter((r) => r.status === 'open').length} / {restaurants.length}
                </h3>
                <p className="text-[11px] text-gray-500 font-medium mt-1">All Kitchen portals synchronized</p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm border-l-4 border-l-red-500">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Uncollected Packets</p>
                <h3 className="text-3xl font-black text-red-600 mt-1">{uncollectedOrders.length}</h3>
                <p className="text-[11px] text-red-700 font-medium mt-1">Pending student room pickup</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-base font-black text-gray-900">Today's Scheduled Slot Waves</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200">
                  <span className="text-[10px] font-black bg-orange-600 text-white px-2 py-0.5 rounded-full">ACTIVE WAVE</span>
                  <h4 className="font-black text-sm text-gray-900 mt-2">Evening Slot 1 (6:00 PM – 7:00 PM)</h4>
                  <p className="text-xs text-gray-600 mt-1">Cutoff: 5:50 PM • Runners Dispatched: 4</p>
                  <p className="text-xs font-bold text-orange-900 mt-2">Capacity: 38/50 Orders Booked</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-black bg-slate-700 text-white px-2 py-0.5 rounded-full">UPCOMING</span>
                  <h4 className="font-black text-sm text-gray-900 mt-2">Evening Slot 2 (7:00 PM – 8:00 PM)</h4>
                  <p className="text-xs text-gray-600 mt-1">Cutoff: 6:50 PM • Runners Dispatched: 3</p>
                  <p className="text-xs font-bold text-gray-700 mt-2">Capacity: 24/50 Orders Booked</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-black bg-slate-700 text-white px-2 py-0.5 rounded-full">UPCOMING</span>
                  <h4 className="font-black text-sm text-gray-900 mt-2">Night Canteen Slot (9:30 PM – 10:30 PM)</h4>
                  <p className="text-xs text-gray-600 mt-1">Cutoff: 9:20 PM • Runners Dispatched: 2</p>
                  <p className="text-xs font-bold text-gray-700 mt-2">Capacity: 12/50 Orders Booked</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ORDERS MANAGEMENT TAB */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h2 className="text-base font-black text-gray-900">Campus Order Stream ({orders.length})</h2>
              <button
                onClick={loadOrders}
                className="text-xs text-orange-600 font-bold hover:underline"
              >
                🔄 Refresh Orders
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {orders.map((order) => (
                <div key={order.id} className="py-4 space-y-2.5">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                      <span className="text-xs font-bold text-gray-400">ORDER NO.</span>
                      <h4 className="font-black text-base text-gray-900">#{order.orderNumber || order.order_number || order.id}</h4>
                      <p className="text-xs text-orange-600 font-bold mt-0.5">⏱ {order.deliverySlot}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-800 uppercase">
                        {(order.orderStatus || order.order_status || 'ORDER_PLACED').replace(/_/g, ' ')}
                      </span>
                      <select
                        value={order.orderStatus || order.order_status || 'ORDER_PLACED'}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="text-xs font-bold border border-gray-300 rounded-xl px-2.5 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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

                  <div className="bg-gray-50 rounded-2xl p-3 text-xs text-gray-700 flex flex-wrap justify-between gap-2">
                    <div>
                      <p><strong>Student:</strong> {order.studentName || 'Student'} ({order.studentPhone || '9876543210'})</p>
                      <p><strong>Location:</strong> {order.hostelName || 'Hostel'} (Room {order.roomNumber || '304'})</p>
                      <p><strong>Canteen:</strong> {order.restaurantName || 'Campus Partner'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sm text-gray-900">Total: ₹{order.totalAmount || order.total_amount}</p>
                      <p className="text-[11px] text-gray-400">{new Date(order.placedAt || Date.now()).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. UNCOLLECTED ORDERS TAB */}
        {activeTab === 'uncollected' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="border-b pb-3">
              <h2 className="text-base font-black text-red-600">Uncollected Packet Resolution Hub</h2>
              <p className="text-xs text-gray-500">Orders where students did not collect from the slot runner at the hostel drop-point</p>
            </div>

            {uncollectedOrders.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-4xl mb-2">✨</p>
                <p className="font-bold text-gray-700 text-sm">No uncollected packets!</p>
                <p className="text-gray-400 text-xs mt-1">All delivered slot packets have been collected by students.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {uncollectedOrders.map((ord) => (
                  <div key={ord.id} className="p-4 rounded-2xl border-2 border-red-200 bg-red-50/30 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-base text-gray-900">#{ord.orderNumber || ord.id}</h4>
                        <p className="text-xs text-gray-600">Student: <strong>{ord.studentName}</strong> (📱 {ord.studentPhone})</p>
                        <p className="text-xs text-gray-600">Hostel Point: {ord.hostelName} • Room {ord.roomNumber}</p>
                      </div>
                      <span className="bg-red-600 text-white font-black text-[10px] px-3 py-1 rounded-full uppercase">
                        UNCOLLECTED
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-red-200">
                      <button
                        onClick={() => {
                          alert(`Calling student at +91 ${ord.studentPhone}...`);
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
                      >
                        📞 Call Student
                      </button>
                      <button
                        onClick={() => updateOrderStatus(ord.id, 'DELIVERED')}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl"
                      >
                        ✓ Mark Collected Now
                      </button>
                      <button
                        onClick={() => updateOrderStatus(ord.id, 'CANCELLED')}
                        className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs font-bold rounded-xl"
                      >
                        Dispose / Return to Canteen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. RESTAURANTS TAB */}
        {activeTab === 'restaurants' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="border-b pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-base font-black text-gray-900">Campus Canteen Partners</h2>
                <p className="text-xs text-gray-500">Monitor kitchen health, orders fulfilled, and store access locks</p>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {restaurants.map((rest) => (
                <div key={rest.id} className="py-4 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{rest.name}</h4>
                    <p className="text-xs text-gray-500">⭐ {rest.rating} Rating • {rest.totalOrders} slot orders fulfilled</p>
                    <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rest.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {rest.status === 'open' ? '● OPEN' : '✕ CLOSED'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href="/restaurant-portal"
                      className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
                    >
                      Open Kitchen Portal ➔
                    </Link>
                    <button
                      onClick={() => toggleRestaurantLock(rest.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        rest.adminLocked
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {rest.adminLocked ? '🔒 Admin Locked (Unlock)' : '🔓 Lock Store'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. FEES & SLOTS CONFIG TAB */}
        {activeTab === 'fees' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6 max-w-2xl">
            <div className="border-b pb-3">
              <h2 className="text-base font-black text-gray-900">Slot Delivery Fee & Platform Engine</h2>
              <p className="text-xs text-gray-500">Configure delivery slot pricing and tiered item platform fees</p>
            </div>

            {feeSaveSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <span>✓</span> Fee configuration updated and deployed to all student carts!
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Base Scheduled Slot Delivery Fee (₹)
                </label>
                <input
                  type="number"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
                <p className="text-[11px] text-gray-500 mt-1">Charged per order for slot delivery to hostel hub (Default: ₹10)</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Platform Fee (1–3 Items)
                  </label>
                  <input
                    type="number"
                    value={platformFeeTier1}
                    onChange={(e) => setPlatformFeeTier1(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Platform Fee (4–7 Items)
                  </label>
                  <input
                    type="number"
                    value={platformFeeTier2}
                    onChange={(e) => setPlatformFeeTier2(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveFees}
                className="w-full py-3.5 bg-slate-950 hover:bg-black text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-transform active:scale-[0.98]"
              >
                Save & Apply Fee Rules ➔
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
