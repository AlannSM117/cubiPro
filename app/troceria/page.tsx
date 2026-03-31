'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { Plus, FileText, Layers } from 'lucide-react';
import type { EntradaTroceria } from '@/lib/supabase';

export default function TroceriaPage() {
  const router = useRouter();
  const [entradas, setEntradas] = useState<EntradaTroceria[]>([]);
  const [selectedEntrada, setSelectedEntrada] = useState<EntradaTroceria | null>(null);

  useEffect(() => {
    loadEntradas();
  }, []);

  async function loadEntradas() {
    const { data } = await supabase
      .from('entradas_troceria')
      .select('*')
      .order('fecha', { ascending: false });

    if (data) {
      setEntradas(data);
      if (data.length > 0) {
        setSelectedEntrada(data[0]);
      }
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
        className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mb-6 font-medium"
      >
        <Plus className="w-5 h-5" />
        Nueva entrada
      </button>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">LISTADO DE TROCERÍA</h2>
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
                    Trozas
                  </th>
                </tr>
              </thead>
              <tbody>
                {entradas.map((entrada) => (
                  <tr
                    key={entrada.id}
                    onClick={() => setSelectedEntrada(entrada)}
                    className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedEntrada?.id === entrada.id ? 'bg-blue-50' : ''
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
                    <td className="py-4 text-sm text-gray-600 text-center">
                      {entrada.total_trozas || 0}
                    </td>
                  </tr>
                ))}
                {entradas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-gray-400">
                      No hay entradas registradas
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
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">
                  ENTRADA SELECCIONADA
                </p>
                <p className="text-lg font-bold text-gray-900">
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
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Layers className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      VOLUMEN FINAL
                    </p>
                    <p className="text-2xl font-bold text-blue-500">
                      {selectedEntrada.volumen_final?.toFixed(2)} m³
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                    <Layers className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">TROZAS</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {selectedEntrada.total_trozas || 0}
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
