'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';

interface FoodItem {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export default function RestaurantPage() {
  const router = useRouter();
  const params = useParams();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '',
    headers: typeof window !== 'undefined' ? { Authorization: `Bearer ${localStorage.getItem('authToken') || ''}` } : {},
  });

  const restaurantId = params?.id as string;

  useEffect(() => {
    if (restaurantId) {
      fetchMenu();
    }
  }, [restaurantId]);

  const fetchMenu = async () => {
    try {
      const res = await api.get(`/api/restaurants/${restaurantId}/menu`);
      setItems(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (itemId: string) => {
    try {
      await api.post('/api/cart', { itemId, quantity: 1 });
      alert('Added to cart!');
    } catch (error) {
      alert('Failed to add item');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <button onClick={() => router.back()} className="p-4">
        ← Back
      </button>

      <div className="p-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Menu</h1>

        {loading ? (
          <p>Loading menu...</p>
        ) : items.length === 0 ? (
          <p>No items found for this restaurant.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-4 shadow">
                <h3 className="font-bold text-lg">{item.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                <div className="flex justify-between items-center">
                  <p className="font-bold text-lg">₹{item.price}</p>
                  <button
                    onClick={() => addToCart(item.id)}
                    className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}