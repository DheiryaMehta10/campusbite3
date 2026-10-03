import { redirect } from 'next/navigation';
// FILE: apps/admin-app/app/orders/uncollected/page.tsx (CRITICAL)
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface UncollectedOrder {
  id: string;
  order: {
    orderNumber: string;
    totalAmount: number;
    delivery_slot: { name: string };
  };
  student: {
    fullName: string;
    phoneNumber: string;
    collegeName: string;
    hostelName: string;
  };
  contacted: boolean;
  collected: boolean;
}

export default function UncollectedOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<UncollectedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

  useEffect(() => {
    if (!localStorage.getItem('adminId')) router.push('/auth/login');
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/admin/orders/uncollected');
      setOrders(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleContacted = async (orderId: string) => {
    try {
      await api.patch(`/api/admin/orders/${orderId}/contacted`, { contacted: true });
      fetchOrders();
    } catch (error) {
      alert('Failed to update');
    }
  };

  const handleCollected = async (orderId: string) => {
    try {
      await api.patch(`/api/admin/orders/${orderId}/collected`, { collected: true });
      fetchOrders();
    } catch (error) {
      alert('Failed to update');
    }
  };

  const filtered = orders.filter((o) => o.order.orderNumber.includes(search.toUpperCase()));

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Uncollected Orders</h1>

        <input
          placeholder="Search by order number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border rounded-lg px-4 py-2 mb-6"
        />

        {loading ? (
          <p className="text-center py-8">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-600">
            {search ? 'No matching orders' : 'No uncollected orders'}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => (
              <div key={order.id} className="bg-white rounded-lg p-6 shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  {/* Order Details */}
                  <div>
                    <h3 className="font-bold text-lg mb-2">#{order.order.orderNumber}</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Amount:</strong> ₹{order.order.totalAmount}
                      </p>
                      <p>
                        <strong>Slot:</strong> {order.order.delivery_slot.name}
                      </p>
                    </div>
                  </div>

                  {/* Student Details */}
                  <div>
                    <h3 className="font-bold mb-2">Student Details</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Name:</strong> {order.student.fullName}
                      </p>
                      <p>
                        <strong>Phone:</strong>{' '}
                        <a href={`tel:+91${order.student.phoneNumber}`} className="text-blue-600 hover:underline">
                          +91{order.student.phoneNumber}
                        </a>
                      </p>
                      <p>
                        <strong>Hostel:</strong> {order.student.hostelName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {!order.contacted && (
                    <button
                      onClick={() => handleContacted(order.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Mark Contacted
                    </button>
                  )}
                  {!order.collected && (
                    <button
                      onClick={() => handleCollected(order.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Mark Collected
                    </button>
                  )}
                  <a href={`tel:+91${order.student.phoneNumber}`}>
                    <button className="px-4 py-2 border rounded hover:bg-gray-50">Call Student</button>
                  </a>
                </div>

                {/* Status Badges */}
                <div className="mt-3 flex gap-2">
                  {order.contacted && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Contacted</span>}
                  {order.collected && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Collected</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}