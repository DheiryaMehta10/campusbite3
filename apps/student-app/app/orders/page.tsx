'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Order {
  id: string;
  orderNumber?: string;
  order_number?: string;
  totalAmount?: number;
  total_amount?: number;
  orderStatus?: string;
  order_status?: string;
  placedAt?: string;
  placed_at?: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '',
    headers: typeof window !== 'undefined' ? { Authorization: `Bearer ${localStorage.getItem('authToken') || ''}` } : {},
  });

  useEffect(() => {
    if (!localStorage.getItem('userId')) router.push('/auth/login');
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders');
      setOrders(res.data.data || []);
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
          {orders.map((order) => {
            const num = order.orderNumber || order.order_number || 'N/A';
            const dateStr = order.placedAt || order.placed_at;
            const status = order.orderStatus || order.order_status || 'placed';
            const total = order.totalAmount ?? order.total_amount ?? 0;
            return (
              <div key={order.id} className="bg-white rounded-lg p-4 shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold">#{num}</p>
                    <p className="text-xs text-gray-600">
                      {dateStr ? new Date(dateStr).toLocaleDateString() : 'Recent'}
                    </p>
                  </div>
                  <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">{status}</span>
                </div>
                <p className="font-bold">₹{total}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}