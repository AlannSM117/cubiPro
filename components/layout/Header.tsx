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

  // Obtenemos iniciales
  const initials = userEmail
    .split('@')[0]
    .split('.')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  // Damos formato al nombre (ej: juan.perez -> Juan Perez)
  const displayName = userEmail 
    ? userEmail.split('@')[0].split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Admin';

  return (
    <div className="flex justify-between items-start mb-8">
      <div>
        {/* Título en Roboto Medium y color verde oscuro */}
        <h1 className="font-roboto font-medium text-3xl text-[#0A2C25]">
          {title}
        </h1>
        {/* Subtítulo en Roboto Regular */}
        {subtitle && (
          <p className="font-roboto font-normal text-sm text-[#839590] mt-2">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {/* Nombre de usuario */}
        <span className="font-roboto font-normal text-sm text-[#0A2C25]]">
          {displayName}
        </span>
        {/* Avatar dinámico con bordes y sombra tipo mockup */}
        <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white font-lexend font-medium text-sm">
          {initials}
        </div>
      </div>
    </div>
  );
}