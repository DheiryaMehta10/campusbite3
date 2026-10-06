'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

interface FoodItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  isVeg?: boolean;
  is_veg?: boolean;
  category?: string;
  image?: string;
  isAvailable?: boolean;
  is_available?: boolean;
  isBestseller?: boolean;
  rating?: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}

const DEFAULT_MENU_ITEMS: FoodItem[] = [
  {
    id: 'item-1',
    name: 'Paneer Butter Masala Combo',
    price: 140,
    description: 'Rich cottage cheese in creamy tomato butter gravy served with 2 fresh butter naans & salad',
    isVeg: true,
    category: 'Main Course',
    isAvailable: true,
    isBestseller: true,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'item-2',
    name: 'Chicken Biryani Bowl',
    price: 160,
    description: 'Fragrant dum cooked long-grain rice with succulent chicken piece, raita & spicy mirchi salan',
    isVeg: false,
    category: 'Main Course',
    isAvailable: true,
    isBestseller: true,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'item-3',
    name: 'Crispy Veg Spring Rolls (4 pcs)',
    price: 80,
    description: 'Crispy golden rolls filled with crunchy seasoned oriental vegetables & sweet chili dip',
    isVeg: true,
    category: 'Starters',
    isAvailable: true,
    isBestseller: false,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'item-4',
    name: 'Chicken 65 (Crispy 6 pcs)',
    price: 120,
    description: 'Spicy marinated deep-fried tender chicken bites tossed with fresh curry leaves and garlic',
    isVeg: false,
    category: 'Starters',
    isAvailable: true,
    isBestseller: true,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'item-5',
    name: 'Cold Coffee with Ice Cream',
    price: 60,
    description: 'Creamy blended cold brew coffee topped with a velvety scoop of vanilla ice cream',
    isVeg: true,
    category: 'Beverages',
    isAvailable: true,
    isBestseller: true,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'item-6',
    name: 'Hot Gulab Jamun (2 pcs)',
    price: 40,
    description: 'Melt-in-mouth milk dumplings soaked in warm rose and cardamom flavored sugar syrup',
    isVeg: true,
    category: 'Desserts',
    isAvailable: true,
    isBestseller: false,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'item-7',
    name: 'Cheese Burst Veg Burger',
    price: 95,
    description: 'Crisp vegetable patty with molten cheese core, garden tomatoes, fresh lettuce & chipotle sauce',
    isVeg: true,
    category: 'Snacks',
    isAvailable: true,
    isBestseller: true,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'item-8',
    name: 'Masala Dosa with Sambar & Chutney',
    price: 75,
    description: 'Crispy golden fermented crepe stuffed with spiced potato masala, served with piping hot sambar',
    isVeg: true,
    category: 'South Indian',
    isAvailable: true,
    isBestseller: false,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80',
  },
];

const RESTAURANT_DETAILS: Record<string, { name: string; cuisines: string; rating: number; address: string; image: string }> = {
  '550e8400-e29b-41d4-a716-446655440001': {
    name: 'North Campus Central Canteen',
    cuisines: 'North Indian • Street Food • Thalis • Beverages',
    rating: 4.6,
    address: 'North Academic Block Ground Floor',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
  },
  '550e8400-e29b-41d4-a716-446655440002': {
    name: 'South Mess & Food Court',
    cuisines: 'Hyderabadi Biryani • South Indian • Combos',
    rating: 4.5,
    address: 'South Residential Complex',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
  },
  '550e8400-e29b-41d4-a716-446655440003': {
    name: 'Night Canteen & Snacks Hub',
    cuisines: 'Fast Food • Starters • Rolls • Maggi',
    rating: 4.4,
    address: 'Tagore Hostel Quadrangle',
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80',
  },
  '550e8400-e29b-41d4-a716-446655440004': {
    name: 'Campus Chai & Fast Food Corner',
    cuisines: 'Tea • Burgers • Sandwiches • Cold Coffee',
    rating: 4.7,
    address: 'Library Annexe Plaza',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&auto=format&fit=crop&q=80',
  },
  'canteen-1': {
    name: 'North Campus Central Canteen',
    cuisines: 'North Indian • Street Food • Thalis • Beverages',
    rating: 4.6,
    address: 'North Academic Block Ground Floor',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
  },
};

