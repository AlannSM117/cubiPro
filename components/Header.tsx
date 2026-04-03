'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/localDb';

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    getUserEmail();
  }, []);

  async function getUserEmail() {
    const { data } = await db.auth.getSession();
    if (data.session?.user?.email) {
      setUserEmail(data.session.user.email);
    }
  }

  const initials = userEmail
    .split('@')[0]
    .split('.')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="flex justify-between items-start mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">{userEmail.split('@')[0]}</span>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
          {initials}
        </div>
      </div>
    </div>
  );
}
