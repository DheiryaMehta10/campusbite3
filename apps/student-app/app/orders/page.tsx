import { redirect } from 'next/navigation';
// FILE: apps/student-app/app/orders/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  orderStatus: string;
  placedAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
  });

  useEffect(() => {
    if (!localStorage.getItem('userId')) router.push('/auth/login');
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders');
      setOrders(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>

      {loading ? (
        <p className="text-center py-8">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-600">No orders yet. Start ordering!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg p-4 shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-600">{new Date(order.placedAt).toLocaleDateString()}</p>
                </div>
                <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">{order.orderStatus}</span>
              </div>
              <p className="font-bold">₹{order.totalAmount}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}