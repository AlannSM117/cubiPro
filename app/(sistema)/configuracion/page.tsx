'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Settings, UserCog, Palette, BellRing, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function ConfiguracionPage() {
  const router = useRouter();

  return (
    <>
      <Header
        title="Configuración"
        subtitle="Ajustes y personalización"
      />
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-20 px-6 mt-6 animate-in fade-in duration-500">
        
        {/* Icono Principal con animación de engranaje */}
        <div className="w-24 h-24 bg-blue-50/50 rounded-full flex items-center justify-center mb-8 border-8 border-blue-50/30 relative">
          <div className="absolute inset-0 rounded-full border border-blue-100 animate-[spin_8s_linear_infinite]" />
          <Settings className="w-10 h-10 text-[#3786E6]" />
        </div>

        {/* Textos Principales */}
        <h2 className="font-lexend font-medium text-[22px] sm:text-[26px] text-[#0A2C25] mb-3 text-center tracking-tight">
          Módulo de ajustes en desarrollo
        </h2>
        <p className="font-lexend font-normal text-[#839590] text-[14px] sm:text-[15px] max-w-xl text-center mb-12 leading-relaxed">
          Estamos construyendo las herramientas para que puedas personalizar <strong>Cubi</strong> según tus necesidades. Aquí es donde tomarás el control total del sistema.
        </p>

        {/* Tarjetas de "Lo que viene" */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full mb-12">
          
          <div className="p-6 rounded-[24px] bg-[#F4F7F6]/40 border border-gray-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-[#039343]">
              <UserCog className="w-6 h-6" />
            </div>
            <h3 className="font-lexend font-medium text-[15px] text-[#0A2C25] mb-2 uppercase tracking-wide">Gestión de Perfil</h3>
            <p className="font-lexend font-normal text-[13px] text-[#839590]">Personalización de datos personales, fotos de perfil y roles de acceso.</p>
          </div>

          <div className="p-6 rounded-[24px] bg-[#F4F7F6]/40 border border-gray-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-[#3786E6]">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="font-lexend font-medium text-[15px] text-[#0A2C25] mb-2 uppercase tracking-wide">Apariencia</h3>
            <p className="font-lexend font-normal text-[13px] text-[#839590]">Alternancia entre modo claro y oscuro, y selección de temas visuales.</p>
          </div>

          <div className="p-6 rounded-[24px] bg-[#F4F7F6]/40 border border-gray-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-[#C4670B]">
              <BellRing className="w-6 h-6" />
            </div>
            <h3 className="font-lexend font-medium text-[15px] text-[#0A2C25] mb-2 uppercase tracking-wide">Notificaciones</h3>
            <p className="font-lexend font-normal text-[13px] text-[#839590]">Configuración de alertas para inventario bajo y reportes diarios.</p>
          </div>

          <div className="p-6 rounded-[24px] bg-[#F4F7F6]/40 border border-gray-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-red-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-lexend font-medium text-[15px] text-[#0A2C25] mb-2 uppercase tracking-wide">Seguridad</h3>
            <p className="font-lexend font-normal text-[13px] text-[#839590]">Cambio de contraseñas, auditoría de sesiones y protección de cuenta.</p>
          </div>

        </div>

        {/* Botón de Regreso */}
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 rounded-xl font-lexend font-medium transition-all text-[14px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al panel principal
        </button>

      </div>
    </>
  );
}