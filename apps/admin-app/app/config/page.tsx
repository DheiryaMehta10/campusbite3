import { redirect } from 'next/navigation';
// FILE: apps/admin-app/app/config/page.tsx
'use client';
import { useRouter } from 'next/navigation';

export default function ConfigPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Configuration</h1>

        <div className="bg-white rounded-lg p-6 shadow space-y-6">
          {/* Delivery Fee */}
          <div>
            <h3 className="font-bold text-lg mb-3">Delivery Fee</h3>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Current Fee: ₹10</p>
                  <p className="text-sm text-gray-600">Per order</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Edit</button>
              </div>
            </div>
          </div>

          {/* Platform Fees */}
          <div>
            <h3 className="font-bold text-lg mb-3">Platform Fees (Item Count Based)</h3>
            <div className="space-y-3">
              <div className="border rounded-lg p-4 bg-gray-50 flex justify-between items-center">
                <div>
                  <p className="font-medium">1-3 items: ₹2</p>
                </div>
                <button className="px-4 py-2 border rounded hover:bg-gray-100">Edit</button>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50 flex justify-between items-center">
                <div>
                  <p className="font-medium">4-7 items: ₹4</p>
                </div>
                <button className="px-4 py-2 border rounded hover:bg-gray-100">Edit</button>
              </div>
            </div>
          </div>

          {/* Delivery Slots */}
          <div>
            <h3 className="font-bold text-lg mb-3">Delivery Slots</h3>
            <div className="space-y-3">
              <div className="border rounded-lg p-4 bg-gray-50 flex justify-between items-center">
                <div>
                  <p className="font-medium">Lunch: 12:00-13:00</p>
                  <p className="text-sm text-gray-600">Cutoff: 11:50 • Status: DISABLED</p>
                </div>
                <button className="px-4 py-2 border rounded hover:bg-gray-100">Edit</button>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50 flex justify-between items-center">
                <div>
                  <p className="font-medium">Evening 1: 18:00-19:00</p>
                  <p className="text-sm text-gray-600">Cutoff: 17:50 • Status: ACTIVE</p>
                </div>
                <button className="px-4 py-2 border rounded hover:bg-gray-100">Edit</button>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50 flex justify-between items-center">
                <div>
                  <p className="font-medium">Evening 2: 19:00-20:00</p>
                  <p className="text-sm text-gray-600">Cutoff: 18:50 • Status: ACTIVE</p>
                </div>
                <button className="px-4 py-2 border rounded hover:bg-gray-100">Edit</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
