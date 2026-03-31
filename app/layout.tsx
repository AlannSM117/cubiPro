'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const authRoutes = ['/login', '/registro'];
  const isAuthRoute = authRoutes.includes(pathname);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (!session && !isAuthRoute) {
        router.push('/login');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [isAuthRoute, router]);

  async function checkAuth() {
    const { data } = await supabase.auth.getSession();
    const authenticated = !!data.session;
    setIsAuthenticated(authenticated);

    if (!authenticated && !isAuthRoute) {
      router.push('/login');
    }
  }

  if (isAuthenticated === null) {
    return (
      <html lang="es">
        <body className={inter.className}>
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="es">
      <body className={inter.className}>
        {isAuthRoute ? (
          <div>{children}</div>
        ) : (
          <div className="flex">
            <Sidebar />
            <main className="ml-[205px] flex-1 bg-gray-50 min-h-screen">
              <div className="p-8">
                {children}
              </div>
            </main>
          </div>
        )}
      </body>
    </html>
  );
}
