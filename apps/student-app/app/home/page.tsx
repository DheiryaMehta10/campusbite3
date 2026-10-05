'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  rating?: number;
  operational_status?: string;
  operationalStatus?: string;
  cuisines?: string;
  deliveryTime?: string;
  priceForTwo?: number;
}

interface DishItem {
  id: string;
  name: string;
  price: number;
  description: string;
  isVeg: boolean;
  category: string;
  restaurantId: string;
  restaurantName: string;
  rating: number;
  image: string;
  isBestseller?: boolean;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}

const DEFAULT_RESTAURANTS: Restaurant[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'North Campus Central Canteen',
    description: 'North Indian • Thalis • Butter Naan • Beverages',
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    rating: 4.6,
    operational_status: 'open',
    cuisines: 'North Indian, Street Food, Chinese',
    deliveryTime: 'Slot 6:00 - 7:00 PM',
    priceForTwo: 180,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'South Mess & Food Court',
    description: 'Hyderabadi Biryani • South Indian • Meals & Combos',
    image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    rating: 4.5,
    operational_status: 'open',
    cuisines: 'Biryani, South Indian, Dosa',
    deliveryTime: 'Slot 6:00 - 7:00 PM',
    priceForTwo: 220,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Night Canteen & Snacks Hub',
    description: 'Fast Food • Crispy Starters • Rolls • Maggi',
    image_url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80',
    rating: 4.4,
    operational_status: 'open',
    cuisines: 'Snacks, Burgers, Fast Food',
    deliveryTime: 'Night Slot 9:30 - 10:30 PM',
    priceForTwo: 150,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Campus Chai & Fast Food Corner',
    description: 'Burgers • Sandwiches • Kulhad Chai • Cold Coffee',
    image_url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    operational_status: 'open',
    cuisines: 'Tea, Coffee, Sandwiches, Burgers',
    deliveryTime: 'Slot 6:00 - 7:00 PM',
    priceForTwo: 120,
  },
];