export default function RestaurantPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = (params?.id as string) || '550e8400-e29b-41d4-a716-446655440001';

  const [restInfo, setRestInfo] = useState<{
    name: string;
    cuisines: string;
    rating: number;
    address: string;
    image: string;
    deliveryTime?: string;
  }>(() => {
    const base = RESTAURANT_DETAILS[rawId] || RESTAURANT_DETAILS['550e8400-e29b-41d4-a716-446655440001'];
    return { ...base };
  });

  const [menuItems, setMenuItems] = useState<FoodItem[]>(DEFAULT_MENU_ITEMS);
  const [loading, setLoading] = useState(false);
  const [vegOnly, setVegOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);

  const api = axios.create({ baseURL: '' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem('cb_cart');
        if (savedCart) setCart(JSON.parse(savedCart));
      } catch (e) {}
    }
    loadRestaurantProfile();
    fetchMenu();

    const interval = setInterval(() => {
      loadRestaurantProfile();
      fetchMenu();
    }, 3000);
    return () => clearInterval(interval);
  }, [rawId]);

  const loadRestaurantProfile = async () => {
    try {
      const res = await api.get('/api/restaurants');
      if (res.data?.data && Array.isArray(res.data.data)) {
        const match = res.data.data.find((r: any) => r.id === rawId);
        if (match) {
          setRestInfo({
            name: match.name,
            cuisines: match.cuisines || 'Multi-Cuisine',
            rating: match.rating || 4.8,
            address: match.description || 'Campus Food Block',
            image: match.image_url || match.image || RESTAURANT_DETAILS['550e8400-e29b-41d4-a716-446655440001'].image,
            deliveryTime: match.delivery_time || 'Slot 6:00 - 7:00 PM',
          });
          return;
        }
      }
    } catch {}

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cb_all_restaurants');
        if (saved) {
          const list = JSON.parse(saved);
          const match = list.find((r: any) => r.id === rawId);
          if (match) {
            setRestInfo({
              name: match.name,
              cuisines: match.cuisines || 'Multi-Cuisine',
              rating: match.rating || 4.8,
              address: match.description || 'Campus Food Block',
              image: match.image_url || match.image || RESTAURANT_DETAILS['550e8400-e29b-41d4-a716-446655440001'].image,
              deliveryTime: match.delivery_time || 'Slot 6:00 - 7:00 PM',
            });
          }
        }
      } catch {}
    }
  };

  const fetchMenu = async () => {
    try {
      const res = await api.get(`/api/restaurants/${rawId}/menu`);
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setMenuItems(res.data.data);
        return;
      }
    } catch (e) {}

    if (typeof window !== 'undefined') {
      try {
        const localMenu = localStorage.getItem(`cb_restaurant_menu_${rawId}`);
        if (localMenu) {
          const parsed = JSON.parse(localMenu);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMenuItems(parsed);
            return;
          }
        }
      } catch {}
    }
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

  const handleAddDish = (dish: FoodItem) => {
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
        restaurantId: rawId,
        restaurantName: restInfo.name,
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

  const categories = ['All', ...Array.from(new Set(menuItems.map((i) => i.category || 'Special')))];

  const filteredItems = menuItems.filter((dish) => {
    const isV = dish.isVeg !== undefined ? dish.isVeg : dish.is_veg;
    if (vegOnly && !isV) return false;
    if (selectedCategory !== 'All' && (dish.category || 'Special') !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return dish.name.toLowerCase().includes(q) || (dish.description || '').toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 font-sans selection:bg-orange-500 selection:text-white">
      {/* 1. TOP HERO BANNER & HEADER */}
      <div className="relative h-60 w-full bg-gray-900">
        <img
          src={restInfo.image}
          alt={restInfo.name}
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-black/40 to-black/60"></div>

        {/* Top Floating Back and Share */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <button
            onClick={() => router.back()}
            className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-md text-gray-800 font-bold flex items-center justify-center shadow-md hover:bg-white transition-all active:scale-95"
          >
            ←
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => alert('Link copied to clipboard!')}
              className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-md text-gray-800 font-bold flex items-center justify-center shadow-md hover:bg-white transition-all active:scale-95"
            >
              🔗
            </button>
          </div>
        </div>
      </div>

      {/* 2. RESTAURANT DETAILS FLOATING CARD (SWIGGY STYLE) */}
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 -mt-20 relative z-20 space-y-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xl space-y-3">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">{restInfo.name}</h1>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{restInfo.cuisines}</p>
              <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1 mt-1">
                <span>📍</span> {restInfo.address}
              </p>
            </div>

            <div className="bg-green-700 text-white px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 shadow-sm shrink-0">
              <span>★</span> {restInfo.rating}
            </div>
          </div>

          <div className="border-t border-dashed border-gray-200 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-gray-700">
            <div className="flex items-center gap-1.5 text-orange-600 font-black">
              <span>🕒</span>
              <span>Next Slot: 6:00 PM – 7:00 PM</span>
            </div>
            <div className="bg-orange-50 text-orange-800 px-2.5 py-0.5 rounded-lg text-[10px] uppercase font-black tracking-wider">
              Free Hostel Delivery
            </div>
          </div>
        </div>

        {/* 3. SEARCH & VEG FILTER BAR */}
        <div className="bg-white rounded-2xl p-2.5 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
            <input
              type="text"
              placeholder={`Search in ${restInfo.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-1.5 bg-gray-50 text-xs font-medium rounded-xl border border-transparent focus:bg-white focus:border-orange-500 outline-none"
            />
          </div>

          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 shrink-0 ${
              vegOnly ? 'bg-green-50 text-green-700 border-green-300 shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${vegOnly ? 'bg-green-600' : 'bg-gray-300'}`}></span>
            Veg Only
          </button>
        </div>

        {/* 4. CATEGORY CHIPS */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100 shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 5. SWIGGY-STYLE DISH MENU LIST */}
        <div className="space-y-3 pt-1">
          {filteredItems.map((dish) => {
            const qty = getItemQuantity(dish.id);
            const isV = dish.isVeg !== undefined ? dish.isVeg : dish.is_veg;
            const imgSrc = dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500';

            return (
              <div
                key={dish.id}
                className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all flex justify-between gap-3 relative overflow-hidden group"
              >
                {/* Left Dish Details */}
                <div className="flex-1 flex flex-col justify-between pr-2">
                  <div>
                    {/* Veg / Non-Veg Indicator + Bestseller */}
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`inline-flex items-center justify-center h-4 w-4 rounded-sm border ${
                          isV ? 'border-green-600' : 'border-red-600'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${isV ? 'bg-green-600' : 'bg-red-600'}`}
                        ></span>
                      </span>

                      {dish.isBestseller && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          ★ Bestseller
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {dish.name}
                    </h3>
                    <p className="text-xs font-black text-gray-900 mt-0.5">₹{dish.price}</p>
                    <p className="text-[11px] text-gray-400 font-medium line-clamp-2 mt-1 leading-relaxed">
                      {dish.description}
                    </p>
                  </div>
                </div>

                {/* Right Image + Swiggy Floating Button */}
                <div className="relative flex flex-col items-center justify-between w-28 shrink-0">
                  <div className="h-24 w-28 rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
                    <img
                      src={imgSrc}
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

      {/* 6. SWIGGY-STYLE FLOATING BOTTOM CART BAR */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-6 left-0 right-0 z-40 px-4 max-w-md md:max-w-2xl lg:max-w-4xl mx-auto animate-bounce-short">
          <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-green-500/30">
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
              className="bg-white text-green-800 hover:bg-green-50 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1 active:scale-95 transition-all"
            >
              <span>View Cart</span>
              <span>➔</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}