'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { Truck, Package, Layers, TrendingUp, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    volumenIngresadoHoy: 0,
    volumenProducidoHoy: 0,
    totalTrozas: 0,
    rendimientoGeneral: 0,
  });
  const [entradasRecientes, setEntradasRecientes] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    const today = new Date().toISOString().split('T')[0];

    const { data: produccionHoy } = await supabase
      .from('produccion_diaria')
      .select('*')
      .eq('fecha', today)
      .maybeSingle();

    const { data: entradas } = await supabase
      .from('entradas_troceria')
      .select('*')
      .order('fecha', { ascending: false })
      .limit(4);

    const { data: todasEntradas } = await supabase
      .from('entradas_troceria')
      .select('total_trozas');

    const totalTrozasSum = todasEntradas?.reduce((sum, e) => sum + (e.total_trozas || 0), 0) || 0;

    const { data: ultimas15Dias } = await supabase
      .from('produccion_diaria')
      .select('*')
      .order('fecha', { ascending: true })
      .limit(15);

    setStats({
      volumenIngresadoHoy: produccionHoy?.volumen_ingresado || 0,
      volumenProducidoHoy: produccionHoy?.volumen_producido || 0,
      totalTrozas: totalTrozasSum,
      rendimientoGeneral: produccionHoy?.volumen_ingresado
        ? ((produccionHoy?.volumen_producido / produccionHoy?.volumen_ingresado) * 100)
        : 0,
    });

    setEntradasRecientes(entradas || []);
    setChartData(ultimas15Dias || []);
  }

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Texto simple explicando que se hace aquí y que se ve"
      />

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                VOLUMEN INGRESADO HOY
              </p>
              <p className="text-2xl font-bold text-blue-500">
                {stats.volumenIngresadoHoy.toFixed(2)} m³
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                VOLUMEN PRODUCIDO HOY
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.volumenProducidoHoy.toFixed(2)} m³
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
              <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                TOTAL DE TROZAS
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.totalTrozas}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                RENDIMIENTO GENERAL
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.rendimientoGeneral.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">PRODUCCIÓN DIARIA</h2>
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Calendar className="w-4 h-4" />
              Semanal
            </button>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-sm">Gráfico de producción diaria</p>
              <p className="text-xs mt-2">(Visualización con datos de últimos 15 días)</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">RESUMEN GENERAL</h2>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total de ingreso</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.volumenIngresadoHoy.toFixed(2)} m³
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total de producción</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.volumenProducidoHoy.toFixed(2)} m³
              </span>
            </div>
            <div className="mt-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">RENDIMIENTO</h3>
                <span className="text-xs text-gray-500">Meta: 100%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${Math.min(stats.rendimientoGeneral, 100)}%` }}
                ></div>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {stats.rendimientoGeneral.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-6">ENTRADAS RECIENTES</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-600 uppercase pb-3">
                  Folio
                </th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase pb-3">
                  Trozas
                </th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase pb-3">
                  Volumen (m³)
                </th>
              </tr>
            </thead>
            <tbody>
              {entradasRecientes.map((entrada) => (
                <tr key={entrada.id} className="border-b border-gray-100">
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
                  <td className="py-4 text-sm text-gray-600 text-center">
                    {entrada.total_trozas || 0}
                  </td>
                  <td className="py-4 text-sm text-gray-600">
                    {(entrada.volumen_final || 0).toFixed(3)}
                  </td>
                </tr>
              ))}
              {entradasRecientes.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-sm text-gray-400">
                    No hay entradas recientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
