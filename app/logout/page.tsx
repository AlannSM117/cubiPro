'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/apiClient';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    handleLogout();
  }, []);

  async function handleLogout() {
    ApiClient.logout();
    router.push('/login');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Cerrando sesión...</p>
      </div>
    </div>
  );
}
