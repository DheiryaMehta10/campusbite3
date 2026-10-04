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
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}

const SAMPLE_ITEMS: Record<string, FoodItem[]> = {
  default: [
    { id: 'item-1', name: 'Paneer Butter Masala Combo', price: 140, description: 'Rich paneer butter masala served with 2 butter naans & salad', isVeg: true, category: 'Main Course', isAvailable: true },
    { id: 'item-2', name: 'Chicken Biryani Bowl', price: 160, description: 'Fragrant dum biryani with succulent chicken piece, raita & salan', isVeg: false, category: 'Main Course', isAvailable: true },
    { id: 'item-3', name: 'Crispy Veg Spring Rolls', price: 80, description: 'Golden fried rolls stuffed with crunchy seasoned vegetables', isVeg: true, category: 'Starters', isAvailable: true },
    { id: 'item-4', name: 'Chicken 65 (6 pcs)', price: 120, description: 'Spicy, deep-fried chicken bites tossed with curry leaves', isVeg: false, category: 'Starters', isAvailable: true },
    { id: 'item-5', name: 'Cold Coffee with Ice Cream', price: 60, description: 'Thick creamy blended coffee topped with vanilla ice cream', isVeg: true, category: 'Beverages', isAvailable: true },
    { id: 'item-6', name: 'Hot Gulab Jamun (2 pcs)', price: 40, description: 'Soft melt-in-mouth milk solids soaked in warm cardamom syrup', isVeg: true, category: 'Desserts', isAvailable: true },
    { id: 'item-7', name: 'Cheese Burst Veg Burger', price: 95, description: 'Crispy patty loaded with molten cheese, lettuce and signature sauce', isVeg: true, category: 'Snacks', isAvailable: true },
    { id: 'item-8', name: 'Masala Dosa with Sambar', price: 75, description: 'Crispy golden crepe filled with potato masala, coconut chutney & hot sambar', isVeg: true, category: 'South Indian', isAvailable: true },
  ],
};

const RESTAURANT_NAMES: Record<string, string> = {
  'canteen-1': 'North Campus Central Canteen',
  'canteen-2': 'South Mess & Food Court',
  'canteen-3': 'Night Canteen & Snacks Hub',
  'canteen-4': 'Campus Chai & Fast Food Corner',
};

