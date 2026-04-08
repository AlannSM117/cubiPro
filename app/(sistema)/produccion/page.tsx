'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { db } from '@/lib/localDb';
import { Plus, FileText, Layers } from 'lucide-react';

interface EntradaProduccion {
  id: string;
  folio: string;
  fecha: string;
  turno: string;
  aserradero: number;
  volumen_producido: number;
  total_piezas: number;
}

export default function ProduccionPage() {
  const router = useRouter();
  const [entradas, setEntradas] = useState<EntradaProduccion[]>([]);
  const [selectedEntrada, setSelectedEntrada] = useState<EntradaProduccion | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEntradas();
  }, []);

  async function loadEntradas() {
    setIsLoading(true);
    const { data } = await db
      .from('entradas_produccion')
      .select('*')
      .order('fecha', { ascending: false });

    setEntradas(data || []);
    if (data && data.length > 0) {
      setSelectedEntrada(data[0]);
    }
    setIsLoading(false);
  }

  function handleNuevaEntrada() {
    router.push('/produccion/nueva');
  }

  return (
    <>
      <Header
        title="Historial de madera en tabla"
        subtitle="Visualización detallada de volúmenes totales y conteo de piezas por entrada de producción"
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
          <h2 className="font-lexend font-medium text-[16px] text-[#0A2C25] mb-6 uppercase tracking-wide">LISTADO DE MADERA EN TABLA</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#c1cac7]">
                  <th className="font-lexend font-medium text-left text-[14px] text-[#839590] pb-3">Folio</th>
                  <th className="font-lexend font-medium text-left text-[14px] text-[#839590] pb-3">Turno</th>
                  <th className="font-lexend font-medium text-left text-[14px] text-[#839590] pb-3">Aserradero</th>
                  <th className="font-lexend font-medium text-left text-[14px] text-[#839590] pb-3">Piezas</th>
                </tr>
              </thead>
              <tbody>
                {entradas.map((entrada) => (
                  <tr
                    key={entrada.id}
                    onClick={() => setSelectedEntrada(entrada)}
                    className={`border-b border-[#e0e4e3] last:border-0 hover:bg-gray-400/10 transition-colors ${
                      selectedEntrada?.id === entrada.id ? 'bg-blue-50' : 'hover:bg-gray-50'
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
                    <td className="font-lexend font-normal py-4 text-[13px] text-[#0A2C25] text-center">{entrada.aserradero}</td>
                    <td className="font-lexend font-normal py-4 text-[13px] text-[#0A2C25] text-center">{entrada.total_piezas || 0}</td>
                  </tr>
                ))}
                {entradas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="font-lexend font-normal py-8 text-center text-[16px] text-[#839590]">
                      No hay entradas de producción
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
              <div>
                <p className="font-lexend font-medium text-[12px] text-[#0A2C25] uppercase tracking-wider mb-1.5">ENTRADA SELECCIONADA</p>
                {selectedEntrada ? (
                  <p className="font-lexend font-normal text-[25px] leading-none text-[#0A2C25]">
                    {new Date(selectedEntrada.fecha).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}{' '}
                    -{' '}
                    {new Date(selectedEntrada.fecha).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                ) : (
                  <p className="text-lg font-bold text-[#839590]">-</p>
                )}
              </div>
            </div>
          </div>
          {/* Card 2 */}
          <div className="bg-white rounded-[15px] p-3 shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="w-[64px] h-[64px] bg-green-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Layers className="w-8 h-8 text-[#09934D]" />
              </div>
              <div>
                <p className="font-lexend font-medium text-[12px] text-[#0A2C25] uppercase tracking-wider mb-1.5">VOLUMEN TOTAL</p>
                <p className="font-lexend font-normal text-[25px] leading-none text-[#09934D]">
                  {selectedEntrada ? selectedEntrada.volumen_producido.toFixed(2) : '0.00'} m³
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
                <p className="font-lexend font-medium text-[12px] text-[#0A2C25] uppercase tracking-wider mb-1.5">PIEZAS (CANTIDAD)</p>
                <p className="font-lexend font-normal text-[25px] leading-none text-[#C4670B]">
                  {selectedEntrada ? String(selectedEntrada.total_piezas || 0).padStart(3, '0') : '000'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
