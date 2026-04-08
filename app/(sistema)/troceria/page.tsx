'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { ApiClient } from '@/lib/apiClient';
import { Plus, FileText, Layers } from 'lucide-react';

export default function TroceriaPage() {
  const router = useRouter();
  const [entradas, setEntradas] = useState<any[]>([]);
  const [selectedEntrada, setSelectedEntrada] = useState<any | null>(null);

  useEffect(() => {
    loadEntradas();
  }, []);

  async function loadEntradas() {
    try {
      const data = await ApiClient.getTrocerias();
      setEntradas(data || []);
      if (data?.length > 0) {
        setSelectedEntrada(data[0]);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function handleNuevaEntrada() {
    router.push('/troceria/nueva');
  }

  return (
    <>
      <Header
        title="Historial de trocería"
        subtitle="Visualización detallada de volúmenes totales y conteo de trozas por entrada de trocería"
      />

      <button
        onClick={handleNuevaEntrada}
        className="flex items-center gap-2 px-6 py-3 bg-[#3786E6] text-white font-lexend rounded-lg hover:bg-[#0956B6] transition-colors mb-6 font-normal"
      >
        <Plus className="w-5 h-5" />
        Nueva entrada
      </button>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-lexend font-medium text-[16px] text-[#0A2C25] mb-6 uppercase tracking-wide">LISTADO DE TROCERÍA</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#c1cac7]">
                  <th className="font-lexend font-medium text-left text-[14px] text-[#839590] pb-3">Folio (Fecha)</th>
                  <th className="font-lexend font-medium text-left text-[14px] text-[#839590] pb-3">Turno</th>
                  <th className="font-lexend font-medium text-left text-[14px] text-[#839590] pb-3">Aserradero</th>
                  <th className="font-lexend font-medium text-left text-[14px] text-[#839590] pb-3 text-center">Trozas</th>
                </tr>
              </thead>
              <tbody>
                {entradas.map((entrada) => {
                  const tzs = entrada.totalTrozas ?? entrada.total_trozas ?? entrada.trozas?.length ?? 0;
                  return (
                  <tr
                    key={entrada.id}
                    onClick={() => setSelectedEntrada(entrada)}
                    className={`border-b border-[#e0e4e3] last:border-0 hover:bg-gray-400/10 transition-colors ${
                      selectedEntrada?.id === entrada.id ? 'bg-[#f0fdf4]' : ''
                    }`}
                  >
                    <td className="font-lexend font-normal py-4 text-[14px] text-[#0A2C25]">
                      {new Date(entrada.fecha).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}{' '}
                      -{' '}
                      {new Date(entrada.fecha).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="font-lexend font-normal py-4 text-[13px] text-[#0A2C25]">{entrada.turno}</td>
                    <td className="font-lexend font-normal py-4 text-[13px] text-[#0A2C25]">{entrada.aserradero || '#1'}</td>
                    <td className="font-lexend font-normal py-4 text-[13px] text-[#0A2C25] text-center">{tzs}</td>
                  </tr>
                  );
                })}
                {entradas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="font-lexend font-normal py-8 text-center text-[16px] text-[#839590]">
                      No hay entradas registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3 Tarjetas Derecha */}
        <div className="space-y-6">
          {/* Card 1 */}
          <div className="bg-white rounded-[15px] p-3 shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-0.5">
              <div className="w-[64px] h-[64px] bg-[#f5f5f5] rounded-2xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-8 h-8 text-[#4b5563]" />
               </div>
              <div className="flex flex-col justify-center">
               <p className="font-lexend font-medium text-[12px] text-[#0A2C25] uppercase tracking-wider mb-1.5">ENTRADA SELECCIONADA</p>
                <p className="font-lexend font-normal text-[25px] leading-none text-[#0A2C25]">
                  {selectedEntrada
                    ? `${new Date(selectedEntrada.fecha).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })} - ${new Date(selectedEntrada.fecha).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`
                    : 'Ninguna'}
                </p>
              </div>
            </div>
          </div>

          {selectedEntrada && (
            <>
              {/* Card 2 */}
              <div className="bg-white rounded-[15px] p-3 shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-[64px] h-[64px] bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Layers className="w-8 h-8 text-[#3786E6]" />
                  </div>
                  <div>
                    <p className="font-lexend font-medium text-[12px] text-[#0A2C25] uppercase tracking-wider mb-1.5"> VOLUMEN FINAL</p>
                    <p className="font-lexend font-normal text-[25px] leading-none text-[#3786E6]">
                      {parseFloat(selectedEntrada.volumenTotal ?? selectedEntrada.volumen_total ?? selectedEntrada.volumenFinal ?? selectedEntrada.volumen_final ?? selectedEntrada.volumen ?? 0).toFixed(2)} m³
                    </p>
                  </div>
                </div>
              </div>
              {/* Card 3 */}
              <div className="bg-white rounded-[15px] p-3 shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-[64px] h-[64px] bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Layers className="w-8 h-8 text-[#C4670B]" />
                  </div>
                  <div>
                    <p className="font-lexend font-medium text-[12px] text-[#0A2C25] uppercase tracking-wider mb-1.5">TROZAS (CANTIDAD)</p>
                    <p className="font-lexend font-normal text-[25px] leading-none text-[#C4670B]">
                      {selectedEntrada.totalTrozas ?? selectedEntrada.total_trozas ?? selectedEntrada.trozas?.length ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
