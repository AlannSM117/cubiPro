'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, TreePine, Package, ShoppingCart, FileText, Settings, LogOut, CircleHelp as HelpCircle, Users } from 'lucide-react';
import { ApiClient } from '@/lib/apiClient';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: TreePine, label: 'Trocería', href: '/troceria' },
    { icon: Package, label: 'Producción', href: '/produccion' },
    { icon: ShoppingCart, label: 'Ventas', href: '/ventas' },
    { icon: FileText, label: 'Reportes', href: '/reportes' },
  ];

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = ApiClient.getUserFromToken();
    if (user && (user.role === 'ADMIN' || user.role?.toUpperCase() === 'ADMIN')) {
      setIsAdmin(true);
    }
  }, []);

  if (isAdmin) {
    menuItems.push({ icon: Users, label: 'Usuarios', href: '/usuarios' });
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    ApiClient.logout();
    router.push('/login');
  }

  const generalItems = [
    { icon: Settings, label: 'Configuración', href: '/configuracion' },
    { icon: HelpCircle, label: 'Ayuda', href: '/ayuda' },
  ];

  return (
    <div className="w-[205px] h-screen bg-[#1a3a35] text-white flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 border-4 border-white rounded-full border-t-transparent transform rotate-45"></div>
          </div>
          <span className="text-xl font-semibold">Cubi</span>
        </div>

        <div className="mb-8">
          <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">MENU</h3>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <nav>
            <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">GENERAL</h3>
            <div className="space-y-1">
              {generalItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">{isLoggingOut ? 'Saliendo...' : 'Cerrar sesión'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
