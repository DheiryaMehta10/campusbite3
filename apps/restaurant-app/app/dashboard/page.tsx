import { redirect } from 'next/navigation';
// FILE: apps/restaurant-app/app/dashboard/page.tsx
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
  order_items: Array<{ itemName: string; quantity: number }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState('open');
  const [loading, setLoading] = useState(true);
  const restaurantId = localStorage.getItem('restaurantId');
  const restaurantName = localStorage.getItem('restaurantName');

  const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

  useEffect(() => {
    if (!restaurantId) router.push('/auth/login');
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/api/restaurants/${restaurantId}/orders`);
      setOrders(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    const newStatus = status === 'open' ? 'temporarily_closed' : 'open';
    try {
      await api.patch(`/api/restaurants/${restaurantId}/status`, {
        operationalStatus: newStatus,
      });
      setStatus(newStatus);
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/api/orders/${orderId}/status`, {
        orderStatus: newStatus,
      });
      fetchOrders();
    } catch (error) {
      alert('Failed to update order');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm p-4 flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{restaurantName}</h1>
          <p className="text-sm text-gray-600">Restaurant Dashboard</p>
        </div>
        <button
          onClick={toggleStatus}
          className={`px-4 py-2 rounded text-white font-medium ${status === 'open' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
        >
          {status === 'open' ? '✓ Open' : '✕ Closed'}
        </button>
      </div>

      <div className="p-4 max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600 text-sm">Total Orders</p>
            <p className="text-3xl font-bold mt-2">{orders.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600 text-sm">Status</p>
            <p className={`text-lg font-bold mt-2 ${status === 'open' ? 'text-green-600' : 'text-red-600'}`}>
              {status === 'open' ? 'OPEN' : 'CLOSED'}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600 text-sm">Pending Orders</p>
            <p className="text-3xl font-bold mt-2">{orders.filter((o) => o.orderStatus === 'placed').length}</p>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-lg font-bold mb-4">Incoming Orders</h2>

          {loading ? (
            <p className="text-center py-8">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-center text-gray-600 py-8">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-lg">#{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">{new Date(order.placedAt).toLocaleTimeString()}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.orderStatus === 'placed'
                          ? 'bg-blue-100 text-blue-800'
                          : order.orderStatus === 'accepted'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>

                  <div className="mb-3 space-y-1">
                    {order.order_items?.map((item, idx) => (
                      <p key={idx} className="text-sm">
                        {item.quantity}x {item.itemName}
                      </p>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t">
                    <p className="font-bold">₹{order.totalAmount}</p>
                    <div className="space-x-2">
                      {order.orderStatus === 'placed' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'accepted')}
                          className="px-4 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Accept
                        </button>
                      )}
                      {order.orderStatus === 'accepted' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="px-4 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                        >
                          Preparing
                        </button>
                      )}
                      {order.orderStatus === 'preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'ready_for_delivery')}
                          className="px-4 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Ready
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}