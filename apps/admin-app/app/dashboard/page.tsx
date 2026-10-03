'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

interface DashboardData {
  totalOrders: number;
  todayOrders: number;
  activeRestaurants: number;
  uncollectedOrdersCount: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || '' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('adminId')) {
        router.push('/auth/login');
        return;
      }
      fetchDashboard();
    }
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/api/admin/dashboard');
      setStats(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm p-4 mb-6">
        <h1 className="text-2xl font-bold">CampusBite Admin</h1>
        <p className="text-sm text-gray-600">Platform Management</p>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b p-4">
        <div className="flex gap-4 overflow-x-auto max-w-7xl mx-auto">
          <Link href="/dashboard">
            <button className="px-4 py-2 hover:bg-gray-100 rounded whitespace-nowrap">Dashboard</button>
          </Link>
          <Link href="/orders">
            <button className="px-4 py-2 hover:bg-gray-100 rounded whitespace-nowrap">Orders</button>
          </Link>
          <Link href="/orders/uncollected">
            <button className="px-4 py-2 hover:bg-gray-100 rounded whitespace-nowrap">Uncollected</button>
          </Link>
          <Link href="/restaurants">
            <button className="px-4 py-2 hover:bg-gray-100 rounded whitespace-nowrap">Restaurants</button>
          </Link>
          <Link href="/config">
            <button className="px-4 py-2 hover:bg-gray-100 rounded whitespace-nowrap">Config</button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-7xl mx-auto">
        {loading ? (
          <p className="text-center py-8">Loading...</p>
        ) : stats ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-6 shadow border-l-4 border-blue-500">
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
                <p className="text-xs text-gray-500 mt-2">All time</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow border-l-4 border-green-500">
                <p className="text-gray-600 text-sm">Today's Orders</p>
                <p className="text-3xl font-bold mt-2">{stats.todayOrders}</p>
                <p className="text-xs text-gray-500 mt-2">Last 24 hours</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow border-l-4 border-orange-500">
                <p className="text-gray-600 text-sm">Active Restaurants</p>
                <p className="text-3xl font-bold mt-2">{stats.activeRestaurants}</p>
                <p className="text-xs text-gray-500 mt-2">Currently open</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow border-l-4 border-red-500">
                <p className="text-gray-600 text-sm">Uncollected Orders</p>
                <p className="text-3xl font-bold mt-2">{stats.uncollectedOrdersCount}</p>
                <Link href="/orders/uncollected">
                  <button className="mt-2 w-full bg-red-600 text-white py-1 rounded text-sm hover:bg-red-700">
                    View
                  </button>
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <Link href="/restaurants">
                  <button className="w-full border rounded-lg p-3 hover:bg-gray-50 text-sm font-medium">
                    + Restaurant
                  </button>
                </Link>
                <Link href="/orders">
                  <button className="w-full border rounded-lg p-3 hover:bg-gray-50 text-sm font-medium">
                    View Orders
                  </button>
                </Link>
                <Link href="/orders/uncollected">
                  <button className="w-full border rounded-lg p-3 hover:bg-gray-50 text-sm font-medium">
                    Uncollected
                  </button>
                </Link>
                <Link href="/config">
                  <button className="w-full border rounded-lg p-3 hover:bg-gray-50 text-sm font-medium">
                    Edit Fees
                  </button>
                </Link>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') localStorage.clear();
                    router.push('/auth/login');
                  }}
                  className="w-full border rounded-lg p-3 hover:bg-red-50 text-sm font-medium text-red-600"
                >
                  Logout
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}