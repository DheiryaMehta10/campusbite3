import { redirect } from 'next/navigation';
// FILE: apps/admin-app/app/restaurants/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Restaurant {
  id: string;
  name: string;
  operationalStatus: string;
  active: boolean;
}

export default function RestaurantsPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

  useEffect(() => {
    if (!localStorage.getItem('adminId')) router.push('/auth/login');
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

  const toggleClosure = async (restaurantId: string, isClosed: boolean) => {
    try {
      const newStatus = isClosed ? 'open' : 'temporarily_closed';
      await api.patch(`/api/restaurants/${restaurantId}/status`, {
        operationalStatus: newStatus,
      });
      fetchRestaurants();
    } catch (error) {
      alert('Failed to update');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Restaurants</h1>

        {loading ? (
          <p className="text-center py-8">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} className="bg-white rounded-lg p-6 shadow">
                <h3 className="font-bold text-lg mb-2">{restaurant.name}</h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Status</p>
                  <p
                    className={`font-medium ${
                      restaurant.operationalStatus === 'open' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {restaurant.operationalStatus === 'open' ? 'OPEN' : 'CLOSED'}
                  </p>
                </div>

                <button
                  onClick={() =>
                    toggleClosure(restaurant.id, restaurant.operationalStatus === 'temporarily_closed')
                  }
                  className={`w-full py-2 rounded text-white font-medium ${
                    restaurant.operationalStatus === 'open'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {restaurant.operationalStatus === 'open' ? 'Force Closure' : 'Reopen'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}