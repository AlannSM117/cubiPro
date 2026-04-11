'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { LifeBuoy, BookOpen, MessageCircleQuestion, Headset, ArrowLeft } from 'lucide-react';

export default function AyudaPage() {
  const router = useRouter();

  return (
    <>
      <Header
        title="Ayuda y soporte"
        subtitle="Centro de asistencia para el usuario"
      />
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-20 px-6 mt-6 animate-in fade-in duration-500">
        
        {/* Icono Principal */}
        <div className="w-24 h-24 bg-orange-100/50 rounded-full flex items-center justify-center mb-8 border-8 border-orange-100/30 relative">
          <div className="absolute inset-0 rounded-full border border-orange-200 animate-[spin_10s_linear_infinite]" />
          <LifeBuoy className="w-10 h-10 text-[#C4670B]" />
        </div>

        {/* Textos Principales */}
        <h2 className="font-lexend font-medium text-[22px] sm:text-[26px] text-[#0A2C25] mb-3 text-center">
          Módulo de ayuda en desarrollo
        </h2>
        <p className="font-lexend font-normal text-[#839590] text-[14px] sm:text-[15px] max-w-xl text-center mb-12 leading-relaxed">
          Estamos preparando un espacio completo para ayudarte a dominar <strong>Cubi</strong>. Muy pronto tendrás a tu disposición todas las herramientas para resolver tus dudas rápidamente.
        </p>

        {/* Tarjetas de "Próximamente" */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full mb-12">
          
          <div className="p-6 rounded-[20px] bg-[#F4F7F6]/50 border border-gray-100 flex flex-col items-center text-center transition-all hover:bg-[#F4F7F6]">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-[#3786E6]">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-lexend font-medium text-[15px] text-[#0A2C25] mb-2">Manuales de uso</h3>
            <p className="font-lexend font-normal text-[13px] text-[#839590]">Guías detalladas paso a paso para cada módulo del sistema.</p>
          </div>

          <div className="p-6 rounded-[20px] bg-[#F4F7F6]/50 border border-gray-100 flex flex-col items-center text-center transition-all hover:bg-[#F4F7F6]">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-[#C4670B]">
              <MessageCircleQuestion className="w-6 h-6" />
            </div>
            <h3 className="font-lexend font-medium text-[15px] text-[#0A2C25] mb-2">Preguntas frecuentes</h3>
            <p className="font-lexend font-normal text-[13px] text-[#839590]">Soluciones inmediatas a las dudas más comunes de la operación.</p>
          </div>

          <div className="p-6 rounded-[20px] bg-[#F4F7F6]/50 border border-gray-100 flex flex-col items-center text-center transition-all hover:bg-[#F4F7F6]">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-[#039343]">
              <Headset className="w-6 h-6" />
            </div>
            <h3 className="font-lexend font-medium text-[15px] text-[#0A2C25] mb-2">Soporte directo</h3>
            <p className="font-lexend font-normal text-[13px] text-[#839590]">Contacto directo con los administradores para asistencia técnica.</p>
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