const POPULAR_DISHES: DishItem[] = [
  {
    id: 'dish-1',
    name: 'Paneer Butter Masala Combo',
    price: 140,
    description: 'Rich velvety cottage cheese gravy served with 2 warm butter naans & fresh salad',
    isVeg: true,
    category: 'Main Course',
    restaurantId: '550e8400-e29b-41d4-a716-446655440001',
    restaurantName: 'North Campus Central Canteen',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80',
    isBestseller: true,
  },
  {
    id: 'dish-2',
    name: 'Chicken Biryani Bowl',
    price: 160,
    description: 'Authentic Hyderabadi aromatic long grain dum biryani with juicy tender chicken & cooling raita',
    isVeg: false,
    category: 'Biryani',
    restaurantId: '550e8400-e29b-41d4-a716-446655440002',
    restaurantName: 'South Mess & Food Court',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
    isBestseller: true,
  },
  {
    id: 'dish-3',
    name: 'Crispy Veg Spring Rolls',
    price: 80,
    description: 'Golden crunchy rolls loaded with seasoned cabbage, carrots & sweet chili dip',
    isVeg: true,
    category: 'Snacks',
    restaurantId: '550e8400-e29b-41d4-a716-446655440003',
    restaurantName: 'Night Canteen & Snacks Hub',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
    isBestseller: false,
  },
  {
    id: 'dish-4',
    name: 'Thick Cold Coffee with Ice Cream',
    price: 60,
    description: 'Rich creamy blended cold coffee crowned with a generous scoop of vanilla ice cream',
    isVeg: true,
    category: 'Beverages',
    restaurantId: '550e8400-e29b-41d4-a716-446655440004',
    restaurantName: 'Campus Chai & Fast Food Corner',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80',
    isBestseller: true,
  },
  {
    id: 'dish-5',
    name: 'Cheese Burst Veg Burger',
    price: 95,
    description: 'Juicy vegetable patty oozing with molten cheddar, fresh tomato, crisp lettuce & signature sauce',
    isVeg: true,
    category: 'Burgers',
    restaurantId: '550e8400-e29b-41d4-a716-446655440004',
    restaurantName: 'Campus Chai & Fast Food Corner',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    isBestseller: true,
  },
  {
    id: 'dish-6',
    name: 'Hot Gulab Jamun (2 pcs)',
    price: 40,
    description: 'Traditional melt-in-mouth warm khoya dumplings soaked in rose cardamom sugar syrup',
    isVeg: true,
    category: 'Desserts',
    restaurantId: '550e8400-e29b-41d4-a716-446655440001',
    restaurantName: 'North Campus Central Canteen',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80',
    isBestseller: false,
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🍽️' },
  { id: 'Main Course', label: 'Thali & Meals', icon: '🍛' },
  { id: 'Biryani', label: 'Biryani', icon: '🍗' },
  { id: 'Burgers', label: 'Burgers', icon: '🍔' },
  { id: 'Snacks', label: 'Snacks & Rolls', icon: '🍟' },
  { id: 'Beverages', label: 'Cold Coffee & Shakes', icon: '🥤' },
  { id: 'Desserts', label: 'Sweets', icon: '🍨' },
];

export default function HomePage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>(DEFAULT_RESTAURANTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [vegOnly, setVegOnly] = useState(false);
  const [userHostel, setUserHostel] = useState('');
  const [userRoom, setUserRoom] = useState('');
  const [userName, setUserName] = useState('Student');
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);

  const api = axios.create({ baseURL: '' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostel = localStorage.getItem('userHostel') || '';
      const room = localStorage.getItem('userRoom') || '';
      const name = localStorage.getItem('userName') || 'Student';
      setUserHostel(hostel);
      setUserRoom(room);
      setUserName(name);

      const savedCart = localStorage.getItem('cb_cart');
      if (savedCart) {
        try { setCart(JSON.parse(savedCart)); } catch {}
      }

      const orders = JSON.parse(localStorage.getItem('cb_orders') || '[]');
      const active = orders.filter((o: any) => {
        const s = String(o.orderStatus || o.order_status || '').toUpperCase();
        return s !== 'DELIVERED' && s !== 'CANCELLED';
      }).length;
      setActiveOrdersCount(active);
    }

    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const res = await api.get('/api/restaurants');
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setRestaurants(res.data.data);
      }
    } catch (e) {}
  };

  const updateCartStorage = (newCart: CartItem[]) => {
    setCart(newCart);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cb_cart', JSON.stringify(newCart));
    }
  };

  const getItemQuantity = (id: string) => {
    const item = cart.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

  const handleAddDish = (dish: DishItem) => {
    const updated = [...cart];
    const existingIndex = updated.findIndex((i) => i.id === dish.id);
    if (existingIndex > -1) {
      updated[existingIndex].quantity += 1;
    } else {
      updated.push({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        quantity: 1,
        restaurantId: dish.restaurantId,
        restaurantName: dish.restaurantName,
      });
    }
    updateCartStorage(updated);
  };

  const handleRemoveDish = (id: string) => {
    const updated = [...cart];
    const existingIndex = updated.findIndex((i) => i.id === id);
    if (existingIndex > -1) {
      if (updated[existingIndex].quantity > 1) {
        updated[existingIndex].quantity -= 1;
      } else {
        updated.splice(existingIndex, 1);
      }
      updateCartStorage(updated);
    }
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const filteredDishes = POPULAR_DISHES.filter((dish) => {
    if (vegOnly && !dish.isVeg) return false;
    if (selectedCategory !== 'all' && dish.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        dish.name.toLowerCase().includes(q) ||
        dish.description.toLowerCase().includes(q) ||
        dish.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredRestaurants = restaurants.filter((r) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (r.cuisines || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 text-gray-900 font-sans selection:bg-orange-500 selection:text-white">
      {/* 1. TOP SWIGGY-STYLE HEADER WITH LOCATION */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
        <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Location Pill & Brand Emblem */}
            <div className="flex items-center gap-2.5">
              <Link href="/home" className="h-9 w-9 rounded-2xl overflow-hidden border border-orange-500/30 shadow-md shadow-orange-500/10 bg-slate-950 flex-shrink-0 flex items-center justify-center hover:scale-105 transition-transform">
                <img src="/logo-icon.png" alt="CampusBite" className="w-full h-full object-cover" />
              </Link>
              <Link href="/profile" className="cursor-pointer group">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-gray-900 tracking-tight flex items-center gap-1 group-hover:text-orange-600 transition-colors">
                    {userHostel || 'Set Delivery Hostel'}
                    <span className="text-[10px] text-orange-600">▾</span>
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-gray-500 truncate max-w-[180px]">
                  {userRoom ? `Room ${userRoom} • Scheduled Delivery` : 'Tap to configure hostel & room'}
                </p>
              </Link>
            </div>

            {/* Profile Avatar / Quick Link */}
            <Link
              href="/profile"
              className="h-9 w-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center text-gray-700 text-xs font-black shadow-inner hover:ring-2 hover:ring-orange-500 transition-all"
            >
              {userName.slice(0, 1).toUpperCase()}
            </Link>
          </div>

          {/* Search Bar (Swiggy / Zomato style) */}
          <div className="mt-3 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search for biryani, butter paneer, cold coffee, snacks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-gray-100/80 hover:bg-gray-100 focus:bg-white text-xs font-medium rounded-2xl border border-transparent focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none text-gray-800 placeholder-gray-400 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold bg-gray-200 rounded-full h-4 w-4 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 pt-3 space-y-6">
        {/* 2. SWIGGY PROMOTIONAL HERO BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white p-5 shadow-lg shadow-orange-500/15">
          <div className="relative z-10 max-w-[70%] space-y-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white text-orange-600 uppercase tracking-widest shadow-sm">
              ⚡ LIVE SLOT WAVE
            </span>
            <h2 className="text-lg font-black tracking-tight leading-snug">
              Evening Canteen Slots Open!
            </h2>
            <p className="text-[11px] text-orange-100 font-medium">
              Free delivery to hostel lobbies. Use code <span className="font-bold underline text-white">FIRSTBITE</span> for 20% OFF!
            </p>
          </div>

          <div className="absolute right-2 -bottom-3 text-7xl opacity-90 select-none pointer-events-none drop-shadow-md">
            🍱
          </div>
        </div>

        {/* 3. CATEGORIES HORIZONTAL PILL CAROUSEL */}
        <div>
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">
              Explore Cravings
            </h3>
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
                vegOnly ? 'bg-green-50 text-green-700 border-green-300 shadow-sm' : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${vegOnly ? 'bg-green-600' : 'bg-gray-300'}`}></span>
              Pure Veg Only
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gray-900 text-white shadow-md shadow-gray-900/20 scale-[1.02]'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100 shadow-sm'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. POPULAR DISHES (SWIGGY FOOD CARDS WITH INSTANT QUANTITY ADDER) */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div>
              <h3 className="text-sm font-black text-gray-900">Campus Bestsellers</h3>
              <p className="text-[11px] text-gray-500">Student favorites cooked fresh for your slot</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredDishes.map((dish) => {
              const qty = getItemQuantity(dish.id);
              return (
                <div
                  key={dish.id}
                  className="bg-white rounded-3xl p-4 border border-gray-100/80 shadow-sm hover:shadow-md transition-all flex justify-between gap-3 relative overflow-hidden group"
                >
                  {/* Left Info */}
                  <div className="flex-1 flex flex-col justify-between pr-2">
                    <div>
                      {/* Veg / Non-Veg badge + Bestseller */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span
                          className={`inline-flex items-center justify-center h-4 w-4 rounded-sm border ${
                            dish.isVeg ? 'border-green-600' : 'border-red-600'
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${dish.isVeg ? 'bg-green-600' : 'bg-red-600'}`}
                          ></span>
                        </span>
                        {dish.isBestseller && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                            ★ Bestseller
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                        {dish.name}
                      </h4>
                      <p className="text-xs font-black text-gray-900 mt-1">₹{dish.price}</p>
                      <p className="text-[10px] text-gray-400 font-medium line-clamp-2 mt-1 leading-relaxed">
                        {dish.description}
                      </p>
                    </div>

                    <p className="text-[9px] font-bold text-orange-600/80 truncate mt-2">
                      📍 {dish.restaurantName}
                    </p>
                  </div>

                  {/* Right Image + Swiggy Floating Adder */}
                  <div className="relative flex flex-col items-center justify-between w-28 shrink-0">
                    <div className="h-24 w-28 rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    {/* Swiggy Button */}
                    <div className="absolute -bottom-1">
                      {qty === 0 ? (
                        <button
                          onClick={() => handleAddDish(dish)}
                          className="px-5 py-1.5 bg-white hover:bg-orange-50 text-green-700 hover:text-green-800 font-black text-xs uppercase tracking-wider rounded-xl shadow-md border border-gray-200 hover:border-green-300 active:scale-95 transition-all"
                        >
                          ADD +
                        </button>
                      ) : (
                        <div className="flex items-center bg-green-700 text-white rounded-xl shadow-md font-black text-xs px-1 py-0.5 border border-green-800">
                          <button
                            onClick={() => handleRemoveDish(dish.id)}
                            className="px-2 py-0.5 hover:bg-green-800 rounded text-xs transition-colors"
                          >
                            −
                          </button>
                          <span className="px-2 text-xs font-bold">{qty}</span>
                          <button
                            onClick={() => handleAddDish(dish)}
                            className="px-2 py-0.5 hover:bg-green-800 rounded text-xs transition-colors"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. CAMPUS CANTEENS & FOOD COURTS LIST */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div>
              <h3 className="text-sm font-black text-gray-900">Campus Canteens & Kitchens</h3>
              <p className="text-[11px] text-gray-500">Scheduled batch delivery directly to your hostel</p>
            </div>
          </div>

          <div className="space-y-4">
            {filteredRestaurants.map((res) => (
              <Link
                key={res.id}
                href={`/restaurant/${res.id}`}
                className="block bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group"
              >
                {/* Banner Image */}
                <div className="h-44 w-full rounded-2xl overflow-hidden relative bg-gray-100">
                  <img
                    src={res.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'}
                    alt={res.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>

                  {/* Rating Badge */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl text-[11px] font-black text-gray-900 shadow-sm flex items-center gap-1">
                    <span className="text-amber-500">★</span> {res.rating || 4.6}
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-green-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl shadow-md">
                      OPEN FOR ORDERS
                    </span>
                  </div>

                  {/* Bottom Text Over Image */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h4 className="text-base font-black leading-tight drop-shadow-sm">{res.name}</h4>
                    <p className="text-[11px] text-gray-200 font-medium truncate mt-0.5">
                      {res.description || res.cuisines}
                    </p>
                  </div>
                </div>

                {/* Restaurant Card Details */}
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500 pt-1">
                  <div className="flex items-center gap-1.5 font-bold text-gray-700">
                    <span>🕒</span>
                    <span className="text-orange-600 font-extrabold">{res.deliveryTime || 'Slot 6:00 - 7:00 PM'}</span>
                  </div>
                  <div className="font-semibold">
                    ₹{res.priceForTwo || 150} for two
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* 6. SWIGGY-STYLE FLOATING BOTTOM CART BAR */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-40 px-4 max-w-md md:max-w-2xl lg:max-w-4xl mx-auto animate-bounce-short">
          <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between border border-green-500/30">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center text-sm font-black">
                🛍️
              </div>
              <div>
                <p className="text-xs font-black tracking-wide">
                  {totalCartCount} {totalCartCount === 1 ? 'ITEM' : 'ITEMS'} ADDED
                </p>
                <p className="text-[11px] text-green-100 font-semibold">
                  Subtotal: ₹{totalCartPrice}
                </p>
              </div>
            </div>

            <Link
              href="/cart"
              className="bg-white text-green-800 hover:bg-green-50 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1 active:scale-95 transition-all"
            >
              <span>View Cart</span>
              <span>➔</span>
            </Link>
          </div>
        </div>
      )}

      {/* 7. PLAYSTORE MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 py-2">
        <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-6 flex justify-around items-center">
          <Link href="/home" className="flex flex-col items-center text-orange-600 font-black text-[10px] gap-0.5">
            <span className="text-lg">🍔</span>
            <span>Explore</span>
          </Link>

          <Link href="/orders" className="flex flex-col items-center text-gray-400 hover:text-gray-900 font-bold text-[10px] gap-0.5 relative">
            <span className="text-lg">📜</span>
            <span>Orders</span>
            {activeOrdersCount > 0 && (
              <span className="absolute -top-1 right-2 bg-orange-600 text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                {activeOrdersCount}
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