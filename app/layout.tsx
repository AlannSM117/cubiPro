'use client';

import './globals.css';
import { Lexend, Roboto } from 'next/font/google'; // Importamos las nuevas fuentes
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { ApiClient } from '@/lib/apiClient';

// Configuramos Lexend (Fuente principal para títulos y menú)
const lexend = Lexend({ weight: ['300', '400', '500', '700'], subsets: ['latin'], variable: '--font-lexend' });

// Configuramos Roboto (Fuente secundaria para textos de dashboard/tablas)
const roboto = Roboto({ weight: ['300', '400', '500', '700'], subsets: ['latin'], variable: '--font-roboto' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const authRoutes = ['/login'];
  const isAuthRoute = authRoutes.includes(pathname);

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  function checkAuth() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const authenticated = !!token;
    setIsAuthenticated(authenticated);

    // Limpiar siempre los datos residuales del mock antiguo
    ApiClient.clearLegacyLocalStorage();

    if (!authenticated && !isAuthRoute) {
      router.push('/login');
    }
  }

  // Preparamos las clases del body para las fuentes y el fondo gris claro del mockup
  const bodyClass = `${lexend.variable} ${roboto.variable} font-sans antialiased text-gray-900 bg-[#fbfffb]`;

  if (isAuthenticated === null) {
    return (
      <html lang="es">
        <body className={bodyClass}>
          <div className="flex items-center justify-center min-h-screen">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B2519]"></div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="es">
      <body className={bodyClass}>
        {isAuthRoute ? (
          <div>{children}</div>
        ) : (
          // CAMBIO CLAVE: Agregamos flex-col para móvil y lg:flex-row para PC
          <div className="flex flex-col lg:flex-row bg-[#f4f7f6] min-h-screen">
            
            {/* Nuestro Sidebar ahora es inteligente y sabe cómo verse en celular vs PC */}
            <Sidebar />
            
            <main className="flex-1 min-h-screen overflow-y-auto">
              {/* Ajustamos un poco el padding en móvil (p-4) y en PC (md:p-8) */}
              <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
                {children}
              </div>
            </main>
          </div>
        )}
      </body>
    </html>
  );
}