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

const DEFAULT_RESTAURANTS: Restaurant[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'North Campus Central Canteen',
    description: 'Paneer Butter Masala, Butter Naans, Cold Coffee & Thalis',
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
    rating: 4.6,
    operational_status: 'open',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'South Mess & Food Court',
    description: 'Hyderabadi Dum Biryani, Chicken Curry & Desserts',
    image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600',
    rating: 4.5,
    operational_status: 'open',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Night Canteen & Snacks Hub',
    description: 'Crispy Spring Rolls, Chicken 65, Fried Rice & Maggi',
    image_url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600',
    rating: 4.4,
    operational_status: 'open',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Campus Chai & Fast Food Corner',
    description: 'Cheese Burst Burgers, Sandwiches & Elaichi Chai Flasks',
    image_url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600',
    rating: 4.7,
    operational_status: 'open',
  },
];

const DEFAULT_GROCERIES: GroceryItem[] = [
  { id: 'groc-1', name: 'Basmati Rice (1kg Pack)', description: 'Premium long grain aged basmati rice', price: 95, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
  { id: 'groc-2', name: 'Toor Dal (500g)', description: 'Unpolished protein-rich pulses', price: 75, image_url: 'https://images.unsplash.com/photo-1585994192701-f1a505c817ea?w=400' },
  { id: 'groc-3', name: 'Almonds & Cashews Mix (200g)', description: 'Crunchy roasted high-energy dry fruits', price: 180, image_url: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400' },
  { id: 'groc-4', name: 'Fresh Amul Taaza Milk (500ml)', description: 'Pasteurized homogenized toned milk', price: 30, image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400' },
  { id: 'groc-5', name: 'Maggi 2-Minute Noodles (4-Pack)', description: 'Masala instant noodles for late nights', price: 56, image_url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400' },
  { id: 'groc-6', name: 'Nescafe Classic Instant Coffee (50g)', description: '100% pure instant coffee powder jar', price: 165, image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400' },
];

const DEFAULT_MEDICAL: MedicalItem[] = [
  { id: 'med-1', name: 'Dolo 650 Tablets (Strip of 15)', description: 'Paracetamol 650mg for headache, body pain & fever relief', price: 34, dosage_info: '1 tablet after food as needed' },
  { id: 'med-2', name: 'Moov Pain Relief Spray (50g)', description: 'Fast action ointment spray for muscle spasms & sprains', price: 145, dosage_info: 'Spray directly on painful area' },
  { id: 'med-3', name: 'Band-Aid First Aid Strips (Pack of 10)', description: 'Antiseptic waterproof adhesive bandages', price: 30, dosage_info: 'Clean wound and apply strip' },
  { id: 'med-4', name: 'Digene Antacid Tablets (Strip of 15)', description: 'Mint flavored chewable tablets for acidity & gas', price: 25, dosage_info: 'Chew 1-2 tablets after meals' },
  { id: 'med-5', name: 'Electral ORS Powder (21.8g Sachet)', description: 'WHO formula oral rehydration salt for dehydration', price: 22, dosage_info: 'Mix with 1 litre of clean drinking water' },
  { id: 'med-6', name: 'Vicks Inhaler for Blocked Nose', description: 'Fast relief from nasal congestion & cold', price: 65, dosage_info: 'Inhale deeply through each nostril' },
];

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'food' | 'grocery' | 'medical'>('food');
  const [restaurants, setRestaurants] = useState<Restaurant[]>(DEFAULT_RESTAURANTS);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>(DEFAULT_GROCERIES);
  const [medicalItems, setMedicalItems] = useState<MedicalItem[]>(DEFAULT_MEDICAL);
  const [announcements, setAnnouncements] = useState<any[]>([
    { title: 'Slot Ordering Active', message: 'Main evening slots 6–7 PM & 7–8 PM are open for booking!' },
  ]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userHostel, setUserHostel] = useState('Tagore Hostel Block A');

  const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://campusbite-amber.vercel.app' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      if (!storedUserId) {
        localStorage.setItem('userId', 'student-default');
      }
      const hostel = localStorage.getItem('userHostel');
      if (hostel) setUserHostel(hostel);

      const savedCart = localStorage.getItem('cb_cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch {}
      }
    }

    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [restRes, grocRes, medRes, annRes] = await Promise.all([
        api.get('/api/restaurants').catch(() => ({ data: { data: [] } })),
        api.get('/api/grocery').catch(() => ({ data: { data: [] } })),
        api.get('/api/medical').catch(() => ({ data: { data: [] } })),
        api.get('/api/announcements').catch(() => ({ data: { data: [] } })),
      ]);

      if (restRes.data?.data && restRes.data.data.length > 0) setRestaurants(restRes.data.data);
      if (grocRes.data?.data && grocRes.data.data.length > 0) setGroceryItems(grocRes.data.data);
      if (medRes.data?.data && medRes.data.data.length > 0) setMedicalItems(medRes.data.data);
      if (annRes.data?.data && annRes.data.data.length > 0) setAnnouncements(annRes.data.data);
    } catch (e) {
      console.error(e);
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
        restaurantId: '550e8400-e29b-41d4-a716-446655440001',
        restaurantName: 'North Campus Central Canteen',
        type,
      });
    }
    setCart(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cb_cart', JSON.stringify(updated));
    }
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Top Mobile Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-orange-500/30">
              CB
            </div>
            <div>
              <div className="flex items-center text-xs font-black text-gray-900">
                <span>📍 {userHostel}</span>
                <span className="ml-1 text-[10px] text-orange-600 font-bold">▼</span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium">Scheduled Slot Delivery Platform</p>
            </div>
          </div>

          <Link href="/cart" className="relative p-2.5 bg-orange-50 hover:bg-orange-100 rounded-2xl transition-all">
            <span className="text-xl">🛒</span>
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse">
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
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 hover:bg-gray-100/80 focus:bg-white text-xs font-semibold rounded-2xl border border-transparent focus:border-orange-500 focus:outline-none transition-all shadow-inner"
            />
          </div>
        </div>
      </header>

      {/* Announcements Pill */}
      {announcements.length > 0 && (
        <div className="max-w-lg mx-auto px-4 mt-3">
          <div className="bg-amber-50 border border-amber-200/80 text-amber-950 rounded-2xl px-4 py-2.5 text-xs flex items-center space-x-2 shadow-sm">
            <span className="text-base">📢</span>
            <div className="truncate">
              <strong className="font-bold">{announcements[0].title}:</strong>{' '}
              <span className="text-amber-900">{announcements[0].message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Delivery Slot Status Banner */}
      <div className="max-w-lg mx-auto px-4 mt-3">
        <div className="bg-gradient-to-r from-slate-950 via-gray-900 to-orange-950 text-white p-5 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-center z-10 relative">
            <div>
              <span className="inline-block px-2.5 py-0.5 bg-orange-500 text-[10px] font-extrabold uppercase rounded-full tracking-wider mb-1.5 shadow-sm">
                Next Active Slot
              </span>
              <h3 className="font-black text-lg text-white">Evening (6:00 PM – 7:00 PM)</h3>
              <p className="text-xs text-orange-200/90 mt-1">Order before <strong>5:50 PM</strong> cutoff for this slot</p>
            </div>
            <div className="text-3xl bg-white/10 p-3 rounded-2xl backdrop-blur-sm">⏰</div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-orange-500/20 rounded-full blur-xl"></div>
        </div>
      </div>

      {/* 3 Main Categories */}
      <div className="max-w-lg mx-auto px-4 mt-4">
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => setActiveTab('food')}
            className={`p-3.5 rounded-2xl flex flex-col items-center justify-center transition-all ${
              activeTab === 'food'
                ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-[1.02]'
                : 'bg-white text-gray-700 border border-gray-200/80 hover:bg-orange-50/50'
            }`}
          >
            <span className="text-2xl mb-1">🍔</span>
            <span className="text-xs font-black">Food</span>
            <span className={`text-[9px] ${activeTab === 'food' ? 'text-orange-100' : 'text-gray-400'}`}>Canteen & Meals</span>
          </button>

          <button
            onClick={() => setActiveTab('grocery')}
            className={`p-3.5 rounded-2xl flex flex-col items-center justify-center transition-all ${
              activeTab === 'grocery'
                ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-[1.02]'
                : 'bg-white text-gray-700 border border-gray-200/80 hover:bg-orange-50/50'
            }`}
          >
            <span className="text-2xl mb-1">🛒</span>
            <span className="text-xs font-black">Grocery</span>
            <span className={`text-[9px] ${activeTab === 'grocery' ? 'text-orange-100' : 'text-gray-400'}`}>Hostel Staples</span>
          </button>

          <button
            onClick={() => setActiveTab('medical')}
            className={`p-3.5 rounded-2xl flex flex-col items-center justify-center transition-all ${
              activeTab === 'medical'
                ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-[1.02]'
                : 'bg-white text-gray-700 border border-gray-200/80 hover:bg-orange-50/50'
            }`}
          >
            <span className="text-2xl mb-1">💊</span>
            <span className="text-xs font-black">Medical</span>
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
              <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">Campus Restaurants & Canteens</h2>
              <span className="text-xs text-orange-600 font-bold">{restaurants.length} Outlets</span>
            </div>

            <div className="space-y-4">
              {restaurants
                .filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((rest) => {
                  const status = rest.operational_status || rest.operationalStatus || 'open';
                  const isClosed = status === 'temporarily_closed';

                  return (
                    <Link key={rest.id} href={isClosed ? '#' : `/restaurant/${rest.id}`}>
                      <div className={`bg-white rounded-3xl overflow-hidden border border-gray-200/80 shadow-sm hover:shadow-lg transition-all group ${isClosed ? 'opacity-75' : ''}`}>
                        <div className="h-40 bg-gray-100 relative overflow-hidden">
                          <img
                            src={rest.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600'}
                            alt={rest.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3">
                            {isClosed ? (
                              <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                                ✕ TEMPORARILY CLOSED
                              </span>
                            ) : (
                              <span className="bg-green-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                                ● OPEN FOR SLOT
                              </span>
                            )}
                          </div>
                          <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 shadow">
                            ⭐ {rest.rating || 4.5}
                          </div>
                        </div>

                        <div className="p-4">
                          <h3 className="font-black text-gray-900 text-base">{rest.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{rest.description || 'Thalis, Rolls, Snacks & Beverages'}</p>

                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs">
                            <span className="text-gray-500 font-medium">🛵 Slot: 6:00 – 7:00 PM</span>
                            <span className="text-orange-600 font-black group-hover:translate-x-1 transition-transform">
                              {isClosed ? 'Closed' : 'View Menu ➔'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        )}

        {/* 2. GROCERY TAB */}
        {activeTab === 'grocery' && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">Hostel Grocery Essentials</h2>
              <span className="text-xs text-orange-600 font-bold">{groceryItems.length} Products</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {groceryItems.map((item) => (
                <div key={item.id} className="bg-white p-3.5 rounded-3xl border border-gray-200/80 shadow-sm flex flex-col justify-between hover:border-orange-200 transition-all">
                  <div className="h-28 bg-gray-50 rounded-2xl overflow-hidden mb-2">
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
                    <span className="font-black text-sm text-gray-900">₹{item.price || 40}</span>
                    <button
                      onClick={() => addToCart(item, 'grocery', item.price || 40)}
                      className="px-3 py-1.5 bg-orange-50 hover:bg-orange-600 hover:text-white text-orange-600 text-xs font-black rounded-xl border border-orange-200 transition-all active:scale-95"
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
                <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">Basic OTC Medical Essentials</h2>
                <p className="text-[10px] text-gray-500">Delivered sealed in secure slot packets (Strictly OTC)</p>
              </div>
            </div>

            <div className="space-y-3">
              {medicalItems.map((med) => (
                <div key={med.id} className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-sm flex items-center justify-between hover:border-orange-200 transition-all">
                  <div className="flex-1 pr-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-700 bg-green-50 text-[10px] font-black px-2 py-0.5 rounded-md border border-green-200">OTC ✓</span>
                      <h4 className="font-bold text-sm text-gray-900">{med.name}</h4>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{med.description}</p>
                    {med.dosage_info && <p className="text-[10px] text-gray-400 mt-1">💡 {med.dosage_info}</p>}
                    <p className="font-black text-sm text-gray-900 mt-2">₹{med.price}</p>
                  </div>
                  <button
                    onClick={() => addToCart(med, 'medical', med.price)}
                    className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black rounded-2xl shadow-md shadow-orange-500/25 transition-all active:scale-95"
                  >
                    + ADD
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Cart Bar */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-16 left-4 right-4 max-w-lg mx-auto z-40">
          <Link href="/cart">
            <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between animate-bounce-short">
              <div>
                <span className="font-black text-xs uppercase tracking-wider">{totalCartCount} {totalCartCount === 1 ? 'Item' : 'Items'}</span>
                <p className="font-black text-base">₹{cartSubtotal} <span className="text-xs font-normal opacity-80">+ ₹10 Slot Delivery</span></p>
              </div>
              <div className="flex items-center text-xs font-black bg-white/20 px-3.5 py-2 rounded-xl backdrop-blur-sm">
                View Cart ➔
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Sticky Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50">
        <div className="max-w-lg mx-auto grid grid-cols-4 py-2 text-center">
          <Link href="/home" className="flex flex-col items-center text-orange-600 font-black">
            <span className="text-xl">🏠</span>
            <span className="text-[10px] mt-0.5">Home</span>
          </Link>
          <Link href="/orders" className="flex flex-col items-center text-gray-500 hover:text-orange-600 font-bold">
            <span className="text-xl">📦</span>
            <span className="text-[10px] mt-0.5">Orders</span>
          </Link>
          <Link href="/cart" className="flex flex-col items-center text-gray-500 hover:text-orange-600 font-bold">
            <span className="text-xl">🛒</span>
            <span className="text-[10px] mt-0.5">Cart</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center text-gray-500 hover:text-orange-600 font-bold">
            <span className="text-xl">👤</span>
            <span className="text-[10px] mt-0.5">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}