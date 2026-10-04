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
  description?: string;
  isAvailable: boolean;
}

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: 'item-1', name: 'Paneer Butter Masala Combo', price: 140, isVeg: true, category: 'Main Course', description: 'Rich paneer curry with 2 butter naans & salad', isAvailable: true },
  { id: 'item-2', name: 'Chicken Biryani Bowl', price: 160, isVeg: false, category: 'Main Course', description: 'Hyderabadi dum biryani with raita & salan', isAvailable: true },
  { id: 'item-3', name: 'Crispy Veg Spring Rolls', price: 80, isVeg: true, category: 'Starters', description: 'Golden fried rolls with spicy dip', isAvailable: true },
  { id: 'item-4', name: 'Chicken 65 (6 pcs)', price: 120, isVeg: false, category: 'Starters', description: 'Crispy spicy fried chicken bites', isAvailable: true },
  { id: 'item-5', name: 'Cold Coffee with Ice Cream', price: 60, isVeg: true, category: 'Beverages', description: 'Thick creamy blended cold coffee', isAvailable: true },
  { id: 'item-6', name: 'Hot Gulab Jamun (2 pcs)', price: 40, isVeg: true, category: 'Desserts', description: 'Soft warm milk dumplings in sugar syrup', isAvailable: true },
  { id: 'item-7', name: 'Cheese Burst Veg Burger', price: 95, isVeg: true, category: 'Snacks', description: 'Molten cheese patty with crispy veggies', isAvailable: true },
  { id: 'item-8', name: 'Masala Dosa with Sambar', price: 75, isVeg: true, category: 'South Indian', description: 'Crispy crepe with potato masala & chutney', isAvailable: true },
];

