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

export default function RestaurantDashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<'open' | 'temporarily_closed'>('open');
  const [closedByAdmin, setClosedByAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string>('canteen-1');
  const [restaurantName, setRestaurantName] = useState('North Campus Central Canteen');
  const [currentTab, setCurrentTab] = useState<'incoming' | 'preparing' | 'ready' | 'menu'>('incoming');

  // Checked items checklist for chefs
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Menu items state
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_MENU_ITEMS);

  // Add Item Modal state
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
      const id = localStorage.getItem('restaurantId') || 'canteen-1';
      const name = localStorage.getItem('restaurantName') || 'North Campus Central Canteen';
      setRestaurantId(id);
      setRestaurantName(name);

      fetchMenu(id);
      fetchOrders(id);

      const interval = setInterval(() => {
        fetchOrders(id, true);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchMenu = async (id: string) => {
    try {
      const res = await api.get(`/api/restaurants/${id}/menu`);
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setMenuItems(res.data.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('cb_restaurant_menu', JSON.stringify(res.data.data));
        }
      }
    } catch (e) {
      if (typeof window !== 'undefined') {
        const savedMenu = localStorage.getItem('cb_restaurant_menu');
        if (savedMenu) {
          try { setMenuItems(JSON.parse(savedMenu)); } catch {}
        }
      }
    }
  };

  const saveMenuToStorage = (items: MenuItem[]) => {
    setMenuItems(items);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cb_restaurant_menu', JSON.stringify(items));
    }
  };

  const fetchOrders = async (id: string, isPolling = false) => {
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
      localStorage.setItem('cb_orders', JSON.stringify(uniqueList));
    }
    if (!isPolling) setLoading(false);
  };

  const toggleStatus = async () => {
    if (closedByAdmin) {
      alert('⚠️ Store has been locked by Administration. Contact admin to unlock.');
      return;
    }
    const newStatus = status === 'open' ? 'temporarily_closed' : 'open';
    try {
      await api.patch(`/api/restaurants/${restaurantId}/status`, { operationalStatus: newStatus });
    } catch {}
    setStatus(newStatus);
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
    } catch {
      try {
        await axios.patch(`https://student-app-xi-bice.vercel.app/api/orders/${orderId}/status`, { orderStatus: newStatus });
      } catch {}
    }
  };

  const toggleItemAvailability = async (itemId: string) => {
    const itm = menuItems.find((i) => i.id === itemId);
    const newAvail = itm ? !itm.isAvailable : true;
    const updated = menuItems.map((i) =>
      i.id === itemId ? { ...i, isAvailable: newAvail } : i
    );
    saveMenuToStorage(updated);
    try {
      await api.patch(`/api/restaurants/${restaurantId}/menu`, { itemId, isAvailable: newAvail });
    } catch {}
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm('Are you sure you want to remove this dish from the menu?')) {
      const updated = menuItems.filter((i) => i.id !== itemId);
      saveMenuToStorage(updated);
      try {
        await api.delete(`/api/restaurants/${restaurantId}/menu?itemId=${itemId}`);
      } catch {}
    }
  };

  const handleAddNewItem = async (e: React.FormEvent) => {
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

    try {
      await api.post(`/api/restaurants/${restaurantId}/menu`, created);
    } catch {}

    alert(`✓ "${created.name}" added to menu!`);
  };

  const toggleCheck = (itemKey: string) => {
    setCheckedItems((prev) => ({ ...prev, [itemKey]: !prev[itemKey] }));
  };

  const getNormStatus = (o: Order) => String(o.orderStatus || o.order_status || '').toUpperCase();
  const incomingOrders = orders.filter((o) => {
    const s = getNormStatus(o);
    return s === 'ORDER_PLACED' || s === 'PLACED';
  });
  const preparingOrders = orders.filter((o) => {
    const s = getNormStatus(o);
    return s === 'PREPARING' || s === 'RESTAURANT_ACCEPTED' || s === 'ACCEPTED';
  });
  const readyOrders = orders.filter((o) => {
    const s = getNormStatus(o);
    return s === 'READY_FOR_DELIVERY' || s === 'READY' || s === 'OUT_FOR_DELIVERY' || s === 'DELIVERED';
  });

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 pb-20 font-sans selection:bg-orange-500 selection:text-white">
      {/* 1. TOP SWIGGY PARTNER HIGH-CONTRAST HEADER */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-30 shadow-xl">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-xl shadow-lg shadow-orange-500/20">
              👨‍🍳
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-white tracking-tight">{restaurantName}</h1>
                <span className="text-[10px] font-extrabold bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-md">
                  Kitchen POS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Live Campus Orders & Batch Slot Fulfillment</p>
            </div>
          </div>

          {/* Store Acceptance Toggle & Logout */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleStatus}
              disabled={closedByAdmin}
              className={`px-4 py-2 rounded-2xl font-black text-xs shadow-md transition-all flex items-center gap-2 ${
                status === 'open'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${status === 'open' ? 'bg-white animate-ping' : 'bg-slate-300'}`}></span>
              <span>{status === 'open' ? 'ACCEPTING ORDERS (OPEN)' : 'PAUSED (CLOSED)'}</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Log out from restaurant portal?')) {
                  localStorage.clear();
                  router.push('/auth/login');
                }
              }}
              className="text-xs text-slate-400 hover:text-white font-bold border border-slate-700 px-3.5 py-2 rounded-2xl bg-slate-800/80 hover:bg-slate-800 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* 2. NAVIGATION TABS */}
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl shadow-xl flex gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setCurrentTab('incoming')}
            className={`flex-1 py-3 px-4 text-xs font-black rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
              currentTab === 'incoming'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>🔔 New Orders</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              currentTab === 'incoming' ? 'bg-white text-orange-600' : 'bg-slate-800 text-slate-300'
            }`}>
              {incomingOrders.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('preparing')}
            className={`flex-1 py-3 px-4 text-xs font-black rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
              currentTab === 'preparing'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>🍳 In Cooking</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              currentTab === 'preparing' ? 'bg-white text-amber-600' : 'bg-slate-800 text-slate-300'
            }`}>
              {preparingOrders.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('ready')}
            className={`flex-1 py-3 px-4 text-xs font-black rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
              currentTab === 'ready'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>📦 Dispatched / Ready</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              currentTab === 'ready' ? 'bg-white text-emerald-600' : 'bg-slate-800 text-slate-300'
            }`}>
              {readyOrders.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('menu')}
            className={`flex-1 py-3 px-4 text-xs font-black rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
              currentTab === 'menu'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>📋 Menu & Stock</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
              {menuItems.length}
            </span>
          </button>
        </div>

        {/* 3. TAB CONTENT: INCOMING ORDERS */}
        {currentTab === 'incoming' && (
          <div className="space-y-4">
            {incomingOrders.length === 0 ? (
              <div className="bg-slate-900/60 rounded-3xl p-12 text-center border border-slate-800 space-y-2">
                <p className="text-4xl">🔔</p>
                <h3 className="text-sm font-bold text-slate-300">No new incoming orders</h3>
                <p className="text-xs text-slate-500">Orders placed by students will ring here instantly!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {incomingOrders.map((ord) => {
                  const items = ord.items || ord.order_items || [];
                  const orderNum = ord.orderNumber || ord.order_number || 'CB-XXXX';
                  const slot = ord.deliverySlot || ord.delivery_slot?.name || 'Evening Slot (6-7 PM)';

                  return (
                    <div
                      key={ord.id}
                      className="bg-slate-900 border-2 border-orange-500/80 rounded-3xl p-5 shadow-2xl space-y-4 relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-white">#{orderNum}</h3>
                            <span className="bg-orange-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md animate-pulse">
                              NEW ORDER
                            </span>
                          </div>
                          <p className="text-xs font-bold text-orange-400 mt-1">
                            🕒 {slot}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-base font-black text-emerald-400">
                            ₹{ord.totalAmount || ord.total_amount || 0}
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold">COD</p>
                        </div>
                      </div>

                      {/* Student Details */}
                      <div className="bg-slate-800/80 rounded-2xl p-3 text-xs border border-slate-700/60 space-y-1">
                        <p className="font-bold text-slate-200">
                          👤 {ord.studentName || ord.student_name || 'Student'}
                        </p>
                        <p className="text-slate-400">
                          📍 {ord.hostelName || ord.hostel_name || 'Hostel'}, Room {ord.roomNumber || ord.room_number || '304'}
                        </p>
                        <p className="text-slate-400">
                          📞 +91 {ord.studentPhone || ord.student_phone || '9876543210'}
                        </p>
                      </div>

                      {/* Items Checklist */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                          Items to prepare ({items.length}):
                        </p>
                        <div className="space-y-1.5">
                          {items.map((it: any, idx: number) => {
                            const itemKey = `${ord.id}-${idx}`;
                            const isChecked = checkedItems[itemKey];
                            return (
                              <div
                                key={idx}
                                onClick={() => toggleCheck(itemKey)}
                                className={`p-2 rounded-xl flex items-center justify-between text-xs cursor-pointer border transition-all ${
                                  isChecked
                                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300 line-through'
                                    : 'bg-slate-800 border-slate-700 text-slate-200'
                                }`}
                              >
                                <span className="font-bold">
                                  {it.quantity}x {it.name || it.itemName || it.item_name || 'Food Item'}
                                </span>
                                <span className="text-[10px] font-black">{isChecked ? '✓' : '○'}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Big Action Button */}
                      <button
                        onClick={() => updateOrderStatus(ord.id, 'PREPARING')}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <span>🍳 Accept & Start Cooking</span>
                        <span>➔</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 4. TAB CONTENT: IN COOKING */}
        {currentTab === 'preparing' && (
          <div className="space-y-4">
            {preparingOrders.length === 0 ? (
              <div className="bg-slate-900/60 rounded-3xl p-12 text-center border border-slate-800 space-y-2">
                <p className="text-4xl">🍳</p>
                <h3 className="text-sm font-bold text-slate-300">No orders currently cooking</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {preparingOrders.map((ord) => {
                  const items = ord.items || ord.order_items || [];
                  const orderNum = ord.orderNumber || ord.order_number || 'CB-XXXX';
                  const slot = ord.deliverySlot || ord.delivery_slot?.name || 'Evening Slot (6-7 PM)';

                  return (
                    <div
                      key={ord.id}
                      className="bg-slate-900 border border-amber-500/60 rounded-3xl p-5 shadow-xl space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-base font-black text-white">#{orderNum}</h3>
                          <p className="text-xs font-bold text-amber-400 mt-0.5">🕒 {slot}</p>
                        </div>
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                          Cooking in Progress
                        </span>
                      </div>

                      <div className="bg-slate-800/80 rounded-2xl p-3 text-xs border border-slate-700/60 space-y-1">
                        <p className="font-bold text-slate-200">
                          👤 {ord.studentName || ord.student_name} • Room {ord.roomNumber || ord.room_number}
                        </p>
                        <p className="text-slate-400">
                          📍 {ord.hostelName || ord.hostel_name}
                        </p>
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5">
                        {items.map((it: any, idx: number) => (
                          <div key={idx} className="bg-slate-800 p-2 rounded-xl text-xs font-bold text-slate-200">
                            {it.quantity}x {it.name || it.itemName || it.item_name}
                          </div>
                        ))}
                      </div>

                      {/* Mark Ready Button */}
                      <button
                        onClick={() => updateOrderStatus(ord.id, 'READY_FOR_DELIVERY')}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <span>✓ Mark Ready for Slot Dispatch</span>
                        <span>➔</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 5. TAB CONTENT: READY / DISPATCHED */}
        {currentTab === 'ready' && (
          <div className="space-y-4">
            {readyOrders.length === 0 ? (
              <div className="bg-slate-900/60 rounded-3xl p-12 text-center border border-slate-800 text-xs text-slate-500">
                No orders ready for pickup currently.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {readyOrders.map((ord) => {
                  const items = ord.items || ord.order_items || [];
                  const orderNum = ord.orderNumber || ord.order_number || 'CB-XXXX';
                  return (
                    <div
                      key={ord.id}
                      className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-black text-white">#{orderNum}</h3>
                          <p className="text-xs text-slate-400">
                            {ord.hostelName || ord.hostel_name}, Room {ord.roomNumber || ord.room_number}
                          </p>
                        </div>
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                          Packed & Ready
                        </span>
                      </div>

                      <div className="text-xs text-slate-300">
                        {items.map((it: any) => `${it.quantity}x ${it.name || it.item_name}`).join(', ')}
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                        <span className="font-bold text-emerald-400">₹{ord.totalAmount || ord.total_amount || 0}</span>
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'DELIVERED')}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl font-bold transition-all text-xs"
                        >
                          Mark Delivered ✓
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 6. TAB CONTENT: MENU MANAGER */}
        {currentTab === 'menu' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-3xl border border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white">Live Menu Items ({menuItems.length})</h3>
                <p className="text-xs text-slate-400">Toggle dish stock availability or add new items</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-600/20 active:scale-95 transition-all"
              >
                + Add Dish
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {menuItems.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`h-2 w-2 rounded-full ${dish.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{dish.category}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{dish.name}</h4>
                    <p className="text-xs font-black text-orange-400 mt-0.5">₹{dish.price}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleItemAvailability(dish.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                        dish.isAvailable
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {dish.isAvailable ? 'IN STOCK' : 'SOLD OUT'}
                    </button>

                    <button
                      onClick={() => handleDeleteItem(dish.id)}
                      className="text-slate-500 hover:text-rose-400 text-xs p-1"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 7. ADD DISH MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Add New Dish</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Dish Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Butter Naan & Shahi Paneer"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="120"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Main Course">Main Course</option>
                    <option value="Starters">Starters</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Food Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewItem({ ...newItem, isVeg: true })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      newItem.isVeg
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    🟢 Pure Veg
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewItem({ ...newItem, isVeg: false })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      !newItem.isVeg
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    🔴 Non-Veg
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-800 text-slate-400 font-bold py-3 rounded-xl text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-black py-3 rounded-xl text-xs uppercase shadow-md"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}