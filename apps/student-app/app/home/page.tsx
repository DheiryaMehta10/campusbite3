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
}

interface GroceryItem {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  price?: number;
  stock?: number;
}

interface MedicalItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  dosage_info?: string;
}

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'food' | 'grocery' | 'medical'>('food');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [medicalItems, setMedicalItems] = useState<MedicalItem[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userHostel, setUserHostel] = useState('Hostel Block A');

  const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || '' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      if (!storedUserId) {
        router.push('/auth/login');
        return;
      }
      const hostel = localStorage.getItem('userHostel');
      if (hostel) setUserHostel(hostel);

      const savedCart = localStorage.getItem('campusbite_cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch {}
      }
    }

    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [restRes, grocRes, medRes, banRes, annRes, slotRes] = await Promise.all([
        api.get('/api/restaurants').catch(() => ({ data: { data: [] } })),
        api.get('/api/grocery').catch(() => ({ data: { data: [] } })),
        api.get('/api/medical').catch(() => ({ data: { data: [] } })),
        api.get('/api/banners').catch(() => ({ data: { data: [] } })),
        api.get('/api/announcements').catch(() => ({ data: { data: [] } })),
        api.get('/api/slots').catch(() => ({ data: { data: [] } })),
      ]);

      setRestaurants(restRes.data.data || []);
      setGroceryItems(grocRes.data.data || []);
      setMedicalItems(medRes.data.data || []);
      setBanners(banRes.data.data || []);
      setAnnouncements(annRes.data.data || []);
      setSlots(slotRes.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: any, type: 'food' | 'grocery' | 'medical', price = 50) => {
    const updated = [...cart];
    const existing = updated.find((i) => i.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      updated.push({
        id: item.id,
        name: item.name,
        price: Number(item.price || price),
        quantity: 1,
        type,
      });
    }
    setCart(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('campusbite_cart', JSON.stringify(updated));
    }
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Top Mobile Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-orange-500/30">
              CB
            </div>
            <div>
              <div className="flex items-center text-xs font-bold text-gray-900">
                <span>📍 {userHostel}</span>
                <span className="ml-1 text-[10px] text-orange-600 font-normal">▼</span>
              </div>
              <p className="text-[10px] text-gray-500">Scheduled Slot Delivery</p>
            </div>
          </div>

          <Link href="/cart" className="relative p-2 bg-orange-50 hover:bg-orange-100 rounded-full transition-colors">
            <span className="text-xl">🛒</span>
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {totalCartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Search Bar */}
        <div className="max-w-lg mx-auto mt-2.5">
          <div className="relative">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search dishes, groceries, medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 hover:bg-gray-100/80 focus:bg-white text-xs font-medium rounded-xl border border-transparent focus:border-orange-500 focus:outline-none transition-all"
            />
          </div>
        </div>
      </header>

      {/* Announcements Pill */}
      {announcements.length > 0 && (
        <div className="max-w-lg mx-auto px-4 mt-3">
          <div className="bg-amber-50 border border-amber-200/70 text-amber-900 rounded-xl px-3.5 py-2 text-xs flex items-center space-x-2">
            <span className="text-base">📢</span>
            <span className="font-semibold">{announcements[0].title}:</span>
            <span className="truncate text-amber-800">{announcements[0].message}</span>
          </div>
        </div>
      )}

      {/* Hero Delivery Slot Status Banner */}
      <div className="max-w-lg mx-auto px-4 mt-3">
        <div className="bg-gradient-to-r from-slate-900 via-gray-900 to-orange-950 text-white p-4 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-center z-10 relative">
            <div>
              <span className="inline-block px-2.5 py-0.5 bg-orange-500 text-[10px] font-extrabold uppercase rounded-full tracking-wider mb-1">
                Next Delivery Slot
              </span>
              <h3 className="font-black text-lg text-white">Evening (6:00 PM – 7:00 PM)</h3>
              <p className="text-xs text-orange-200 mt-0.5">Order before <strong>5:50 PM</strong> cutoff for this slot</p>
            </div>
            <div className="text-3xl">⏰</div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-orange-500/20 rounded-full blur-xl"></div>
        </div>
      </div>

      {/* 3 Main Categories (Swiggy / Zomato Style) */}
      <div className="max-w-lg mx-auto px-4 mt-4">
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => setActiveTab('food')}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all ${
              activeTab === 'food'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-[1.02]'
                : 'bg-white text-gray-700 border border-gray-200/80 hover:bg-orange-50'
            }`}
          >
            <span className="text-2xl mb-1">🍔</span>
            <span className="text-xs font-bold">Food</span>
            <span className={`text-[9px] ${activeTab === 'food' ? 'text-orange-100' : 'text-gray-400'}`}>Canteen & Meals</span>
          </button>

          <button
            onClick={() => setActiveTab('grocery')}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all ${
              activeTab === 'grocery'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-[1.02]'
                : 'bg-white text-gray-700 border border-gray-200/80 hover:bg-orange-50'
            }`}
          >
            <span className="text-2xl mb-1">🛒</span>
            <span className="text-xs font-bold">Grocery</span>
            <span className={`text-[9px] ${activeTab === 'grocery' ? 'text-orange-100' : 'text-gray-400'}`}>Snacks & Essentials</span>
          </button>

          <button
            onClick={() => setActiveTab('medical')}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all ${
              activeTab === 'medical'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-[1.02]'
                : 'bg-white text-gray-700 border border-gray-200/80 hover:bg-orange-50'
            }`}
          >
            <span className="text-2xl mb-1">💊</span>
            <span className="text-xs font-bold">Medical</span>
            <span className={`text-[9px] ${activeTab === 'medical' ? 'text-orange-100' : 'text-gray-400'}`}>OTC Essentials</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-lg mx-auto px-4 mt-5">
        {/* 1. FOOD TAB */}
        {activeTab === 'food' && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">Campus Restaurants & Canteens</h2>
              <span className="text-xs text-orange-600 font-semibold">{restaurants.length} Outlets</span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-44 bg-gray-200 animate-pulse rounded-2xl"></div>
                ))}
              </div>
            ) : restaurants.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl text-center border border-gray-200">
                <span className="text-4xl">🍽️</span>
                <h3 className="font-bold text-gray-800 mt-2">No restaurants open</h3>
                <p className="text-xs text-gray-500 mt-1">Check back before the evening slot</p>
              </div>
            ) : (
              <div className="space-y-4">
                {restaurants
                  .filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((rest) => {
                    const status = rest.operational_status || rest.operationalStatus || 'open';
                    const isClosed = status === 'temporarily_closed';

                    return (
                      <Link key={rest.id} href={isClosed ? '#' : `/restaurant/${rest.id}`}>
                        <div className={`bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-sm hover:shadow-md transition-all group ${isClosed ? 'opacity-70 grayscale-[30%]' : ''}`}>
                          <div className="h-36 bg-gray-100 relative overflow-hidden">
                            <img
                              src={rest.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600'}
                              alt={rest.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2.5 right-2.5">
                              {isClosed ? (
                                <span className="bg-red-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow">
                                  TEMPORARILY CLOSED
                                </span>
                              ) : (
                                <span className="bg-green-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow">
                                  ● OPEN NOW
                                </span>
                              )}
                            </div>
                            <div className="absolute bottom-2 left-2.5 bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded-lg text-xs font-bold flex items-center">
                              ⭐ {rest.rating || 4.5}
                            </div>
                          </div>

                          <div className="p-4">
                            <h3 className="font-bold text-gray-900 text-base">{rest.name}</h3>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{rest.description || 'Thalis, Rolls, Snacks & Beverages'}</p>

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs">
                              <span className="text-gray-500">🛵 Slot: 6:00 – 7:00 PM</span>
                              <span className="text-orange-600 font-bold group-hover:translate-x-0.5 transition-transform">
                                {isClosed ? 'Closed' : 'View Menu →'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* 2. GROCERY TAB */}
        {activeTab === 'grocery' && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">Hostel Grocery Essentials</h2>
              <span className="text-xs text-orange-600 font-semibold">{groceryItems.length} Products</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {groceryItems.map((item) => (
                <div key={item.id} className="bg-white p-3 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
                  <div className="h-28 bg-gray-50 rounded-xl overflow-hidden mb-2">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-900 line-clamp-2">{item.name}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">{item.description || 'Hostel pantry staple'}</p>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                    <span className="font-extrabold text-sm text-gray-900">₹{item.price || 40}</span>
                    <button
                      onClick={() => addToCart(item, 'grocery', item.price || 40)}
                      className="px-3 py-1 bg-orange-50 hover:bg-orange-600 hover:text-white text-orange-600 text-xs font-bold rounded-lg border border-orange-200 transition-all"
                    >
                      + ADD
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. MEDICAL TAB */}
        {activeTab === 'medical' && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">Basic OTC Medical Essentials</h2>
                <p className="text-[10px] text-gray-500">Delivered sealed in secure slot packets</p>
              </div>
            </div>

            <div className="space-y-3">
              {medicalItems.map((med) => (
                <div key={med.id} className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
                  <div className="flex-1 pr-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 text-xs font-black">OTC ✓</span>
                      <h4 className="font-bold text-sm text-gray-900">{med.name}</h4>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{med.description}</p>
                    {med.dosage_info && <p className="text-[10px] text-gray-400 mt-1">💡 {med.dosage_info}</p>}
                    <p className="font-black text-sm text-gray-900 mt-2">₹{med.price}</p>
                  </div>
                  <button
                    onClick={() => addToCart(med, 'medical', med.price)}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 transition-all"
                  >
                    + ADD
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Cart Bar (When Items in Cart) */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-16 left-4 right-4 max-w-lg mx-auto z-40">
          <Link href="/cart">
            <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between animate-bounce-short">
              <div>
                <span className="font-black text-xs uppercase tracking-wider">{totalCartCount} {totalCartCount === 1 ? 'Item' : 'Items'}</span>
                <p className="font-black text-base">₹{cartSubtotal} <span className="text-xs font-normal opacity-80">+ ₹10 Delivery</span></p>
              </div>
              <div className="flex items-center text-sm font-black bg-white/20 px-3 py-1.5 rounded-xl">
                View Cart →
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Sticky Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50">
        <div className="max-w-lg mx-auto flex justify-around py-2.5">
          <Link href="/home" className="flex flex-col items-center text-orange-600 font-bold text-[10px]">
            <span className="text-xl">🏠</span>
            <span>Home</span>
          </Link>
          <Link href="/orders" className="flex flex-col items-center text-gray-500 hover:text-orange-600 text-[10px]">
            <span className="text-xl">📋</span>
            <span>Orders</span>
          </Link>
          <Link href="/cart" className="flex flex-col items-center text-gray-500 hover:text-orange-600 text-[10px] relative">
            <span className="text-xl">🛒</span>
            <span>Cart</span>
            {totalCartCount > 0 && (
              <span className="absolute -top-1 right-2 bg-orange-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                {totalCartCount}
              </span>
            )}
          </Link>
          <Link href="/profile" className="flex flex-col items-center text-gray-500 hover:text-orange-600 text-[10px]">
            <span className="text-xl">👤</span>
            <span>Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}