export default function RestaurantPortalPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<'open' | 'temporarily_closed'>('open');
  const [closedByAdmin, setClosedByAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string>('canteen-1');
  const [restaurantName, setRestaurantName] = useState('North Campus Central Canteen');
  const [currentTab, setCurrentTab] = useState<'incoming' | 'preparing' | 'ready' | 'menu'>('incoming');

  // Menu items state
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_MENU_ITEMS);

  // Add Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: 'Main Course',
    isVeg: true,
    description: '',
  });

  const api = axios.create({ baseURL: '' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMenu = localStorage.getItem('cb_restaurant_menu');
      if (savedMenu) {
        try {
          setMenuItems(JSON.parse(savedMenu));
        } catch {}
      }

      const id = localStorage.getItem('restaurantId') || 'canteen-1';
      const name = localStorage.getItem('restaurantName') || 'North Campus Central Canteen';
      setRestaurantId(id);
      setRestaurantName(name);
      fetchOrders(id);
    }
  }, []);

  const saveMenuToStorage = (items: MenuItem[]) => {
    setMenuItems(items);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cb_restaurant_menu', JSON.stringify(items));
    }
  };

  const fetchOrders = async (id: string) => {
    setLoading(true);
    let loadedOrders: Order[] = [];

    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('cb_orders');
        if (local) {
          loadedOrders = JSON.parse(local);
        }
      } catch {}
    }

    if (loadedOrders.length === 0) {
      loadedOrders = [
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
      ];
      if (typeof window !== 'undefined') {
        localStorage.setItem('cb_orders', JSON.stringify(loadedOrders));
      }
    }

    setOrders(loadedOrders);
    setLoading(false);
  };

  const toggleStatus = async () => {
    if (closedByAdmin) {
      alert('⚠️ Store has been locked by Administration. Contact admin to unlock.');
      return;
    }
    const newStatus = status === 'open' ? 'temporarily_closed' : 'open';
    setStatus(newStatus);
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

  const toggleItemAvailability = (itemId: string) => {
    const updated = menuItems.map((itm) =>
      itm.id === itemId ? { ...itm, isAvailable: !itm.isAvailable } : itm
    );
    saveMenuToStorage(updated);
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Are you sure you want to remove this dish from the menu?')) {
      const updated = menuItems.filter((i) => i.id !== itemId);
      saveMenuToStorage(updated);
    }
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) {
      alert('Please enter dish name');
      return;
    }
    const priceNum = parseFloat(newItem.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter a valid price (₹)');
      return;
    }

    const created: MenuItem = {
      id: 'dish-' + Date.now(),
      name: newItem.name.trim(),
      price: priceNum,
      category: newItem.category,
      isVeg: newItem.isVeg,
      description: newItem.description.trim() || undefined,
      isAvailable: true,
    };

    const updated = [created, ...menuItems];
    saveMenuToStorage(updated);
    setShowAddModal(false);
    setNewItem({
      name: '',
      price: '',
      category: 'Main Course',
      isVeg: true,
      description: '',
    });
    alert(`✓ "${created.name}" has been added to your menu!`);
  };

  const incomingOrders = orders.filter((o) => (o.orderStatus || o.order_status) === 'ORDER_PLACED');
  const preparingOrders = orders.filter((o) => (o.orderStatus || o.order_status) === 'PREPARING' || (o.orderStatus || o.order_status) === 'RESTAURANT_ACCEPTED');
  const readyOrders = orders.filter((o) => (o.orderStatus || o.order_status) === 'READY_FOR_DELIVERY' || (o.orderStatus || o.order_status) === 'OUT_FOR_DELIVERY' || (o.orderStatus || o.order_status) === 'DELIVERED');

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Universal Quick Portal Switcher */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-orange-400">CampusBite System:</span>
            <Link href="/home" className="hover:text-white font-medium">📱 Student App</Link>
            <span className="text-slate-600">|</span>
            <Link href="/restaurant-portal" className="text-orange-400 font-bold underline">🍳 Kitchen Portal</Link>
            <span className="text-slate-600">|</span>
            <Link href="/admin" className="hover:text-white font-medium">⚙️ Admin Hub</Link>
          </div>
          <span className="hidden sm:inline-block bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded text-[10px] font-bold">
            Live Demo Mode
          </span>
        </div>
      </div>

      {/* Top Header */}
      <div className="bg-white border-b px-6 py-4 flex flex-wrap justify-between items-center shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-gray-900">{restaurantName}</h1>
            <span className="text-[11px] font-bold bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-md">
              Kitchen Partner Portal
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Live Scheduled Slot Kitchen Operations & Menu Management</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleStatus}
            disabled={closedByAdmin}
            className={`px-4 py-2 rounded-xl text-white font-bold text-xs shadow-sm transition-all ${
              status === 'open' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {status === 'open' ? '✓ Accepting Orders (OPEN)' : '✕ Temporarily Closed'}
          </button>
          <Link
            href="/home"
            className="text-xs text-gray-700 hover:text-orange-600 font-bold border px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-white"
          >
            ← Student View
          </Link>
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
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${currentTab === 'incoming' ? 'bg-white text-orange-600' : 'bg-gray-200 text-gray-800'}`}>
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
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${currentTab === 'preparing' ? 'bg-white text-amber-600' : 'bg-gray-200 text-gray-800'}`}>
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
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${currentTab === 'ready' ? 'bg-white text-green-600' : 'bg-gray-200 text-gray-800'}`}>
              {readyOrders.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('menu')}
            className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
              currentTab === 'menu' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>📋 Menu & Stock Control ({menuItems.length})</span>
          </button>
        </div>

        {/* Tab 1: Incoming Orders */}
        {currentTab === 'incoming' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-gray-800 text-sm">New Incoming Orders (Requires Kitchen Acceptance)</h2>
              <button
                onClick={() => fetchOrders(restaurantId)}
                className="text-xs text-orange-600 font-bold hover:underline"
              >
                🔄 Refresh Feed
              </button>
            </div>

            {incomingOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border shadow-sm">
                <p className="text-4xl mb-2">🎉</p>
                <p className="font-bold text-gray-700 text-sm">No new orders waiting</p>
                <p className="text-gray-400 text-xs mt-1">When students place slot orders, they will appear here in real-time.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {incomingOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl p-5 border-2 border-orange-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400">ORDER NO.</span>
                        <h3 className="font-black text-lg text-gray-900">#{order.orderNumber || order.order_number || order.id}</h3>
                        <p className="text-xs text-orange-600 font-bold mt-0.5">⏱ {order.deliverySlot || 'Evening Slot 1 (6:00–7:00 PM)'}</p>
                      </div>
                      <span className="bg-orange-100 text-orange-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full animate-pulse">
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
                      <span>Delivery: {order.hostelName} (Room {order.roomNumber})</span>
                      <span className="font-bold text-gray-900">Total: ₹{order.totalAmount || order.total_amount}</span>
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
                <p className="font-bold text-gray-700 text-sm">No orders currently in preparation</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {preparingOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-black text-lg text-gray-900">#{order.orderNumber || order.order_number || order.id}</h3>
                        <p className="text-xs text-amber-600 font-bold mt-0.5">⏱ {order.deliverySlot || 'Evening Slot 1 (6:00–7:00 PM)'}</p>
                      </div>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                        COOKING IN PROGRESS
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
                      <span>📦</span> Mark Ready for Slot Dispatch
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
            <h2 className="font-bold text-gray-800 text-sm">Dispatched & Completed Slot Deliveries</h2>
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
          <div className="bg-white rounded-3xl p-6 border shadow-sm space-y-6">
            <div className="flex flex-wrap justify-between items-center pb-4 border-b gap-3">
              <div>
                <h3 className="font-black text-gray-900 text-lg">Menu Catalog & Stock Control</h3>
                <p className="text-xs text-gray-500">Manage dish offerings, prices, veg/non-veg flags, and live availability</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-black px-5 py-2.5 rounded-2xl shadow-lg shadow-orange-500/25 transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <span>+</span> Add New Dish to Menu
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {menuItems.map((itm) => (
                <div key={itm.id} className="py-4 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-start gap-3 min-w-[200px] flex-1">
                    <span className={`mt-1 h-4 w-4 rounded-sm border flex items-center justify-center ${itm.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                      <span className={`h-2 w-2 rounded-full ${itm.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></span>
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{itm.name}</h4>
                      <p className="text-xs text-gray-500">{itm.description || itm.category}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-black text-sm text-gray-900">₹{itm.price}</span>
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {itm.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleItemAvailability(itm.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        itm.isAvailable
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {itm.isAvailable ? '✓ In Stock' : '✕ Sold Out'}
                    </button>
                    <button
                      onClick={() => handleDeleteItem(itm.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all text-xs"
                      title="Delete dish"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add New Dish Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-lg text-gray-900">Add New Dish to Menu</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kadai Paneer with Butter Naan"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 140"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="Main Course">Main Course</option>
                    <option value="Starters">Starters</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                    <option value="South Indian">South Indian</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Food Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewItem({ ...newItem, isVeg: true })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      newItem.isVeg ? 'bg-green-50 border-green-500 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-green-600"></span>
                    Pure Veg (🟢)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewItem({ ...newItem, isVeg: false })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      !newItem.isVeg ? 'bg-red-50 border-red-500 text-red-800' : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-red-600"></span>
                    Non-Veg (🔴)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Fresh cottage cheese in spicy aromatic gravy"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/3 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/30"
                >
                  Add Dish to Menu ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
