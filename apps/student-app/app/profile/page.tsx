'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState('Student User');
  const [phone, setPhone] = useState('9876543210');
  const [email, setEmail] = useState('student@college.edu');
  const [college, setCollege] = useState('National Institute of Technology');
  const [hostel, setHostel] = useState('Tagore Hostel Block A');
  const [room, setRoom] = useState('304');
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('userName');
      const savedPhone = localStorage.getItem('userPhone');
      const savedEmail = localStorage.getItem('userEmail');
      const savedCollege = localStorage.getItem('userCollege');
      const savedHostel = localStorage.getItem('userHostel');
      const savedRoom = localStorage.getItem('userRoom');

      if (savedName) setName(savedName);
      if (savedPhone) setPhone(savedPhone);
      if (savedEmail) setEmail(savedEmail);
      if (savedCollege) setCollege(savedCollege);
      if (savedHostel) setHostel(savedHostel);
      if (savedRoom) setRoom(savedRoom);
    }
  }, []);

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userName', name);
      localStorage.setItem('userPhone', phone);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userCollege', college);
      localStorage.setItem('userHostel', hostel);
      localStorage.setItem('userRoom', room);
    }
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out from CampusBite?')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userId');
        localStorage.removeItem('authToken');
      }
      router.push('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Top Header */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-sm">
        <h1 className="font-black text-gray-900 text-lg">My Profile</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-orange-600 font-bold text-xs bg-orange-50 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-all"
        >
          {isEditing ? 'Cancel' : 'Edit Info'}
        </button>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-4">
        {savedSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 text-xs font-bold p-3 rounded-2xl">
            ✓ Profile details updated successfully!
          </div>
        )}

        {/* Profile Details Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-4 border-b pb-4">
            <div className="h-16 w-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-black shadow-md">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">{name}</h2>
              <p className="text-xs text-orange-600 font-bold">{college}</p>
              <p className="text-xs text-gray-500 mt-0.5">Verified Student Account</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 bg-gray-50 border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              ) : (
                <p className="text-xs font-bold text-gray-800">{name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Hostel Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={hostel}
                    onChange={(e) => setHostel(e.target.value)}
                    className="w-full mt-1 bg-gray-50 border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <p className="text-xs font-bold text-gray-800">{hostel}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Room Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full mt-1 bg-gray-50 border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <p className="text-xs font-bold text-gray-800">{room}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Phone Number</label>
                <p className="text-xs font-bold text-gray-800 mt-1">📱 +91 {phone}</p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Email ID</label>
                <p className="text-xs font-bold text-gray-800 mt-1 truncate">{email}</p>
              </div>
            </div>

            {isEditing && (
              <button
                onClick={handleSave}
                className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>

        {/* How Slot Delivery Works Info Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-5 border border-orange-100 shadow-sm space-y-2">
          <h3 className="text-xs font-black text-orange-950 uppercase tracking-wider flex items-center gap-1.5">
            <span>ℹ️</span> How Scheduled Slot Delivery Works
          </h3>
          <ul className="text-xs text-orange-900/90 space-y-1.5 list-disc pl-4">
            <li>Orders are collected and freshly cooked in batches to guarantee hot food.</li>
            <li>Slots are 6:00–7:00 PM & 7:00–8:00 PM. Cutoff is 10 minutes prior to slot start.</li>
            <li>Slot delivery fee is fixed at ₹10 per order.</li>
            <li>Platform fee is ₹2 for 1–3 items, ₹4 for 4–7 items.</li>
            <li>Collect your order at your designated hostel collection point when arrived.</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Link
            href="/orders"
            className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 py-3 rounded-2xl font-bold text-xs shadow-sm flex items-center justify-between px-4 transition-all"
          >
            <span className="flex items-center gap-2">
              <span>📦</span> View All Past & Active Orders
            </span>
            <span>➔</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-3 rounded-2xl font-bold text-xs transition-all"
          >
            Logout from Account
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 flex justify-between items-center shadow-lg z-30">
        <Link href="/home" className="flex flex-col items-center text-gray-500 hover:text-orange-600">
          <span className="text-lg">🏠</span>
          <span className="text-[10px] font-bold mt-0.5">Home</span>
        </Link>
        <Link href="/orders" className="flex flex-col items-center text-gray-500 hover:text-orange-600">
          <span className="text-lg">📦</span>
          <span className="text-[10px] font-bold mt-0.5">Orders</span>
        </Link>
        <Link href="/cart" className="flex flex-col items-center text-gray-500 hover:text-orange-600">
          <span className="text-lg">🛒</span>
          <span className="text-[10px] font-bold mt-0.5">Cart</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center text-orange-600 font-bold">
          <span className="text-lg">👤</span>
          <span className="text-[10px] mt-0.5">Profile</span>
        </Link>
      </div>
    </div>
  );
}