export default function RestaurantPage() {
  const router = useRouter();
  const params = useParams();
  const restaurantId = (params?.id as string) || 'canteen-1';
  const restaurantName = RESTAURANT_NAMES[restaurantId] || 'Campus Canteen';

  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterVegOnly, setFilterVegOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  });

  useEffect(() => {
    // Load existing cart from localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem('cb_cart');
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
    fetchMenu();
  }, [restaurantId]);

  const fetchMenu = async () => {
    setLoading(true);
    let menuLoaded: FoodItem[] = [];

    if (typeof window !== 'undefined') {
      try {
        const savedMenu = localStorage.getItem('cb_restaurant_menu');
        if (savedMenu) {
          menuLoaded = JSON.parse(savedMenu);
        }
      } catch {}
    }

    if (menuLoaded.length === 0) {
      try {
        const res = await api.get(`/api/restaurants/${restaurantId}/menu`);
        if (res.data?.data && res.data.data.length > 0) {
          menuLoaded = res.data.data;
        } else {
          menuLoaded = SAMPLE_ITEMS[restaurantId] || SAMPLE_ITEMS.default;
        }
      } catch (error) {
        menuLoaded = SAMPLE_ITEMS[restaurantId] || SAMPLE_ITEMS.default;
      }
    }

    setItems(menuLoaded);
    setLoading(false);
  };

  const updateCartStorage = (newCart: CartItem[]) => {
    setCart(newCart);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cb_cart', JSON.stringify(newCart));
    }
  };

  const getItemQuantity = (itemId: string) => {
    const found = cart.find((i) => i.id === itemId);
    return found ? found.quantity : 0;
  };

  const handleAddItem = (item: FoodItem) => {
    // Check if cart has items from another restaurant
    if (cart.length > 0 && cart[0].restaurantId !== restaurantId) {
      if (confirm('Your cart contains items from another canteen. Clear cart and add this item?')) {
        const newCart: CartItem[] = [{
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          restaurantId,
          restaurantName,
        }];
        updateCartStorage(newCart);
      }
      return;
    }

    const existingIndex = cart.findIndex((i) => i.id === item.id);
    let newCart = [...cart];
    if (existingIndex > -1) {
      newCart[existingIndex].quantity += 1;
    } else {
      newCart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        restaurantId,
        restaurantName,
      });
    }
    updateCartStorage(newCart);
  };

  const handleRemoveItem = (itemId: string) => {
    const existingIndex = cart.findIndex((i) => i.id === itemId);
    if (existingIndex > -1) {
      let newCart = [...cart];
      if (newCart[existingIndex].quantity > 1) {
        newCart[existingIndex].quantity -= 1;
      } else {
        newCart.splice(existingIndex, 1);
      }
      updateCartStorage(newCart);
    }
  };

  const totalCartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalCartValue = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category || 'General')))];

  const filteredItems = items.filter((item) => {
    const isVeg = item.isVeg ?? item.is_veg ?? true;
    if (filterVegOnly && !isVeg) return false;
    if (selectedCategory !== 'All' && (item.category || 'General') !== selectedCategory) return false;
    if (searchQuery.trim() && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Top Header */}
      <div className="bg-white border-b sticky top-0 z-30 px-4 py-3 flex items-center justify-between shadow-sm">
        <button
          onClick={() => router.push('/home')}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium text-sm"
        >
          <span className="text-lg">←</span> Back
        </button>
        <h1 className="font-bold text-gray-900 text-base truncate max-w-[200px] sm:max-w-xs">{restaurantName}</h1>
        <Link href="/cart" className="relative p-2 text-gray-700">
          🛒
          {totalCartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {totalCartCount}
            </span>
          )}
        </Link>
      </div>

      {/* Restaurant Banner Card */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-6 shadow-inner">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block bg-white/20 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
            Campus Partner • Slot Delivery Only
          </div>
          <h2 className="text-2xl font-black mb-1">{restaurantName}</h2>
          <p className="text-orange-100 text-sm mb-3">Freshly prepared hostel food • High hygiene certified</p>
          <div className="flex flex-wrap gap-4 text-xs font-medium text-white/90">
            <span className="flex items-center gap-1">⭐ 4.5 (340+ reviews)</span>
            <span className="flex items-center gap-1">⏱ Slot 6–7 PM & 7–8 PM</span>
            <span className="flex items-center gap-1">📍 Hostel Campus Hub</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="max-w-3xl mx-auto p-4 space-y-3">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search in this menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={() => setFilterVegOnly(!filterVegOnly)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
              filterVegOnly
                ? 'bg-green-600 text-white border-green-600 shadow-sm'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-green-500 inline-block"></span>
            Veg Only
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items List */}
        <div className="pt-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            {selectedCategory === 'All' ? 'Full Menu' : selectedCategory} ({filteredItems.length})
          </h3>

          {loading ? (
            <div className="py-12 text-center text-gray-500 text-sm">Loading delicious food items...</div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <p className="text-3xl mb-2">🍽</p>
              <p className="text-gray-700 font-semibold text-sm">No items found</p>
              <p className="text-gray-500 text-xs mt-1">Try clearing filters or search term</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const isVeg = item.isVeg ?? item.is_veg ?? true;
                const isAvail = item.isAvailable ?? item.is_available ?? true;
                const qty = getItemQuantity(item.id);

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex justify-between gap-4 items-center transition-all hover:border-orange-200"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`h-4 w-4 border flex items-center justify-center rounded-sm ${
                            isVeg ? 'border-green-600' : 'border-red-600'
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`}
                          ></span>
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm truncate">{item.name}</h4>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">₹{item.price}</p>
                      {item.description && (
                        <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.description}</p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {!isAvail ? (
                        <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg font-medium">
                          Sold Out
                        </span>
                      ) : qty === 0 ? (
                        <button
                          onClick={() => handleAddItem(item)}
                          className="bg-orange-50 text-orange-600 border border-orange-300 hover:bg-orange-600 hover:text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                        >
                          ADD +
                        </button>
                      ) : (
                        <div className="flex items-center bg-orange-600 text-white rounded-xl shadow-md overflow-hidden">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="px-3 py-1.5 hover:bg-orange-700 font-bold text-sm"
                          >
                            −
                          </button>
                          <span className="px-2 text-xs font-bold">{qty}</span>
                          <button
                            onClick={() => handleAddItem(item)}
                            className="px-3 py-1.5 hover:bg-orange-700 font-bold text-sm"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Cart Bar */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t shadow-2xl z-40">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">
                {totalCartCount} item{totalCartCount > 1 ? 's' : ''} added
              </p>
              <p className="text-lg font-black text-gray-900">₹{totalCartValue}</p>
            </div>
            <Link
              href="/cart"
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md flex items-center gap-2 transition-transform active:scale-95"
            >
              View Cart ➔
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}