'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

interface Restaurant {
  id: string;
  name: string;
  campusLocation?: string;
  contactPhone?: string;
  operationalStatus?: string;
  operational_status?: string;
  closedByAdmin?: boolean;
  closed_by_admin?: boolean;
  activeOrdersCount?: number;
}

export default function AdminRestaurantsPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRestForm, setNewRestForm] = useState({
    name: '',
    description: '',
    phone: '',
    cuisines: 'North Indian, Snacks, Beverages',
  });

  const api = axios.create({ baseURL: '' });

  useEffect(() => {
    fetchRestaurants();
    const interval = setInterval(() => {
      fetchRestaurants(true);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchRestaurants = async (isPolling = false) => {
    if (!isPolling) setLoading(true);
    let apiList: any[] = [];
    try {
      const res = await api.get('/api/restaurants');
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        apiList = res.data.data;
      }
    } catch (e) {
      try {
        const fallbackRes = await axios.get('https://student-app-xi-bice.vercel.app/api/restaurants');
        if (fallbackRes.data?.data && Array.isArray(fallbackRes.data.data)) {
          apiList = fallbackRes.data.data;
        }
      } catch {}
    }

    let localList: any[] = [];
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cb_all_restaurants');
        if (saved) localList = JSON.parse(saved);
      } catch {}
    }

    const defaultSeed: Restaurant[] = [
      {
        id: 'canteen-1',
        name: 'North Campus Central Canteen',
        campusLocation: 'North Academic Block Ground Floor',
        contactPhone: '9876500001',
        operationalStatus: 'open',
        closedByAdmin: false,
        activeOrdersCount: 14,
      },
      {
        id: 'canteen-2',
        name: 'South Mess & Food Court',
        campusLocation: 'South Residential Complex',
        contactPhone: '9876500002',
        operationalStatus: 'open',
        closedByAdmin: false,
        activeOrdersCount: 9,
      },
      {
        id: 'canteen-3',
        name: 'Night Canteen & Snacks Hub',
        campusLocation: 'Tagore Hostel Quadrangle',
        contactPhone: '9876500003',
        operationalStatus: 'open',
        closedByAdmin: false,
        activeOrdersCount: 4,
      },
      {
        id: 'canteen-4',
        name: 'Campus Chai & Fast Food Corner',
        campusLocation: 'Library Annexe Plaza',
        contactPhone: '9876500004',
        operationalStatus: 'open',
        closedByAdmin: false,
        activeOrdersCount: 6,
      },
    ];

    const map = new Map<string, Restaurant>();
    defaultSeed.forEach((r) => map.set(r.id, r));

    apiList.forEach((r: any) => {
      map.set(r.id, {
        id: r.id,
        name: r.name,
        campusLocation: r.campusLocation || r.address || r.description || 'Campus Food Plaza',
        contactPhone: r.contactPhone || r.phone_number || r.phone || '9876500000',
        operationalStatus: r.operationalStatus || r.operational_status || 'open',
        closedByAdmin: Boolean(r.closedByAdmin || r.closed_by_admin),
        activeOrdersCount: r.activeOrdersCount || 0,
      });
    });

    localList.forEach((r: any) => {
      map.set(r.id, {
        id: r.id,
        name: r.name,
        campusLocation: r.campusLocation || r.address || r.description || 'Campus Food Plaza',
        contactPhone: r.contactPhone || r.phone_number || r.phone || '9876500000',
        operationalStatus: r.operationalStatus || r.operational_status || 'open',
        closedByAdmin: Boolean(r.closedByAdmin || r.closed_by_admin),
        activeOrdersCount: r.activeOrdersCount || 0,
      });
    });

    setRestaurants(Array.from(map.values()));
    if (!isPolling) setLoading(false);
  };

  const toggleAdminForceClosure = async (id: string, currentForceState: boolean) => {
    const newForceState = !currentForceState;
    const confirmMessage = newForceState
      ? 'Are you sure you want to FORCE CLOSE this canteen? The restaurant owner will NOT be able to reopen until you unlock it.'
      : 'Unlock and allow this canteen to resume normal operations?';

    if (confirm(confirmMessage)) {
      try {
        await api.patch(`/api/restaurants/${id}/status`, {
          closedByAdmin: newForceState,
          operationalStatus: newForceState ? 'temporarily_closed' : 'open',
        });
      } catch (e) {
        console.log('Admin closure patch warning');
      }

      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                closedByAdmin: newForceState,
                closed_by_admin: newForceState,
                operationalStatus: newForceState ? 'temporarily_closed' : 'open',
                operational_status: newForceState ? 'temporarily_closed' : 'open',
              }
            : r
        )
      );
    }
  };

  const handleAddRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRestForm.name.trim()) {
      alert('Please enter restaurant name');
      return;
    }

    try {
      const payload = {
        name: newRestForm.name.trim(),
        description: newRestForm.description.trim() || 'Campus Food Plaza',
        phone: newRestForm.phone.trim() || '9876543210',
        cuisines: newRestForm.cuisines.trim(),
        operational_status: 'open',
      };

      const res = await api.post('/api/restaurants', payload);
      if (res.data?.data) {
        setRestaurants((prev) => [res.data.data, ...prev]);
        setShowAddModal(false);
        setNewRestForm({ name: '', description: '', phone: '', cuisines: 'North Indian, Snacks, Beverages' });
        fetchRestaurants();
      }
    } catch (err) {
      alert('Failed to register restaurant. Please try again.');
    }
  };

  const filtered = restaurants.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.campusLocation || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans selection:bg-orange-500 selection:text-white">
      {/* 1. TOP HEADER */}
      <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-xl font-black shadow-lg shadow-orange-500/20">
              🏪
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight">Canteen Partners & Outlets</h1>
              <p className="text-[11px] text-slate-400">Live Campus Kitchen Status & Admin Emergency Controls</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shadow-md shadow-orange-600/20"
            >
              + Add New Canteen
            </button>
            <button
              onClick={() => fetchRestaurants()}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border border-slate-700"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-slate-800 px-6 py-2.5">
          <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-7xl mx-auto">
            <Link href="/dashboard" className="px-4 py-2 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-300 whitespace-nowrap transition-colors">
              📊 Analytics Overview
            </Link>
            <Link href="/orders" className="px-4 py-2 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-300 whitespace-nowrap transition-colors">
              📦 Live Orders Feed
            </Link>
            <Link href="/orders/uncollected" className="px-4 py-2 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-300 whitespace-nowrap transition-colors">
              🚨 Uncollected Hub
            </Link>
            <Link href="/restaurants" className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-black whitespace-nowrap shadow-md shadow-orange-600/20">
              🏪 Canteen Partners
            </Link>
            <Link href="/config" className="px-4 py-2 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-300 whitespace-nowrap transition-colors">
              ⚙️ Slots & Fee Config
            </Link>
          </div>
        </div>
      </header>

      {/* 2. SEARCH & LIST */}
      <main className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">
        <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <p className="text-xs font-bold text-gray-700">
            Total Active Outlets: <span className="text-orange-600 font-black">{restaurants.length}</span>
          </p>

          <div className="relative w-full md:w-72">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search canteen name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:border-orange-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((rest) => {
            const isClosed = rest.operationalStatus === 'temporarily_closed' || rest.operational_status === 'temporarily_closed';
            const isForced = rest.closedByAdmin || rest.closed_by_admin;

            return (
              <div
                key={rest.id}
                className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-gray-900">{rest.name}</h3>
                      <p className="text-xs text-gray-500 font-medium">📍 {rest.campusLocation || 'Campus Food Block'}</p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isForced
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : isClosed
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {isForced ? '🔒 Admin Force Closed' : isClosed ? '⏸️ Store Paused' : '🟢 Open Live'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-600 pt-1">
                    <span>📞 {rest.contactPhone ? `+91 ${rest.contactPhone}` : 'No phone'}</span>
                    <span className="text-gray-300">•</span>
                    <span>📦 <strong className="text-gray-900">{rest.activeOrdersCount || 0}</strong> active orders</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-[11px] font-bold text-slate-400">
                    ID: {rest.id.length > 15 ? rest.id.slice(0, 8) + '...' : rest.id}
                  </span>

                  <button
                    onClick={() => toggleAdminForceClosure(rest.id, Boolean(isForced))}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                      isForced
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {isForced ? '🔓 Unlock Canteen' : '🚨 Force Close'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ADD RESTAURANT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-base font-black text-gray-900">Add New Canteen Outlet</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs font-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRestaurant} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Outlet / Canteen Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Green Garden Food Court"
                  value={newRestForm.name}
                  onChange={(e) => setNewRestForm({ ...newRestForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Campus Location / Block *</label>
                <input
                  type="text"
                  placeholder="e.g., Engineering Block 2 Ground Floor"
                  value={newRestForm.description}
                  onChange={(e) => setNewRestForm({ ...newRestForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Contact Phone Number *</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={newRestForm.phone}
                  onChange={(e) => setNewRestForm({ ...newRestForm, phone: e.target.value.slice(0, 10) })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Cuisines / Specialties</label>
                <input
                  type="text"
                  placeholder="e.g., Biryani, Chinese, Beverages, Combos"
                  value={newRestForm.cuisines}
                  onChange={(e) => setNewRestForm({ ...newRestForm, cuisines: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/20"
                >
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}