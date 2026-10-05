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
  { key: 'ORDER_PLACED', label: 'Order Placed', desc: 'Received by CampusBite' },
  { key: 'RESTAURANT_ACCEPTED', label: 'Accepted', desc: 'Canteen confirmed the order' },
  { key: 'PREPARING', label: 'Preparing', desc: 'Fresh meal is being cooked' },
  { key: 'READY_FOR_DELIVERY', label: 'Ready for Dispatch', desc: 'Packed and ready for slot runner' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Slot delivery partner on the way' },
  { key: 'ARRIVED', label: 'Arrived at Hostel', desc: 'Reached your hostel collection point' },
  { key: 'READY_FOR_COLLECTION', label: 'Ready for Collection', desc: 'Please pick up your order now' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Order completed' },
];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://campusbite-amber.vercel.app',
  });

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 4000);
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
    } catch (e) {}

    let localOrders: Order[] = [];
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('cb_orders');
        if (local) {
          localOrders = JSON.parse(local);
        }
      } catch (e) {}
    }

    // Merge API orders and local orders by matching ID or orderNumber
    const mergedMap = new Map<string, Order>();
    for (const ord of localOrders) {
      if (ord.id) mergedMap.set(ord.id, ord);
      if (ord.orderNumber) mergedMap.set(ord.orderNumber, ord);
      if (ord.order_number) mergedMap.set(ord.order_number, ord);
    }
    for (const ord of apiOrders) {
      if (ord.id) mergedMap.set(ord.id, ord);
      if (ord.orderNumber) mergedMap.set(ord.orderNumber, ord);
      if (ord.order_number) mergedMap.set(ord.order_number, ord);
    }

    const uniqueList = Array.from(new Set(Array.from(mergedMap.values())));
    uniqueList.sort((a, b) => new Date(b.placedAt || b.placed_at || 0).getTime() - new Date(a.placedAt || a.placed_at || 0).getTime());

    if (uniqueList.length > 0) {
      setOrders(uniqueList);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cb_orders', JSON.stringify(uniqueList));
      }
    } else {
      // Demo seed orders if completely empty
      const sample: Order[] = [
        {
          id: 'ord-101',
          orderNumber: 'CB-8821',
          totalAmount: 172,
          orderStatus: 'PREPARING',
          placedAt: new Date().toISOString(),
          deliverySlot: 'Evening Slot 1 (6:00 PM – 7:00 PM)',
          hostelName: 'Tagore Hostel Block A',
          roomNumber: '304',
          restaurantName: 'North Campus Central Canteen',
          items: [
            { name: 'Paneer Butter Masala Combo', price: 140, quantity: 1 },
            { name: 'Cold Coffee with Ice Cream', price: 60, quantity: 1 },
          ],
        },
      ];
      setOrders(sample);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cb_orders', JSON.stringify(sample));
      }
    }
    setLoading(false);
  };

  const isOrderActive = (status: string) => {
    const s = String(status || '').toUpperCase();
    return s !== 'DELIVERED' && s !== 'CANCELLED' && s !== 'FAILED' && s !== 'UNCOLLECTED';
  };

  const activeOrders = orders.filter((o) => isOrderActive(o.orderStatus || o.order_status || 'ORDER_PLACED'));
  const pastOrders = orders.filter((o) => !isOrderActive(o.orderStatus || o.order_status || 'DELIVERED'));

  const getStepIndex = (status: string) => {
    const s = status.toUpperCase();
    const idx = ORDER_STEPS.findIndex((step) => step.key === s);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Top Header */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-sm">
        <h1 className="font-black text-gray-900 text-lg">My Orders</h1>
        <Link
          href="/home"
          className="text-orange-600 font-bold text-xs bg-orange-50 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-all"
        >
          + New Order
        </Link>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-4">
        {/* Tabs: Active vs Past */}
        <div className="flex bg-gray-200 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active Orders ({activeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'past' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Past Orders ({pastOrders.length})
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-500 text-xs">Loading your orders...</div>
        ) : (
          <div className="space-y-3">
            {(activeTab === 'active' ? activeOrders : pastOrders).length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm mt-4">
                <p className="text-4xl mb-2">{activeTab === 'active' ? '🛵' : '📦'}</p>
                <h3 className="font-bold text-gray-900 text-sm">
                  {activeTab === 'active' ? 'No active orders right now' : 'No past orders yet'}
                </h3>
                <p className="text-gray-500 text-xs mt-1 mb-4">
                  {activeTab === 'active'
                    ? 'Orders you place will show their live delivery slot status here.'
                    : 'Your completed deliveries will appear in this history.'}
                </p>
                <Link
                  href="/home"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md inline-block"
                >
                  Order Food Now
                </Link>
              </div>
            ) : (
              (activeTab === 'active' ? activeOrders : pastOrders).map((order) => {
                const num = order.orderNumber || order.order_number || order.id;
                const status = order.orderStatus || order.order_status || 'ORDER_PLACED';
                const total = order.totalAmount ?? order.total_amount ?? 0;
                const slot = order.deliverySlot || order.delivery_slot?.name || 'Scheduled Evening Slot';
                const itemsList = order.items || order.order_items || [];

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3 hover:border-orange-200 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[11px] font-bold text-gray-400">ORDER NUMBER</span>
                        <h3 className="font-black text-gray-900 text-base">#{num}</h3>
                        <p className="text-xs text-orange-600 font-semibold mt-0.5">⏱ {slot}</p>
                      </div>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          status === 'DELIVERED'
                            ? 'bg-green-100 text-green-800'
                            : status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-orange-100 text-orange-800 animate-pulse'
                        }`}
                      >
                        {status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Items snippet */}
                    {itemsList.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-2.5 text-xs text-gray-700 space-y-1">
                        {itemsList.map((itm, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>
                              {itm.quantity}x {itm.name || itm.itemName || itm.item_name || 'Food Item'}
                            </span>
                            {itm.price ? <span className="font-medium">₹{itm.price * itm.quantity}</span> : null}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-1 border-t">
                      <div>
                        <p className="text-[10px] text-gray-400 font-medium">TOTAL PAID</p>
                        <p className="font-black text-gray-900 text-base">₹{total}</p>
                      </div>

                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl transition-transform active:scale-95 flex items-center gap-1.5"
                      >
                        <span>📍</span> Track Live Status
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Live Order Tracker Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center pb-2 border-b">
              <div>
                <h3 className="font-black text-lg text-gray-900">
                  Track Order #{selectedOrder.orderNumber || selectedOrder.order_number || selectedOrder.id}
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedOrder.deliverySlot || selectedOrder.delivery_slot?.name || 'Scheduled Slot Delivery'}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Hostel Location reminder */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3 flex items-center gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <p className="font-bold text-xs text-orange-950">Hostel Collection Point</p>
                <p className="text-xs text-orange-800">
                  {selectedOrder.hostelName || 'Hostel Campus'} • Room {selectedOrder.roomNumber || '304'}
                </p>
              </div>
            </div>

            {/* 11-Step Visual Timeline */}
            <div className="space-y-4 py-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Delivery Timeline</h4>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {ORDER_STEPS.map((step, idx) => {
                  const currentIdx = getStepIndex(selectedOrder.orderStatus || selectedOrder.order_status || 'ORDER_PLACED');
                  const isDone = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div key={step.key} className="relative">
                      <div
                        className={`absolute -left-6 top-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                          isCurrent
                            ? 'border-orange-600 bg-orange-600 text-white ring-4 ring-orange-100'
                            : isDone
                            ? 'border-green-600 bg-green-600 text-white'
                            : 'border-gray-300 bg-white text-gray-400'
                        }`}
                      >
                        {isDone && !isCurrent ? '✓' : idx + 1}
                      </div>
                      <div>
                        <h5
                          className={`font-bold text-sm ${
                            isCurrent ? 'text-orange-600' : isDone ? 'text-gray-900' : 'text-gray-400'
                          }`}
                        >
                          {step.label}
                        </h5>
                        <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-all text-xs"
            >
              Close Tracker
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 flex justify-between items-center shadow-lg z-30">
        <Link href="/home" className="flex flex-col items-center text-gray-500 hover:text-orange-600">
          <span className="text-lg">🏠</span>
          <span className="text-[10px] font-bold mt-0.5">Home</span>
        </Link>
        <Link href="/orders" className="flex flex-col items-center text-orange-600 font-bold">
          <span className="text-lg">📦</span>
          <span className="text-[10px] mt-0.5">Orders</span>
        </Link>
        <Link href="/cart" className="flex flex-col items-center text-gray-500 hover:text-orange-600">
          <span className="text-lg">🛒</span>
          <span className="text-[10px] font-bold mt-0.5">Cart</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center text-gray-500 hover:text-orange-600">
          <span className="text-lg">👤</span>
          <span className="text-[10px] font-bold mt-0.5">Profile</span>
        </Link>
      </div>
    </div>
  );
}