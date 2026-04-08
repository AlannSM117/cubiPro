'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  TreePine, 
  Factory, 
  CircleDollarSign, 
  ClipboardList, 
  Settings, 
  LogOut, 
  CircleHelp as HelpCircle, 
  Users,
  Menu,
  X
} from 'lucide-react';
import { ApiClient } from '@/lib/apiClient';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: TreePine, label: 'Trocería', href: '/troceria' },
    { icon: Factory, label: 'Producción', href: '/produccion' },
    { icon: CircleDollarSign, label: 'Ventas', href: '/ventas' },
    { icon: ClipboardList, label: 'Reportes', href: '/reportes' },
  ];

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
    setIsMobileMenuOpen(false); // Cerramos menú al salir
  }

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const generalItems = [
    { icon: Settings, label: 'Configuración', href: '/configuracion' },
    { icon: HelpCircle, label: 'Ayuda', href: '/ayuda' },
  ];

  return (
    <>
      {/* VERSIÓN MÓVIL ( Blur & Drawer)*/}
      
      {/* Header Móvil Oscuro Sólido */}
      <header className="lg:hidden flex items-center justify-between bg-[#0B2519] px-6 py-4 border-b border-[#1a3a35] sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 relative flex items-center justify-center flex-shrink-0">
            {/* Custom SVG Logo del Login */}
              <svg xmlns="http://www.w3.org/2000/svg" width="66" height="58" viewBox="0 0 66 58" fill="none">
                <circle cx="25" cy="33" r="25" fill="#09934D"/><circle cx="41" cy="25" r="25" fill="#AAD080"/>
                <path d="M29.9406 38.8854C29.2617 43.8648 25.6973 44.2204 24 43.7758C27.5 48 38.8211 50.5 39.5 50.5C48 50.5 55 46 56.5 44.5C54.6982 41.9768 52.4301 21.5467 44.7922 17.5455C37.1542 13.5442 30.7893 32.6613 29.9406 38.8854Z" fill="#09934D"/>
                <path d="M21.8521 36.8507C23.4454 38.7428 25 39.8708 26 38.8708C26.8333 38.2776 27.8 36.6322 25 34.7957C24.194 33.8822 23.3537 32.8962 23 32.3708C22.0683 30.9869 21.8962 29.9914 21.5 28.3708C21.034 26.4646 21.1103 25.33 21 23.3708C20.8574 20.8364 20.8756 19.4061 21 16.8708C21.1057 14.7166 21.5 11.3708 21.5 11.3708L22.1086 8.6C20.4822 10.3591 19.2119 13.322 18.5353 16.9345C17.8588 20.547 17.8223 24.5616 18.4328 28.2273C19.0433 31.893 20.2588 34.9586 21.8521 36.8507Z" fill="#C7570E"/>
                <path d="M56.4954 23.2494C58.6509 26.5883 60.2636 30.3023 61.1633 33.9997C61.549 35.5848 61.7976 37.1418 61.9077 38.641C61 40 59.5 42 59.072 42.2891L57.2904 34.7891L55.2904 29.7891C55.2904 29.7891 53.1075 22.9027 50.5 19.5C48.9021 17.4149 49.0699 17.5407 47 15.5C43.9284 12.4718 41 13.2891 41 13.2891C41 13.2891 42 12.5 43.5 12.5C45 12.5 47.1347 13.7318 48.9158 15.0282C51.7213 17.0702 54.3398 19.9104 56.4954 23.2494Z" fill="#C7570E"/>
              </svg>
          </div>
          <span className="font-lexend font-medium text-[20px] text-white tracking-wide">Cubi</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </header>

      {/* Menú Desplegable con EFECTO DIFUMINADO (Blur) */}
      {isMobileMenuOpen && (
        // CONTENEDOR OVERLAY (Hace el fondo borroso y oscuro)
        <div 
          className="lg:hidden fixed inset-0 top-[65px] z-40 backdrop-blur-sm bg-black/40 animate-in fade-in duration-300" 
          onClick={() => setIsMobileMenuOpen(false)} // Cierra al tocar fuera
        >
          
          {/* CONTENIDO DEL MENÚ (Drawer superior redondeado) */}
          <div 
            className="bg-[#0B2519]/95 w-full p-6 pb-12 rounded-b-3xl border-b border-[#1a3a35] shadow-2xl overflow-y-auto max-h-[85vh] animate-in slide-in-from-top-3 duration-300"
            onClick={(e) => e.stopPropagation()} // Evita cerrar al tocar dentro
          >
            
            {/* SECCIÓN: MENÚ (Alineado a la izquierda con estructura de PC) */}
            <div className="mb-6">
              <h3 className="text-[11px] font-lexend font-light text-[#DBF0DD] mb-3 uppercase tracking-[0.15em] ml-2">MENÚ</h3>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-[#DBF0DD] text-[#0B2519] font-lexend font-medium shadow-sm'
                          : 'text-[#B5D1C1] font-lexend font-light hover:text-white'
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-[15px]">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* SECCIÓN: GENERAL (Alineado a la izquierda con estructura de PC) */}
            <div className="mt-8 flex flex-col">
              <h3 className="text-[11px] font-lexend font-light text-[#DBF0DD] mb-3 uppercase tracking-[0.15em] ml-2">GENERAL</h3>
              <div className="space-y-1">
                {generalItems.map((item) => {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                        pathname === item.href
                          ? 'bg-[#DBF0DD] text-[#0B2519] font-lexend font-medium shadow-sm'
                          : 'text-[#B5D1C1] font-lexend font-light hover:text-white'
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-[15px]">{item.label}</span>
                    </Link>
                  );
                })}

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[#e05822] font-medium hover:text-white hover:bg-white/5 transition-all duration-200 w-full disabled:opacity-50 text-left"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <span className="text-[15px]">{isLoggingOut ? 'Saliendo...' : 'Cerrar sesión'}</span>
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* VERSIÓN ESCRITORIO (Se mantiene igual) */}
      <aside className="hidden lg:flex w-[230px] h-[calc(100vh-2rem)] bg-[#0B2519] text-white flex-col sticky top-4 left-4 ml-4 my-4 z-10 rounded-3xl shadow-xl flex-shrink-0">
        
        <div className="p-4 flex flex-col h-full overflow-hidden">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-6 mt-2 px-2">
            <div className="w-9 h-9 relative flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="66" height="58" viewBox="0 0 66 58" fill="none">
                <circle cx="25" cy="33" r="25" fill="#09934D"/><circle cx="41" cy="25" r="25" fill="#AAD080"/>
                <path d="M29.9406 38.8854C29.2617 43.8648 25.6973 44.2204 24 43.7758C27.5 48 38.8211 50.5 39.5 50.5C48 50.5 55 46 56.5 44.5C54.6982 41.9768 52.4301 21.5467 44.7922 17.5455C37.1542 13.5442 30.7893 32.6613 29.9406 38.8854Z" fill="#09934D"/>
                <path d="M21.8521 36.8507C23.4454 38.7428 25 39.8708 26 38.8708C26.8333 38.2776 27.8 36.6322 25 34.7957C24.194 33.8822 23.3537 32.8962 23 32.3708C22.0683 30.9869 21.8962 29.9914 21.5 28.3708C21.034 26.4646 21.1103 25.33 21 23.3708C20.8574 20.8364 20.8756 19.4061 21 16.8708C21.1057 14.7166 21.5 11.3708 21.5 11.3708L22.1086 8.6C20.4822 10.3591 19.2119 13.322 18.5353 16.9345C17.8588 20.547 17.8223 24.5616 18.4328 28.2273C19.0433 31.893 20.2588 34.9586 21.8521 36.8507Z" fill="#C7570E"/>
                <path d="M56.4954 23.2494C58.6509 26.5883 60.2636 30.3023 61.1633 33.9997C61.549 35.5848 61.7976 37.1418 61.9077 38.641C61 40 59.5 42 59.072 42.2891L57.2904 34.7891L55.2904 29.7891C55.2904 29.7891 53.1075 22.9027 50.5 19.5C48.9021 17.4149 49.0699 17.5407 47 15.5C43.9284 12.4718 41 13.2891 41 13.2891C41 13.2891 42 12.5 43.5 12.5C45 12.5 47.1347 13.7318 48.9158 15.0282C51.7213 17.0702 54.3398 19.9104 56.4954 23.2494Z" fill="#C7570E"/>
              </svg>
            </div>
            <span className="font-lexend font-normal text-[20px] tracking-wide text-[#DBF0DD]">Cubi</span>
          </div>

          {/* Menú Principal */}
          <div className="mb-2">
            <h3 className="text-[11px] font-lexend font-light text-[#DBF0DD] mb-3 uppercase tracking-[0.15em] ml-2">MENÚ</h3>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-[#DBF0DD] text-[#0B2519] font-lexend font-medium shadow-sm'
                        : 'text-[#B5D1C1] font-lexend font-light hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#0B2519]' : ''}`} />
                    <span className="text-[13px]">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Menú General - Estático abajo del menú principal */}
          <div className="mt-6 flex flex-col pb-2">
            <h3 className="text-[11px] font-lexend font-light text-[#DBF0DD] mb-3 uppercase tracking-[0.15em] ml-2">GENERAL</h3>
            <div className="space-y-1">
              {generalItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                      pathname === item.href
                        ? 'bg-[#DBF0DD] text-[#0B2519] font-semibold shadow-sm'
                        : 'text-[#B5D1C1] font-lexend font-light hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[13px]">{item.label}</span>
                  </Link>
                );
              })}

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[#B5D1C1] font-medium hover:text-white hover:bg-white/5 transition-all duration-200 w-full disabled:opacity-50 text-left"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-[13px]">{isLoggingOut ? 'Saliendo...' : 'Cerrar sesión'}</span>
              </button>
            </div>
          </div>
          
        </div>
      </aside>
    </>
  );
}