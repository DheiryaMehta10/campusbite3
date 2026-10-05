'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Student');
  const [userEmail, setUserEmail] = useState('student@campus.edu');
  const [userPhone, setUserPhone] = useState('9876543210');
  const [userHostel, setUserHostel] = useState('Tagore Hostel Block A');
  const [userRoom, setUserRoom] = useState('304');
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const name = localStorage.getItem('userName') || 'Student';
      const email = localStorage.getItem('userEmail') || 'student@campus.edu';
      const phone = localStorage.getItem('userPhone') || '9876543210';
      const hostel = localStorage.getItem('userHostel') || 'Tagore Hostel Block A';
      const room = localStorage.getItem('userRoom') || '304';

      setUserName(name);
      setUserEmail(email);
      setUserPhone(phone);
      setUserHostel(hostel);
      setUserRoom(room);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('userName', userName.trim());
      localStorage.setItem('userHostel', userHostel.trim());
      localStorage.setItem('userRoom', userRoom.trim());
      localStorage.setItem('userPhone', userPhone.trim());
    }
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out from CampusBite?')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPhone');
        localStorage.removeItem('cb_cart');
      }
      router.push('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 font-sans selection:bg-orange-500 selection:text-white">
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm px-4 py-3">
        <div className="max-w-md md:max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.push('/home')}
              className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold hover:bg-gray-200 transition-all active:scale-95"
            >
              ←
            </button>
            <h1 className="text-base font-black text-gray-900 tracking-tight">Student Account</h1>
          </div>
          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
            Campus ID Verified
          </span>
        </div>
      </header>

      <main className="max-w-md md:max-w-2xl mx-auto p-4 space-y-4">
        {/* 2. USER PROFILE HERO CARD */}
        <div className="bg-gradient-to-tr from-gray-900 via-gray-800 to-black rounded-3xl p-6 text-white shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-orange-500/30 shrink-0">
              {userName.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-black tracking-tight truncate">{userName}</h2>
              <p className="text-xs text-gray-300 font-medium truncate">{userEmail}</p>
              <p className="text-[11px] text-orange-400 font-bold mt-1">
                📍 {userHostel}, Room {userRoom}
              </p>
            </div>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-2xl text-xs font-bold text-green-800 flex items-center gap-2">
            <span>✓</span> Profile details updated successfully!
          </div>
        )}

        {/* 3. HOSTEL DELIVERY DETAILS CARD */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">
                Hostel Delivery Details
              </h3>
              <p className="text-[11px] text-gray-400">Used for fast scheduled batch dispatch</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-bold text-orange-600 hover:underline"
            >
              {isEditing ? 'Cancel' : 'Edit Details'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-orange-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                    Hostel & Block
                  </label>
                  <input
                    type="text"
                    value={userHostel}
                    onChange={(e) => setUserHostel(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-orange-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={userRoom}
                    onChange={(e) => setUserRoom(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-orange-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:border-orange-500 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider shadow-md active:scale-95 transition-all"
              >
                Save Changes
              </button>
            </form>
          ) : (
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Hostel:</span>
                <span className="font-bold text-gray-900">{userHostel}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Room Number:</span>
                <span className="font-bold text-gray-900">{userRoom}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Contact Phone:</span>
                <span className="font-bold text-gray-900">+91 {userPhone}</span>
              </div>
            </div>
          )}
        </div>

        {/* 4. APP GUIDELINES & SUPPORT */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">
            Campus Delivery Support
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-gray-50 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-base">🕒</span>
                <div>
                  <p className="font-bold text-gray-900">Delivery Wave Timings</p>
                  <p className="text-[10px] text-gray-500">Evening (6-7 PM, 7-8 PM) & Night Canteen (9:30-10:30 PM)</p>
                </div>
              </div>
            </div>

            <Link
              href="/helpdesk"
              className="p-3 bg-orange-50/50 hover:bg-orange-50 border border-orange-200/60 rounded-2xl flex items-center justify-between transition-all group active:scale-95"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">💬</span>
                <div>
                  <p className="font-bold text-gray-900 group-hover:text-orange-600">Campus Helpdesk</p>
                  <p className="text-[10px] text-gray-500">Live call, WhatsApp & order assistance desk</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  Online
                </span>
                <span className="text-gray-400 font-black text-sm">➔</span>
              </div>
            </Link>
          </div>
        </div>

        {/* 5. PLAY STORE LEGAL & PRIVACY */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">
            Legal & Privacy Settings
          </h3>

          <div className="space-y-1.5 text-xs">
            <Link
              href="/privacy"
              className="p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">🛡️</span>
                <span className="font-bold text-gray-800 group-hover:text-orange-600">Privacy Policy</span>
              </div>
              <span className="text-gray-400 font-bold text-sm">➔</span>
            </Link>

            <Link
              href="/terms"
              className="p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">📜</span>
                <span className="font-bold text-gray-800 group-hover:text-orange-600">Terms & Conditions</span>
              </div>
              <span className="text-gray-400 font-bold text-sm">➔</span>
            </Link>

            <Link
              href="/account/delete"
              className="p-3 rounded-2xl bg-red-50/60 hover:bg-red-50 flex items-center justify-between transition-all group border border-red-100"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">⚠️</span>
                <div>
                  <span className="font-bold text-red-600 block">Delete Account & Data</span>
                  <span className="text-[10px] text-red-400">Google Play Compliant Deletion</span>
                </div>
              </div>
              <span className="text-red-400 font-bold text-sm">➔</span>
            </Link>
          </div>
        </div>

        {/* 6. LOGOUT & APP VERSION */}
        <div className="pt-2 text-center space-y-3">
          <button
            onClick={handleLogout}
            className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-black text-xs py-3.5 rounded-2xl border border-red-200 shadow-sm transition-all active:scale-95 uppercase tracking-wider"
          >
            Log Out from CampusBite
          </button>

          <p className="text-[10px] font-bold text-gray-400">
            CampusBite v2.4.0 • Android PlayStore Release
          </p>
        </div>
      </main>

      {/* 6. BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 py-2">
        <div className="max-w-md md:max-w-2xl mx-auto px-6 flex justify-around items-center">
          <Link href="/home" className="flex flex-col items-center text-gray-400 hover:text-gray-900 font-bold text-[10px] gap-0.5">
            <span className="text-lg">🍔</span>
            <span>Explore</span>
          </Link>

          <Link href="/orders" className="flex flex-col items-center text-gray-400 hover:text-gray-900 font-bold text-[10px] gap-0.5">
            <span className="text-lg">📜</span>
            <span>Orders</span>
          </Link>

          <Link href="/profile" className="flex flex-col items-center text-orange-600 font-black text-[10px] gap-0.5">
            <span className="text-lg">👤</span>
            <span>Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}