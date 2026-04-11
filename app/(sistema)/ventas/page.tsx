'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { ShoppingCart, FileText, Users, Truck, BarChart3, ArrowLeft } from 'lucide-react';

export default function VentasPage() {
  const router = useRouter();

  return (
    <>
      <Header
        title="Ventas"
        subtitle="Cotizaciones y facturación"
      />
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-20 px-6 mt-6 animate-in fade-in duration-500">
        
        {/* Icono Principal con animación de pulso (actividad comercial) */}
       <div className="w-24 h-24 bg-emerald-50/50 rounded-full flex items-center justify-center mb-8 border-8 border-emerald-50/30 relative">
          <div className="absolute inset-0 rounded-full border border-emerald-100 animate-[spin_10s_linear_infinite]" />
          <ShoppingCart className="w-10 h-10 text-[#039343]" />
        </div>
        
        {/* Textos Principales */}
        <h2 className="font-lexend font-medium text-[22px] sm:text-[26px] text-[#0A2C25] mb-3 text-center tracking-tight">
          Módulo de ventas en diseño
        </h2>
        <p className="font-lexend font-normal text-[#839590] text-[14px] sm:text-[15px] max-w-xl text-center mb-12 leading-relaxed">
          Estamos definiendo las mejores herramientas para gestionar el ciclo comercial de <strong>Cubi</strong>. Muy pronto podrás controlar pedidos, clientes y despachos desde aquí.
        </p>

        {/* Tarjetas Conceptuales de "Lo que viene" */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full mb-12">
          
          <div className="p-6 rounded-[24px] bg-[#F4F7F6]/40 border border-gray-100 flex flex-col items-center text-center transition-all hover:bg-[#F4F7F6]/80 hover:border-gray-200">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-[#3786E6]">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-lexend font-medium text-[15px] text-[#0A2C25] mb-2 uppercase tracking-wide">Pedidos</h3>
            <p className="font-lexend font-normal text-[13px] text-[#839590]">Creación de cotizaciones y gestión de órdenes de venta de madera.</p>
          </div>

          <div className="p-6 rounded-[24px] bg-[#F4F7F6]/40 border border-gray-100 flex flex-col items-center text-center transition-all hover:bg-[#F4F7F6]/80 hover:border-gray-200">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-[#039343]">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-lexend font-medium text-[15px] text-[#0A2C25] mb-2 uppercase tracking-wide">Clientes</h3>
            <p className="font-lexend font-normal text-[13px] text-[#839590]">Base de datos centralizada de compradores y su historial de pedidos.</p>
          </div>

          <div className="p-6 rounded-[24px] bg-[#F4F7F6]/40 border border-gray-100 flex flex-col items-center text-center transition-all hover:bg-[#F4F7F6]/80 hover:border-gray-200">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-[#C4670B]">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-lexend font-medium text-[15px] text-[#0A2C25] mb-2 uppercase tracking-wide">Envíos</h3>
            <p className="font-lexend font-normal text-[13px] text-[#839590]">Seguimiento de logística y despacho de producto terminado (tablas/trozas).</p>
          </div>

          <div className="p-6 rounded-[24px] bg-[#F4F7F6]/40 border border-gray-100 flex flex-col items-center text-center transition-all hover:bg-[#F4F7F6]/80 hover:border-gray-200">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-purple-600">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-lexend font-medium text-[15px] text-[#0A2C25] mb-2 uppercase tracking-wide">Reportes</h3>
            <p className="font-lexend font-normal text-[13px] text-[#839590]">Estadísticas de ventas por periodo, cliente y tipo de producto.</p>
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