'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { BarChart, FileDown, PieChart, History, TrendingUp, ArrowLeft } from 'lucide-react';

export default function ReportesPage() {
  const router = useRouter();

  return (
    <>
      <Header
        title="Reportes"
        subtitle="Generación de documentos y estadísticas"
      />
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-20 px-6 mt-6 animate-in fade-in duration-500">
        
        {/* Icono Principal con efecto de aura/datos */}

        <div className="w-24 h-24 bg-purple-100/50 rounded-full flex items-center justify-center mb-8 border-8 border-purple-100/30 relative">
          <div className="absolute inset-0 rounded-full border border-purple-200 animate-[spin_10s_linear_infinite]" />
          <BarChart className="w-10 h-10 text-[#BD37E6]" />
        </div>

        {/* Textos Principales */}
        <h2 className="font-lexend font-medium text-[22px] sm:text-[26px] text-[#0A2C25] mb-3 text-center tracking-tight">
          Módulo de reportes en diseño
        </h2>
        <p className="font-lexend font-normal text-[#839590] text-[14px] sm:text-[15px] max-w-xl text-center mb-12 leading-relaxed">
          Estamos preparando el motor de análisis de <strong>Cubi</strong>. Muy pronto podrás generar documentos formales, exportar tus datos y visualizar el rendimiento histórico del aserradero.
        </p>

        {/* Tarjetas Conceptuales de "Lo que viene" (La apuesta segura) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full mb-12">
          
          {/* La más importante que mencionaste: PDF */}
          <div className="p-6 rounded-[24px] bg-[#F4F7F6]/40 border border-gray-100 flex flex-col items-center text-center transition-all hover:bg-[#F4F7F6]/80 hover:border-gray-200">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-red-500">
              <FileDown className="w-6 h-6" />
            </div>
            <h3 className="font-lexend font-medium text-[15px] text-[#0A2C25] mb-2 uppercase tracking-wide">Exportar Documentos</h3>
            <p className="font-lexend font-normal text-[13px] text-[#839590]">Generación automática de reportes en formato PDF listos para imprimir.</p>
          </div>

          <div className="p-6 rounded-[24px] bg-[#F4F7F6]/40 border border-gray-100 flex flex-col items-center text-center transition-all hover:bg-[#F4F7F6]/80 hover:border-gray-200">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-[#3786E6]">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="font-lexend font-medium text-[15px] text-[#0A2C25] mb-2 uppercase tracking-wide">Gráficos Visuales</h3>
            <p className="font-lexend font-normal text-[13px] text-[#839590]">Análisis visual del volumen de trocería vs. el volumen de producción final.</p>
          </div>

          <div className="p-6 rounded-[24px] bg-[#F4F7F6]/40 border border-gray-100 flex flex-col items-center text-center transition-all hover:bg-[#F4F7F6]/80 hover:border-gray-200">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-[#039343]">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-lexend font-medium text-[15px] text-[#0A2C25] mb-2 uppercase tracking-wide">Métricas de Rendimiento</h3>
            <p className="font-lexend font-normal text-[13px] text-[#839590]">Medición de la eficiencia del aserradero y cálculo de mermas de madera.</p>
          </div>

          <div className="p-6 rounded-[24px] bg-[#F4F7F6]/40 border border-gray-100 flex flex-col items-center text-center transition-all hover:bg-[#F4F7F6]/80 hover:border-gray-200">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-[#C4670B]">
              <History className="w-6 h-6" />
            </div>
            <h3 className="font-lexend font-medium text-[15px] text-[#0A2C25] mb-2 uppercase tracking-wide">Historial por Fechas</h3>
            <p className="font-lexend font-normal text-[13px] text-[#839590]">Filtros avanzados para consultar el inventario por días, semanas o meses.</p>
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