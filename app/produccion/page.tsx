'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { Plus, Cloud } from 'lucide-react';

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
    const { data } = await supabase
      .from('entradas_produccion')
      .select('*')
      .order('fecha', { ascending: false });

    setEntradas(data || []);
    if (data && data.length > 0) {
      setSelectedEntrada(data[0]);
    }
    setIsLoading(false);
  }

  return (
    <>
      <Header
        title="Historial de madera en tabla"
        subtitle="Visualización detallada de volúmenes totales y conteo de piezas por entrada de producción"
      />

      <button
        onClick={() => router.push('/produccion/nueva')}
        className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium mb-6"
      >
        <Plus className="w-5 h-5" />
        Nueva entrada
      </button>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">LISTADO DE MADERA EN TABLA</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase pb-3">
                    Folio
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase pb-3">
                    Turno
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase pb-3">
                    Aserradero
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase pb-3">
                    Piezas
                  </th>
                </tr>
              </thead>
              <tbody>
                {entradas.map((entrada) => (
                  <tr
                    key={entrada.id}
                    onClick={() => setSelectedEntrada(entrada)}
                    className={`border-b border-gray-100 cursor-pointer transition-colors ${
                      selectedEntrada?.id === entrada.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="py-4 text-sm text-gray-900">
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
                    <td className="py-4 text-sm text-gray-600">{entrada.turno}</td>
                    <td className="py-4 text-sm text-gray-600 text-center">{entrada.aserradero}</td>
                    <td className="py-4 text-sm text-gray-600 text-center">{entrada.total_piezas || 0}</td>
                  </tr>
                ))}
                {entradas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-gray-400">
                      No hay entradas de producción
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Cloud className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">ENTRADA SELECCIONADA</p>
                {selectedEntrada ? (
                  <p className="text-lg font-bold text-gray-900">
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
                  <p className="text-lg font-bold text-gray-400">-</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Cloud className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-1">VOLUMEN TOTAL</p>
                <p className="text-2xl font-bold text-green-600">
                  {selectedEntrada ? selectedEntrada.volumen_producido.toFixed(2) : '0.00'} m³
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Cloud className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-1">PIEZAS</p>
                <p className="text-2xl font-bold text-orange-600">
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
