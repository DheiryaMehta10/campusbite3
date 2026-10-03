'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface OrderItem {
  id?: string;
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
  items?: OrderItem[];
  order_items?: OrderItem[];
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  isVeg: boolean;
  category: string;
  isAvailable: boolean;
}

export default function RestaurantDashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<'open' | 'temporarily_closed'>('open');
  const [closedByAdmin, setClosedByAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string>('canteen-1');
  const [restaurantName, setRestaurantName] = useState('North Campus Central Canteen');
  const [currentTab, setCurrentTab] = useState<'incoming' | 'preparing' | 'ready' | 'menu'>('incoming');

  // Menu items list
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: 'item-1', name: 'Paneer Butter Masala Combo', price: 140, isVeg: true, category: 'Main Course', isAvailable: true },
    { id: 'item-2', name: 'Chicken Biryani Bowl', price: 160, isVeg: false, category: 'Main Course', isAvailable: true },
    { id: 'item-3', name: 'Crispy Veg Spring Rolls', price: 80, isVeg: true, category: 'Starters', isAvailable: true },
    { id: 'item-4', name: 'Chicken 65 (6 pcs)', price: 120, isVeg: false, category: 'Starters', isAvailable: true },
    { id: 'item-5', name: 'Cold Coffee with Ice Cream', price: 60, isVeg: true, category: 'Beverages', isAvailable: true },
    { id: 'item-6', name: 'Hot Gulab Jamun (2 pcs)', price: 40, isVeg: true, category: 'Desserts', isAvailable: true },
  ]);

  const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || '' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem('restaurantId') || 'canteen-1';
      const name = localStorage.getItem('restaurantName') || 'North Campus Central Canteen';
      setRestaurantId(id);
      setRestaurantName(name);
      fetchOrders(id);
    }
  }, []);

  const fetchOrders = async (id: string) => {
    setLoading(true);
    let fetched = false;
    try {
      const res = await api.get(`/api/restaurants/${id}/orders`);
      if (res.data?.data && res.data.data.length > 0) {
        setOrders(res.data.data);
        fetched = true;
      }
    } catch (error) {
      console.log('Using sample restaurant feed');
    }

    if (!fetched) {
      // Seed rich realistic restaurant orders
      setOrders([
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
          items: [
            { name: 'Paneer Butter Masala Combo', quantity: 1, price: 140 },
            { name: 'Cold Coffee with Ice Cream', quantity: 1, price: 60 },
          ],
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
          items: [
            { name: 'Chicken Biryani Bowl', quantity: 2, price: 160 },
          ],
        },
        {
          id: 'ord-303',
          orderNumber: 'CB-9401',
          totalAmount: 120,
          orderStatus: 'READY_FOR_DELIVERY',
          placedAt: new Date(Date.now() - 40 * 60000).toISOString(),
          deliverySlot: 'Evening Slot 1 (6:00 PM – 7:00 PM)',
          studentName: 'Aman Patel',
          studentPhone: '9876543212',
          hostelName: 'Ramanujan Hostel',
          roomNumber: '208',
          items: [
            { name: 'Chicken 65 (6 pcs)', quantity: 1, price: 120 },
          ],
        },
      ]);
    }
    setLoading(false);
  };

  const toggleStatus = async () => {
    if (closedByAdmin) {
      alert('⚠️ Store has been temporarily locked by Administration. You cannot reopen until Admin unlocks it.');
      return;
    }
    const newStatus = status === 'open' ? 'temporarily_closed' : 'open';
    try {
      await api.patch(`/api/restaurants/${restaurantId}/status`, {
        operationalStatus: newStatus,
      });
      setStatus(newStatus);
    } catch (error) {
      setStatus(newStatus);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/api/orders/${orderId}/status`, {
        orderStatus: newStatus,
      });
    } catch (e) {
      console.log('Simulating status update');
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus, order_status: newStatus } : o))
    );
  };

  const toggleItemAvailability = (itemId: string) => {
    setMenuItems((prev) =>
      prev.map((itm) => (itm.id === itemId ? { ...itm, isAvailable: !itm.isAvailable } : itm))
    );
  };

  const incomingOrders = orders.filter((o) => (o.orderStatus || o.order_status) === 'ORDER_PLACED');
  const preparingOrders = orders.filter((o) => (o.orderStatus || o.order_status) === 'PREPARING' || (o.orderStatus || o.order_status) === 'RESTAURANT_ACCEPTED');
  const readyOrders = orders.filter((o) => (o.orderStatus || o.order_status) === 'READY_FOR_DELIVERY' || (o.orderStatus || o.order_status) === 'OUT_FOR_DELIVERY' || (o.orderStatus || o.order_status) === 'DELIVERED');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Header */}
      <div className="bg-white border-b px-6 py-4 flex flex-wrap justify-between items-center shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-gray-900">{restaurantName}</h1>
            <span className="text-[11px] font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md">
              Kitchen Portal
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Live Scheduled Slot Kitchen Operations</p>
        </div>

        <div className="flex items-center gap-3">
          {closedByAdmin && (
            <span className="text-xs font-bold bg-red-100 text-red-700 px-3 py-1 rounded-lg border border-red-200">
              🔒 Admin Locked
            </span>
          )}
          <button
            onClick={toggleStatus}
            disabled={closedByAdmin}
            className={`px-4 py-2 rounded-xl text-white font-bold text-xs shadow-sm transition-all ${
              status === 'open' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            } ${closedByAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {status === 'open' ? '✓ Accepting Orders (OPEN)' : '✕ Temporarily Closed'}
          </button>
          <button
            onClick={() => {
              if (confirm('Log out from restaurant portal?')) {
                localStorage.clear();
                router.push('/auth/login');
              }
            }}
            className="text-xs text-gray-500 hover:text-red-600 font-semibold border px-3 py-2 rounded-xl"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex bg-white p-1.5 rounded-2xl border shadow-sm gap-1 overflow-x-auto">
          <button
            onClick={() => setCurrentTab('incoming')}
            className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
              currentTab === 'incoming' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>🔔 New Orders</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${currentTab === 'incoming' ? 'bg-white text-orange-600' : 'bg-gray-200 text-gray-800'}`}>
              {incomingOrders.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('preparing')}
            className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
              currentTab === 'preparing' ? 'bg-amber-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>🍳 In Cooking</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${currentTab === 'preparing' ? 'bg-white text-amber-600' : 'bg-gray-200 text-gray-800'}`}>
              {preparingOrders.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('ready')}
            className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
              currentTab === 'ready' ? 'bg-green-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>📦 Ready / Dispatched</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${currentTab === 'ready' ? 'bg-white text-green-600' : 'bg-gray-200 text-gray-800'}`}>
              {readyOrders.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('menu')}
            className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
              currentTab === 'menu' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>📋 Menu & Stock</span>
          </button>
        </div>

        {/* Tab 1: Incoming Orders */}
        {currentTab === 'incoming' && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-800 text-sm">New Incoming Orders (Requires Kitchen Acceptance)</h2>
            {incomingOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border shadow-sm">
                <p className="text-4xl mb-2">🎉</p>
                <p className="font-bold text-gray-700 text-sm">No new orders waiting</p>
                <p className="text-gray-400 text-xs mt-1">New scheduled slot orders will appear here in real-time.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {incomingOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl p-5 border-2 border-orange-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400">ORDER NO.</span>
                        <h3 className="font-black text-lg text-gray-900">#{order.orderNumber || order.order_number || order.id}</h3>
                        <p className="text-xs text-orange-600 font-bold mt-0.5">⏱ {order.deliverySlot || 'Evening Slot 1 (6–7 PM)'}</p>
                      </div>
                      <span className="bg-orange-100 text-orange-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full animate-bounce">
                        NEW ORDER
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                      {(order.items || order.order_items || []).map((itm, i) => (
                        <div key={i} className="flex justify-between text-xs font-bold text-gray-800">
                          <span>{itm.quantity}x {itm.name || itm.itemName || itm.item_name}</span>
                          <span>₹{(itm.price || 0) * itm.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between text-xs text-gray-600 border-t pt-2">
                      <span>Delivery: {order.hostelName} • Room {order.roomNumber}</span>
                      <span className="font-bold text-gray-900">₹{order.totalAmount || order.total_amount}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95"
                      >
                        ✓ Accept & Cook
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                        className="w-full bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: In Preparation */}
        {currentTab === 'preparing' && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-800 text-sm">Orders Being Cooked in Kitchen</h2>
            {preparingOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border shadow-sm">
                <p className="text-4xl mb-2">🍳</p>
                <p className="font-bold text-gray-700 text-sm">No orders currently cooking</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {preparingOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-black text-lg text-gray-900">#{order.orderNumber || order.order_number || order.id}</h3>
                        <p className="text-xs text-amber-600 font-bold mt-0.5">⏱ {order.deliverySlot || 'Evening Slot 1 (6–7 PM)'}</p>
                      </div>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                        COOKING
                      </span>
                    </div>

                    <div className="bg-amber-50/50 rounded-xl p-3 space-y-1.5">
                      {(order.items || order.order_items || []).map((itm, i) => (
                        <div key={i} className="flex justify-between text-xs font-bold text-gray-800">
                          <span>{itm.quantity}x {itm.name || itm.itemName || itm.item_name}</span>
                          <span>₹{(itm.price || 0) * itm.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => updateOrderStatus(order.id, 'READY_FOR_DELIVERY')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <span>📦</span> Mark Ready for Slot Runner
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Ready for Delivery */}
        {currentTab === 'ready' && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-800 text-sm">Ready / Dispatched to Hostel</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {readyOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-black text-base text-gray-900">#{order.orderNumber || order.order_number || order.id}</h3>
                      <p className="text-xs text-gray-500">{order.deliverySlot}</p>
                    </div>
                    <span className="bg-green-100 text-green-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                      {(order.orderStatus || order.order_status || 'READY').replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Hostel: {order.hostelName} (Room {order.roomNumber}) • Student: {order.studentName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Menu & Stock Manager */}
        {currentTab === 'menu' && (
          <div className="bg-white rounded-3xl p-6 border shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Menu Items & Stock Control</h3>
                <p className="text-xs text-gray-500">Toggle items In Stock / Sold Out in 1-click</p>
              </div>
              <button
                onClick={() => alert('Add Menu Item feature: Enter name, category, price and veg status.')}
                className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                + Add New Dish
              </button>
            </div>

            <div className="divide-y">
              {menuItems.map((itm) => (
                <div key={itm.id} className="py-3 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${itm.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></span>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{itm.name}</h4>
                      <p className="text-xs text-gray-500">{itm.category} • ₹{itm.price}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleItemAvailability(itm.id)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      itm.isAvailable
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {itm.isAvailable ? '✓ In Stock' : '✕ Sold Out'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}