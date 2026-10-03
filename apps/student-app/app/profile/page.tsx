'use client';

import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
        <div className="space-y-4">
          <div>
            <p className="text-gray-600 text-sm">Name</p>
            <p className="font-medium">Student User</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">College</p>
            <p className="font-medium">Campus</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Hostel</p>
            <p className="font-medium">Block A</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  );
}