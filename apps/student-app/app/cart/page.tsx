import { redirect } from 'next/navigation';
// FILE: apps/student-app/app/cart/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function CartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
  });

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // Get available slots
      const slotsRes = await api.get('/api/slots');
      const activeSlot = slotsRes.data.data.find((s: any) => s.active);

      if (!activeSlot) {
        alert('No delivery slots available');
        return;
      }

      const res = await api.post('/api/orders', {
        restaurantId: 'temp-id',
        deliverySlotId: activeSlot.id,
        paymentMethod: 'cod',
      });

      if (res.data.success) {
        alert(`Order placed! Order #${res.data.order.orderNumber}`);
        router.push('/orders');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Cart</h1>

      <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
        <div className="space-y-3 mb-6 border-b pb-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹250</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>₹10</span>
          </div>
          <div className="flex justify-between">
            <span>Platform Fee</span>
            <span>₹2</span>
          </div>
        </div>

        <div className="flex justify-between text-lg font-bold mb-6">
          <span>Total</span>
          <span>₹262</span>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-medium"
        >
          {loading ? 'Processing...' : 'Proceed to Checkout (COD)'}
        </button>
      </div>
    </div>
  );
}