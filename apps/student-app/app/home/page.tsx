import { redirect } from 'next/navigation';
// FILE: apps/student-app/app/home/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Restaurant {
  id: string;
  name: string;
  operationalStatus: string;
}

export default function HomePage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

  useEffect(() => {
    if (!localStorage.getItem('userId')) router.push('/auth/login');
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await api.get('/api/restaurants');
      setRestaurants(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 z-10 bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-orange-600">CampusBite</h1>
        <Link href="/cart">
          <div className="relative text-2xl cursor-pointer">🛒</div>
        </Link>
      </div>

      <div className="p-4 max-w-7xl mx-auto">
        {loading ? (
          <p className="text-center py-8">Loading restaurants...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurants
              .filter((r) => r.operationalStatus === 'open')
              .map((restaurant) => (
                <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`}>
                  <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg cursor-pointer transition-shadow">
                    <div className="h-40 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                      <span className="text-5xl">🍽️</span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg">{restaurant.name}</h3>
                      <p className="text-green-600 text-sm">Open now</p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3">
        <Link href="/home" className="flex flex-col items-center text-xs">
          <span className="text-2xl">🏠</span>
          <span className="text-gray-700">Home</span>
        </Link>
        <Link href="/orders" className="flex flex-col items-center text-xs">
          <span className="text-2xl">📋</span>
          <span className="text-gray-700">Orders</span>
        </Link>
        <Link href="/cart" className="flex flex-col items-center text-xs">
          <span className="text-2xl">🛒</span>
          <span className="text-gray-700">Cart</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center text-xs">
          <span className="text-2xl">👤</span>
          <span className="text-gray-700">Profile</span>
        </Link>
      </div>
    </div>
  );
}