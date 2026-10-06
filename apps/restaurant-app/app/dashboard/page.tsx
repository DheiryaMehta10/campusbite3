'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  image?: string;
  image_url?: string;
  isAvailable: boolean;
  isBestseller?: boolean;
}

interface RestaurantProfile {
  id: string;
  name: string;
  description?: string;
  cuisines?: string;
  image_url?: string;
  phone?: string;
  email?: string;
  operational_status?: 'open' | 'temporarily_closed' | string;
  delivery_time?: string;
  price_for_two?: number;
  rating?: number;
}

const DEFAULT_RESTAURANTS_SEED: RestaurantProfile[] = [
  {
    id: 'canteen-1',
    name: 'North Campus Central Canteen',
    description: 'North Indian • Thalis • Butter Naan • Beverages',
    cuisines: 'North Indian, Street Food, Chinese',
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    phone: '9876543210',
    operational_status: 'open',
    delivery_time: 'Slot 6:00 - 7:00 PM',
    price_for_two: 180,
    rating: 4.6,
  },
  {
    id: 'canteen-2',
    name: 'South Mess & Food Court',
    description: 'Hyderabadi Biryani • South Indian • Meals & Combos',
    cuisines: 'Biryani, South Indian, Dosa',
    image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    phone: '9876543211',
    operational_status: 'open',
    delivery_time: 'Slot 6:00 - 7:00 PM',
    price_for_two: 220,
    rating: 4.5,
  },
  {
    id: 'canteen-3',
    name: 'Night Canteen & Snacks Hub',
    description: 'Fast Food • Crispy Starters • Rolls • Maggi',
    cuisines: 'Snacks, Burgers, Fast Food',
    image_url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80',
    phone: '9876543212',
    operational_status: 'open',
    delivery_time: 'Night Slot 9:30 - 10:30 PM',
    price_for_two: 150,
    rating: 4.4,
  },
  {
    id: 'canteen-4',
    name: 'Campus Chai & Fast Food Corner',
    description: 'Burgers • Sandwiches • Kulhad Chai • Cold Coffee',
    cuisines: 'Tea, Coffee, Sandwiches, Burgers',
    image_url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&auto=format&fit=crop&q=80',
    phone: '9876543213',
    operational_status: 'open',
    delivery_time: 'Slot 6:00 - 7:00 PM',
    price_for_two: 120,
    rating: 4.7,
  },
];

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: 'item-1', name: 'Paneer Butter Masala Combo', price: 140, isVeg: true, category: 'Main Course', description: 'Rich paneer curry with 2 butter naans & salad', isAvailable: true, isBestseller: true, image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80' },
  { id: 'item-2', name: 'Chicken Biryani Bowl', price: 160, isVeg: false, category: 'Main Course', description: 'Hyderabadi dum biryani with raita & salan', isAvailable: true, isBestseller: true, image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80' },
  { id: 'item-3', name: 'Crispy Veg Spring Rolls', price: 80, isVeg: true, category: 'Starters', description: 'Golden fried rolls with spicy dip', isAvailable: true, isBestseller: false, image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80' },
  { id: 'item-4', name: 'Chicken 65 (6 pcs)', price: 120, isVeg: false, category: 'Starters', description: 'Crispy spicy fried chicken bites', isAvailable: true, isBestseller: false, image_url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500&auto=format&fit=crop&q=80' },
  { id: 'item-5', name: 'Cold Coffee with Ice Cream', price: 60, isVeg: true, category: 'Beverages', description: 'Thick creamy blended cold coffee', isAvailable: true, isBestseller: false, image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80' },
  { id: 'item-6', name: 'Hot Gulab Jamun (2 pcs)', price: 40, isVeg: true, category: 'Desserts', description: 'Soft warm milk dumplings in sugar syrup', isAvailable: true, isBestseller: false, image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80' },
  { id: 'item-7', name: 'Cheese Burst Veg Burger', price: 95, isVeg: true, category: 'Snacks', description: 'Molten cheese patty with crispy veggies', isAvailable: true, isBestseller: true, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80' },
  { id: 'item-8', name: 'Masala Dosa with Sambar', price: 75, isVeg: true, category: 'South Indian', description: 'Crispy crepe with potato masala & chutney', isAvailable: true, isBestseller: false, image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80' },
];

const PRESET_IMAGES = [
  { label: 'Canteen Meals', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80' },
  { label: 'Biryani Court', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80' },
  { label: 'Burgers & Fast Food', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80' },
  { label: 'Cafe & Beverages', url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&auto=format&fit=crop&q=80' },
  { label: 'South Indian & Dosa', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80' },
  { label: 'Crispy Snacks', url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80' },
];

export default function RestaurantDashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<'open' | 'temporarily_closed'>('open');
  const [closedByAdmin, setClosedByAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Multi-Restaurant Management
  const [restaurantsList, setRestaurantsList] = useState<RestaurantProfile[]>(DEFAULT_RESTAURANTS_SEED);
  const [currentRestaurant, setCurrentRestaurant] = useState<RestaurantProfile>(DEFAULT_RESTAURANTS_SEED[0]);
  const [showRestaurantSwitcher, setShowRestaurantSwitcher] = useState(false);
  const [showAddRestaurantModal, setShowAddRestaurantModal] = useState(false);
  const [showEditRestaurantModal, setShowEditRestaurantModal] = useState(false);

  // New Restaurant Form State
  const [newRestaurantForm, setNewRestaurantForm] = useState({
    name: '',
    cuisines: 'North Indian, Snacks, Beverages',
    description: '',
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    delivery_time: 'Slot 6:00 - 7:00 PM',
    price_for_two: '150',
    phone: '',
  });

  // Edit Restaurant Form State
  const [editRestaurantForm, setEditRestaurantForm] = useState({
    name: '',
    cuisines: '',
    description: '',
    image_url: '',
    delivery_time: '',
    price_for_two: '',
    phone: '',
  });

  // Navigation Tab State
  const [currentTab, setCurrentTab] = useState<'incoming' | 'preparing' | 'ready' | 'menu' | 'restaurant_profile'>('incoming');

  // Menu items state
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_MENU_ITEMS);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [menuSearch, setMenuSearch] = useState('');

  // Add Item Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: 'Main Course',
    isVeg: true,
    description: '',
    image_url: '',
    isBestseller: false,
  });

  // Edit Item Modal state
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Checked items checklist for chefs
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const api = axios.create({ baseURL: '' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadInitialData();

      const interval = setInterval(() => {
        const activeRestId = localStorage.getItem('restaurantId') || 'canteen-1';
        fetchOrders(activeRestId, true);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, []);

  const loadInitialData = async () => {
    // 1. Load restaurants list
    let loadedRestaurants = DEFAULT_RESTAURANTS_SEED;
    try {
      const res = await api.get('/api/restaurants');
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        loadedRestaurants = res.data.data;
      }
    } catch {}

    const savedCustomRest = localStorage.getItem('cb_all_restaurants');
    if (savedCustomRest) {
      try {
        const parsed = JSON.parse(savedCustomRest);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, RestaurantProfile>();
          loadedRestaurants.forEach((r) => map.set(r.id, r));
          parsed.forEach((r: RestaurantProfile) => map.set(r.id, r));
          loadedRestaurants = Array.from(map.values());
        }
      } catch {}
    }
    setRestaurantsList(loadedRestaurants);

    // 2. Select active restaurant
    const savedId = localStorage.getItem('restaurantId') || loadedRestaurants[0].id;
    const active = loadedRestaurants.find((r) => r.id === savedId) || loadedRestaurants[0];
    setCurrentRestaurant(active);
    setStatus((active.operational_status as any) || 'open');

    // 3. Load menu for active restaurant
    fetchMenu(active.id);
    fetchOrders(active.id);
  };

  const selectRestaurant = (rest: RestaurantProfile) => {
    setCurrentRestaurant(rest);
    setStatus((rest.operational_status as any) || 'open');
    if (typeof window !== 'undefined') {
      localStorage.setItem('restaurantId', rest.id);
      localStorage.setItem('restaurantName', rest.name);
    }
    setShowRestaurantSwitcher(false);
    fetchMenu(rest.id);
    fetchOrders(rest.id);
  };

  const fetchMenu = async (id: string) => {
    try {
      const res = await api.get(`/api/restaurants/${id}/menu`);
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setMenuItems(res.data.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`cb_restaurant_menu_${id}`, JSON.stringify(res.data.data));
        }
        return;
      }
    } catch {}

    if (typeof window !== 'undefined') {
      const savedMenu = localStorage.getItem(`cb_restaurant_menu_${id}`);
      if (savedMenu) {
        try {
          setMenuItems(JSON.parse(savedMenu));
          return;
        } catch {}
      }
    }
    setMenuItems(DEFAULT_MENU_ITEMS);
  };

  const saveMenuToStorage = (items: MenuItem[], targetRestId = currentRestaurant.id) => {
    setMenuItems(items);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`cb_restaurant_menu_${targetRestId}`, JSON.stringify(items));
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
    const updatedRest = { ...currentRestaurant, operational_status: newStatus };
    setCurrentRestaurant(updatedRest);
    setStatus(newStatus);

    const updatedList = restaurantsList.map((r) => (r.id === currentRestaurant.id ? updatedRest : r));
    setRestaurantsList(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cb_all_restaurants', JSON.stringify(updatedList));
    }

    try {
      await api.patch(`/api/restaurants/${currentRestaurant.id}/status`, { operationalStatus: newStatus });
      await api.put('/api/restaurants', { id: currentRestaurant.id, operational_status: newStatus });
    } catch {}
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

  // --- RESTAURANT MANAGEMENT HANDLERS ---
  const handleRegisterNewRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRestaurantForm.name.trim()) {
      alert('Please enter restaurant name');
      return;
    }

    const newRestObj: RestaurantProfile = {
      id: 'rest-' + Date.now(),
      name: newRestaurantForm.name.trim(),
      description: newRestaurantForm.description.trim() || 'Delicious meals & snacks',
      cuisines: newRestaurantForm.cuisines.trim() || 'Multi-Cuisine',
      image_url: newRestaurantForm.image_url.trim() || PRESET_IMAGES[0].url,
      delivery_time: newRestaurantForm.delivery_time.trim() || 'Slot 6:00 - 7:00 PM',
      price_for_two: Number(newRestaurantForm.price_for_two) || 150,
      phone: newRestaurantForm.phone.trim(),
      operational_status: 'open',
      rating: 4.8,
    };

    const updatedList = [newRestObj, ...restaurantsList];
    setRestaurantsList(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cb_all_restaurants', JSON.stringify(updatedList));
      localStorage.setItem('restaurantId', newRestObj.id);
      localStorage.setItem('restaurantName', newRestObj.name);
    }
    setCurrentRestaurant(newRestObj);
    setStatus('open');
    setShowAddRestaurantModal(false);

    // Initial default menu seed for newly added restaurant
    saveMenuToStorage(DEFAULT_MENU_ITEMS, newRestObj.id);

    try {
      await api.post('/api/restaurants', newRestObj);
    } catch {}

    alert(`🎉 Restaurant "${newRestObj.name}" created successfully and is now active!`);
  };

  const handleOpenEditRestaurant = () => {
    setEditRestaurantForm({
      name: currentRestaurant.name || '',
      cuisines: currentRestaurant.cuisines || '',
      description: currentRestaurant.description || '',
      image_url: currentRestaurant.image_url || '',
      delivery_time: currentRestaurant.delivery_time || 'Slot 6:00 - 7:00 PM',
      price_for_two: String(currentRestaurant.price_for_two || 150),
      phone: currentRestaurant.phone || '',
    });
    setShowEditRestaurantModal(true);
  };

  const handleSaveEditRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRestaurantForm.name.trim()) {
      alert('Please enter restaurant name');
      return;
    }

    const updated: RestaurantProfile = {
      ...currentRestaurant,
      name: editRestaurantForm.name.trim(),
      cuisines: editRestaurantForm.cuisines.trim(),
      description: editRestaurantForm.description.trim(),
      image_url: editRestaurantForm.image_url.trim() || currentRestaurant.image_url,
      delivery_time: editRestaurantForm.delivery_time.trim(),
      price_for_two: Number(editRestaurantForm.price_for_two) || 150,
      phone: editRestaurantForm.phone.trim(),
    };

    setCurrentRestaurant(updated);
    const updatedList = restaurantsList.map((r) => (r.id === updated.id ? updated : r));
    setRestaurantsList(updatedList);

    if (typeof window !== 'undefined') {
      localStorage.setItem('cb_all_restaurants', JSON.stringify(updatedList));
      localStorage.setItem('restaurantName', updated.name);
    }

    setShowEditRestaurantModal(false);

    try {
      await api.put('/api/restaurants', updated);
    } catch {}

    alert('✓ Restaurant profile updated successfully!');
  };

  // --- MENU ITEM HANDLERS ---
  const toggleItemAvailability = async (itemId: string) => {
    const itm = menuItems.find((i) => i.id === itemId);
    const newAvail = itm ? !itm.isAvailable : true;
    const updated = menuItems.map((i) =>
      i.id === itemId ? { ...i, isAvailable: newAvail } : i
    );
    saveMenuToStorage(updated);
    try {
      await api.put(`/api/restaurants/${currentRestaurant.id}/menu`, { itemId, isAvailable: newAvail });
    } catch {}
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm('Are you sure you want to remove this dish from your menu?')) {
      const updated = menuItems.filter((i) => i.id !== itemId);
      saveMenuToStorage(updated);
      try {
        await api.delete(`/api/restaurants/${currentRestaurant.id}/menu?itemId=${itemId}`);
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
      category: newItem.category.trim() || 'Main Course',
      isVeg: newItem.isVeg,
      description: newItem.description.trim() || undefined,
      image_url: newItem.image_url.trim() || (newItem.isVeg ? 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80'),
      isBestseller: newItem.isBestseller,
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
      image_url: '',
      isBestseller: false,
    });

    try {
      await api.post(`/api/restaurants/${currentRestaurant.id}/menu`, created);
    } catch {}

    alert(`✓ "${created.name}" added to menu!`);
  };

  const handleOpenEditItem = (dish: MenuItem) => {
    setEditingItem({ ...dish });
    setShowEditItemModal(true);
  };

  const handleSaveEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name.trim()) {
      alert('Please enter dish name');
      return;
    }

    const updated = menuItems.map((i) => (i.id === editingItem.id ? editingItem : i));
    saveMenuToStorage(updated);
    setShowEditItemModal(false);

    try {
      await api.put(`/api/restaurants/${currentRestaurant.id}/menu`, {
        itemId: editingItem.id,
        name: editingItem.name,
        price: editingItem.price,
        category: editingItem.category,
        isVeg: editingItem.isVeg,
        description: editingItem.description,
        image_url: editingItem.image_url || editingItem.image,
        isAvailable: editingItem.isAvailable,
        isBestseller: editingItem.isBestseller,
      });
    } catch {}

    alert('✓ Dish updated successfully!');
  };

  // Filtered menu items calculation
  const uniqueCategories = Array.from(new Set(menuItems.map((i) => i.category || 'Main Course')));

  const filteredMenuItems = menuItems.filter((dish) => {
    if (selectedCategoryFilter !== 'all' && dish.category !== selectedCategoryFilter) return false;
    if (vegFilter === 'veg' && !dish.isVeg) return false;
    if (vegFilter === 'nonveg' && dish.isVeg) return false;
    if (menuSearch.trim()) {
      const q = menuSearch.toLowerCase();
      return (
        dish.name.toLowerCase().includes(q) ||
        (dish.description || '').toLowerCase().includes(q) ||
        dish.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

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
    <div className="min-h-screen bg-[#0F172A] text-slate-100 pb-24 font-sans selection:bg-orange-500 selection:text-white">
      {/* 1. TOP SWIGGY PARTNER HIGH-CONTRAST HEADER */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 md:px-8 py-3.5 sticky top-0 z-30 shadow-2xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          
          {/* Restaurant Selector & Brand */}
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="h-11 w-11 rounded-2xl overflow-hidden border border-orange-500/30 bg-slate-950 flex items-center justify-center p-0.5 shadow-lg shadow-orange-500/20">
                <img
                  src={currentRestaurant.image_url || '/logo-icon.png'}
                  alt="Restaurant"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 bg-orange-600 text-white text-[8px] font-black uppercase px-1 py-0.2 rounded shadow">
                POS
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRestaurantSwitcher(!showRestaurantSwitcher)}
                  className="text-sm md:text-base font-black text-white tracking-tight flex items-center gap-1.5 hover:text-orange-400 transition-colors"
                >
                  <span className="truncate max-w-[220px] md:max-w-[320px]">{currentRestaurant.name}</span>
                  <span className="text-xs text-orange-400">▾</span>
                </button>
                <span className="hidden sm:inline-block text-[10px] font-black bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-md">
                  Active Outlet
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[280px]">
                {currentRestaurant.cuisines || 'Multi-Cuisine'} • {currentRestaurant.delivery_time || 'Batch Slot Delivery'}
              </p>
            </div>
          </div>

          {/* Action Bar: Store Toggle, Add Restaurant & Logout */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAddRestaurantModal(true)}
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-orange-600/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>+</span>
              <span className="hidden sm:inline">Add Restaurant</span>
            </button>

            <button
              onClick={toggleStatus}
              disabled={closedByAdmin}
              className={`px-3.5 py-2 rounded-xl font-black text-xs shadow-md transition-all flex items-center gap-2 ${
                status === 'open'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${status === 'open' ? 'bg-white animate-ping' : 'bg-slate-300'}`}></span>
              <span className="hidden md:inline">{status === 'open' ? 'ACCEPTING (OPEN)' : 'PAUSED (CLOSED)'}</span>
              <span className="md:hidden">{status === 'open' ? 'OPEN' : 'CLOSED'}</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Log out from restaurant portal?')) {
                  localStorage.clear();
                  router.push('/auth/login');
                }
              }}
              className="text-xs text-slate-400 hover:text-white font-bold border border-slate-700 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* RESTAURANT SWITCHER DROPDOWN */}
        {showRestaurantSwitcher && (
          <div className="absolute top-16 left-4 md:left-8 z-40 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 w-80 space-y-2 mt-1">
            <div className="flex justify-between items-center px-1 pb-1 border-b border-slate-800">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Your Campus Outlets</span>
              <button
                onClick={() => setShowRestaurantSwitcher(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
              {restaurantsList.map((r) => (
                <button
                  key={r.id}
                  onClick={() => selectRestaurant(r)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 ${
                    r.id === currentRestaurant.id
                      ? 'bg-orange-600/20 border border-orange-500/40 text-orange-300'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-black truncate">{r.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{r.cuisines || 'Canteen'}</p>
                  </div>
                  {r.id === currentRestaurant.id && <span className="text-orange-400 font-black text-xs">✓</span>}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setShowRestaurantSwitcher(false);
                setShowAddRestaurantModal(true);
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-orange-400 text-xs font-black py-2 rounded-xl text-center border border-dashed border-slate-700 transition-all"
            >
              + Register Another Restaurant
            </button>
          </div>
        )}
      </header>

      {/* 2. NAVIGATION TABS */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
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
            <span>📋 Menu &amp; Items</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
              {menuItems.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('restaurant_profile')}
            className={`flex-1 py-3 px-4 text-xs font-black rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
              currentTab === 'restaurant_profile'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>🏢 Outlet Profile</span>
          </button>
        </div>

        {/* 3. TAB CONTENT: INCOMING ORDERS */}
        {currentTab === 'incoming' && (
          <div className="space-y-4">
            {incomingOrders.length === 0 ? (
              <div className="bg-slate-900/60 rounded-3xl p-12 text-center border border-slate-800 space-y-2">
                <p className="text-4xl">🔔</p>
                <h3 className="text-sm font-bold text-slate-300">No new incoming orders right now</h3>
                <p className="text-xs text-slate-500">New batch orders placed by students will ring here automatically.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                          <span className="bg-orange-500 text-white font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                            New Order
                          </span>
                          <h3 className="text-lg font-black text-white mt-1">#{orderNum}</h3>
                          <p className="text-xs font-bold text-orange-400">🕒 {slot}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-black text-white">₹{ord.totalAmount || ord.total_amount || 0}</p>
                          <p className="text-[10px] text-slate-400">{items.length} items</p>
                        </div>
                      </div>

                      <div className="bg-slate-800/80 rounded-2xl p-3 text-xs border border-slate-700/60 space-y-1">
                        <p className="font-bold text-slate-200">
                          👤 {ord.studentName || ord.student_name || 'Student'} • Room {ord.roomNumber || ord.room_number || '-'}
                        </p>
                        <p className="text-slate-400 truncate">
                          📍 {ord.hostelName || ord.hostel_name || 'Campus Hostel'}
                        </p>
                        {ord.studentPhone && (
                          <p className="text-slate-400">📞 {ord.studentPhone}</p>
                        )}
                      </div>

                      {/* Items List */}
                      <div className="space-y-1.5 border-t border-slate-800 pt-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Order Items:</p>
                        {items.map((it: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-xs font-bold text-slate-200 bg-slate-800/50 p-2 rounded-xl">
                            <span>{it.quantity}x {it.name || it.itemName || it.item_name}</span>
                            <span className="text-slate-400 text-[11px]">₹{(it.price || 0) * it.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => updateOrderStatus(ord.id, 'PREPARING')}
                        className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-lg shadow-orange-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <span>🍳 Accept &amp; Start Cooking</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                          <div key={idx} className="bg-slate-800 p-2 rounded-xl text-xs font-bold text-slate-200 flex justify-between">
                            <span>{it.quantity}x {it.name || it.itemName || it.item_name}</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                          Packed &amp; Ready
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

        {/* 6. TAB CONTENT: MENU & ITEM MANAGEMENT */}
        {currentTab === 'menu' && (
          <div className="space-y-4">
            {/* Top Toolbar */}
            <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>Menu Catalog</span>
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                      {menuItems.length} Dishes
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Manage dishes, pricing, images, and live stock availability</p>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-600/25 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span>+</span>
                  <span>Add New Dish</span>
                </button>
              </div>

              {/* Filters & Search Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                {/* Search */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
                  <input
                    type="text"
                    placeholder="Search dishes..."
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Categories ({menuItems.length})</option>
                    {uniqueCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat} ({menuItems.filter((i) => i.category === cat).length})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Veg / Non-Veg Filter */}
                <div className="flex gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                  <button
                    onClick={() => setVegFilter('all')}
                    className={`flex-1 py-1 rounded-lg font-bold transition-all ${
                      vegFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setVegFilter('veg')}
                    className={`flex-1 py-1 rounded-lg font-bold transition-all ${
                      vegFilter === 'veg' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🟢 Veg
                  </button>
                  <button
                    onClick={() => setVegFilter('nonveg')}
                    className={`flex-1 py-1 rounded-lg font-bold transition-all ${
                      vegFilter === 'nonveg' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🔴 Non-Veg
                  </button>
                </div>
              </div>
            </div>

            {/* Menu Items Grid */}
            {filteredMenuItems.length === 0 ? (
              <div className="bg-slate-900/60 rounded-3xl p-12 text-center border border-slate-800 text-xs text-slate-500 space-y-2">
                <p className="text-3xl">🍽️</p>
                <p>No dishes found matching your search or filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMenuItems.map((dish) => (
                  <div
                    key={dish.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-4 flex flex-col justify-between gap-3 shadow-xl transition-all"
                  >
                    <div className="flex gap-3 items-start">
                      {/* Dish Thumbnail */}
                      <div className="h-16 w-16 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                        <img
                          src={dish.image_url || dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80'}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Dish Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`h-2 w-2 rounded-full shrink-0 ${dish.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase truncate">{dish.category}</span>
                          {dish.isBestseller && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 rounded font-black">
                              ★ Bestseller
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-black text-white leading-snug">{dish.name}</h4>
                        <p className="text-xs font-black text-orange-400 mt-0.5">₹{dish.price}</p>
                        {dish.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{dish.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Action Bar: Availability & Edit / Delete */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => toggleItemAvailability(dish.id)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                          dish.isAvailable
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                        }`}
                      >
                        {dish.isAvailable ? '● In Stock' : '○ Sold Out'}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditItem(dish)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-xl font-bold transition-all"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(dish.id)}
                          className="text-slate-500 hover:text-rose-400 text-xs p-1.5 rounded-xl hover:bg-slate-800 transition-all"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 7. TAB CONTENT: OUTLET PROFILE */}
        {currentTab === 'restaurant_profile' && (
          <div className="space-y-5 max-w-3xl">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-3xl overflow-hidden border-2 border-orange-500/40 bg-slate-950 shadow-xl shrink-0">
                    <img
                      src={currentRestaurant.image_url || '/logo-icon.png'}
                      alt={currentRestaurant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-md uppercase">
                      Campus Partner Profile
                    </span>
                    <h2 className="text-xl font-black text-white mt-1">{currentRestaurant.name}</h2>
                    <p className="text-xs text-slate-400">{currentRestaurant.description || 'Campus Canteen'}</p>
                  </div>
                </div>

                <button
                  onClick={handleOpenEditRestaurant}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-purple-600/20 transition-all"
                >
                  ✏️ Edit Profile
                </button>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800 pt-4 text-xs">
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Cuisines / Food Type</p>
                  <p className="font-bold text-slate-200">{currentRestaurant.cuisines || 'Multi-Cuisine'}</p>
                </div>
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Batch Delivery Wave</p>
                  <p className="font-bold text-slate-200">{currentRestaurant.delivery_time || 'Slot 6:00 - 7:00 PM'}</p>
                </div>
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Avg Price for Two</p>
                  <p className="font-bold text-emerald-400">₹{currentRestaurant.price_for_two || 150}</p>
                </div>
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Partner Contact</p>
                  <p className="font-bold text-slate-200">{currentRestaurant.phone || '9876543210'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* 8. REGISTER NEW RESTAURANT MODAL */}
      {showAddRestaurantModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white">Register New Restaurant Outlet</h3>
                <p className="text-xs text-slate-400">Add another campus canteen or food stall</p>
              </div>
              <button
                onClick={() => setShowAddRestaurantModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterNewRestaurant} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Restaurant / Canteen Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. South Mess & Food Court"
                  value={newRestaurantForm.name}
                  onChange={(e) => setNewRestaurantForm({ ...newRestaurantForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Cuisine Specialties
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Biryani, South Indian, Rolls"
                    value={newRestaurantForm.cuisines}
                    onChange={(e) => setNewRestaurantForm({ ...newRestaurantForm, cuisines: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Price for Two (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="180"
                    value={newRestaurantForm.price_for_two}
                    onChange={(e) => setNewRestaurantForm({ ...newRestaurantForm, price_for_two: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Tagline / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Freshly made campus snacks and meal bowls"
                  value={newRestaurantForm.description}
                  onChange={(e) => setNewRestaurantForm({ ...newRestaurantForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Delivery Slot
                  </label>
                  <select
                    value={newRestaurantForm.delivery_time}
                    onChange={(e) => setNewRestaurantForm({ ...newRestaurantForm, delivery_time: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Slot 6:00 - 7:00 PM">Evening Slot (6:00 - 7:00 PM)</option>
                    <option value="Slot 7:00 - 8:00 PM">Evening Slot (7:00 - 8:00 PM)</option>
                    <option value="Night Slot 9:30 - 10:30 PM">Night Slot (9:30 - 10:30 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Partner Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    value={newRestaurantForm.phone}
                    onChange={(e) => setNewRestaurantForm({ ...newRestaurantForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Cover Image Preset Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                  Select Cover Image Preset
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewRestaurantForm({ ...newRestaurantForm, image_url: preset.url })}
                      className={`h-14 rounded-xl overflow-hidden border relative group transition-all ${
                        newRestaurantForm.image_url === preset.url
                          ? 'border-orange-500 ring-2 ring-orange-500/50'
                          : 'border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-[9px] font-black text-white text-center px-1">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRestaurantModal(false)}
                  className="flex-1 bg-slate-800 text-slate-400 font-bold py-3 rounded-xl text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black py-3 rounded-xl text-xs uppercase shadow-lg shadow-orange-600/30"
                >
                  Register Outlet ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. EDIT RESTAURANT PROFILE MODAL */}
      {showEditRestaurantModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Edit Restaurant Profile</h3>
              <button
                onClick={() => setShowEditRestaurantModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditRestaurant} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  value={editRestaurantForm.name}
                  onChange={(e) => setEditRestaurantForm({ ...editRestaurantForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Cuisines
                  </label>
                  <input
                    type="text"
                    value={editRestaurantForm.cuisines}
                    onChange={(e) => setEditRestaurantForm({ ...editRestaurantForm, cuisines: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Price for Two (₹)
                  </label>
                  <input
                    type="number"
                    value={editRestaurantForm.price_for_two}
                    onChange={(e) => setEditRestaurantForm({ ...editRestaurantForm, price_for_two: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editRestaurantForm.description}
                  onChange={(e) => setEditRestaurantForm({ ...editRestaurantForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Delivery Slot
                  </label>
                  <select
                    value={editRestaurantForm.delivery_time}
                    onChange={(e) => setEditRestaurantForm({ ...editRestaurantForm, delivery_time: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Slot 6:00 - 7:00 PM">Evening Slot (6:00 - 7:00 PM)</option>
                    <option value="Slot 7:00 - 8:00 PM">Evening Slot (7:00 - 8:00 PM)</option>
                    <option value="Night Slot 9:30 - 10:30 PM">Night Slot (9:30 - 10:30 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={editRestaurantForm.phone}
                    onChange={(e) => setEditRestaurantForm({ ...editRestaurantForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditRestaurantModal(false)}
                  className="flex-1 bg-slate-800 text-slate-400 font-bold py-3 rounded-xl text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-black py-3 rounded-xl text-xs uppercase shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. ADD DISH MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white">Add New Dish</h3>
                <p className="text-[11px] text-slate-400">To {currentRestaurant.name}</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Special Butter Paneer Masala"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="140"
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
                  <input
                    type="text"
                    placeholder="Main Course / Snacks / Biryani"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Description / Portion
                </label>
                <input
                  type="text"
                  placeholder="e.g. Served with 2 warm butter naans & salad"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Food Type */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Food Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewItem({ ...newItem, isVeg: true })}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
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
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      !newItem.isVeg
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    🔴 Non-Veg
                  </button>
                </div>
              </div>

              {/* Bestseller Toggle */}
              <label className="flex items-center gap-2 cursor-pointer bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <input
                  type="checkbox"
                  checked={newItem.isBestseller}
                  onChange={(e) => setNewItem({ ...newItem, isBestseller: e.target.checked })}
                  className="h-4 w-4 rounded text-orange-600 focus:ring-orange-500 border-slate-600"
                />
                <span className="text-xs font-bold text-slate-200">★ Mark as Chef&apos;s Bestseller Special</span>
              </label>

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

      {/* 11. EDIT DISH MODAL */}
      {showEditItemModal && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Edit Dish</h3>
              <button
                onClick={() => setShowEditItemModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditItem} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Dish Name
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
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
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Food Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem({ ...editingItem, isVeg: true })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      editingItem.isVeg
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    🟢 Pure Veg
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingItem({ ...editingItem, isVeg: false })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      !editingItem.isVeg
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
                  onClick={() => setShowEditItemModal(false)}
                  className="flex-1 bg-slate-800 text-slate-400 font-bold py-3 rounded-xl text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl text-xs uppercase shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}