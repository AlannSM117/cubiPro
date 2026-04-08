'use client';

import { useEffect, useState } from 'react';
import { ApiClient } from '@/lib/apiClient';
import Header from '@/components/layout/Header';
import { Truck, Factory, Layers, TrendingUp, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    volumenIngresadoHoy: 0,
    volumenProducidoHoy: 0,
    totalTrozas: 0,
    rendimientoGeneral: 0,
    trozasIngresadasHoy: 0,
    piezasProducidasHoy: 0,
  });
  const [entradasRecientes, setEntradasRecientes] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      // Cargar métricas, entradas recientes y gráfico en paralelo
      const [metrics, recent, chart] = await Promise.allSettled([
        ApiClient.getDashboardMetrics(),
        ApiClient.getDashboardRecentEntries(),
        ApiClient.getDashboardChart(),
      ]);

      if (metrics.status === 'fulfilled' && metrics.value) {
        const m = metrics.value;
        setStats({
          volumenIngresadoHoy: parseFloat(m.volumenIngresadoHoy ?? 0),
          volumenProducidoHoy: parseFloat(m.volumenProducidoHoy ?? 0),
          // El backend devuelve totalTrozasHoy
          totalTrozas: parseInt(m.totalTrozasHoy ?? m.totalTrozas ?? 0, 10),
          rendimientoGeneral: parseFloat(m.rendimientoGeneral ?? 0),
          trozasIngresadasHoy: parseInt(m.totalTrozasHoy ?? 0, 10),
          piezasProducidasHoy: parseInt(m.piezasProducidasHoy ?? 0, 10),
        });
      }

      setEntradasRecientes(recent.status === 'fulfilled' ? (recent.value || []) : []);

      // El backend devuelve { date, ingreso, produccion } — mapeamos a { fecha, rendimiento }
      if (chart.status === 'fulfilled' && Array.isArray(chart.value)) {
        const mapped = chart.value.map((item: any) => ({
          fecha: item.fecha ?? item.date ?? '',
          ingreso: item.ingreso ?? 0,
          produccion: item.produccion ?? 0,
          rendimiento: item.ingreso > 0
            ? parseFloat(((item.produccion / item.ingreso) * 100).toFixed(2))
            : 0,
        }));
        setChartData(mapped);
      } else {
        setChartData([]);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
      />

      {/* 4 Tarjetas Superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-white rounded-[20px] p-3 shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-[64px] h-[64px] bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Truck className="w-8 h-8 text-[#3786E6]" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="font-lexend font-medium text-[12px] text-[#0A2C25] uppercase tracking-wider mb-1.5">VOLUMEN INGRESADO HOY</p>
            <p className="font-lexend font-normal text-[25px] leading-none text-[#3786E6]">
              {stats.volumenIngresadoHoy.toFixed(2)} <span className="text-xl">m³</span>
            </p>
          </div>
        </div>
        {/* Card 2 */}
        <div className="bg-white rounded-[20px] p-3 shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-[64px] h-[64px] bg-green-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Factory className="w-8 h-8 text-[#09934D]" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="font-lexend font-medium text-[12px] text-[#0A2C25] uppercase tracking-wider mb-1.5">VOLUMEN PRODUCIDO HOY</p>
            <p className="font-lexend font-normal text-[25px] leading-none text-[#09934D]">
              {stats.volumenProducidoHoy.toFixed(2)} <span className="text-xl">m³</span>
            </p>
          </div>
        </div>
        {/* Card 3 */}
        <div className="bg-white rounded-[20px] p-3 shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-[64px] h-[64px] bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Layers className="w-8 h-8 text-[#C4670B]" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="font-lexend font-medium text-[12px] text-[#0A2C25] uppercase tracking-wider mb-1.5">TOTAL DE TROZAS</p>
            <p className="font-lexend font-normal text-[25px] leading-none text-[#C4670B]">
              {stats.totalTrozas}
            </p>
          </div>
        </div>
        {/* Card 4 */}
        <div className="bg-white rounded-[20px] p-3 shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-[64px] h-[64px] bg-purple-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-8 h-8 text-[#BD37E6]" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="font-lexend font-medium text-[12px] text-[#0A2C25] uppercase tracking-wider mb-1.5">RENDIMIENTO GENERAL</p>
            <p className="font-lexend font-normal text-[25px] leading-none text-[#BD37E6]">
              {stats.rendimientoGeneral.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Sección Central: Gráfico y Resumen*/}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Gráfico - PRODUCCIÓN DIARIA */}
        <div className="col-span-2 bg-white rounded-[20px] p-6 shadow-sm border border-gray-100/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-lexend font-medium text-[16px] text-[#0A2C25] uppercase tracking-wide">PRODUCCIÓN DIARIA</h2>
            <button className="font-lexend font-normal flex items-center gap-2 px-4 py-2 text-[14px] text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Calendar className="w-4 h-4"/>Semanal
            </button>
          </div>
          <div className="flex-1 h-64 mt-4 w-full text-gray-400 min-h-[250px]">
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorIngreso" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3786E6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3786E6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProduccion" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#09934D" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#09934D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="fecha"
                    tickFormatter={(val) => {
                      if (!val) return '';
                      try {
                        const d = new Date(val);
                        const correctedDate = new Date(d.getTime() + Math.abs(d.getTimezoneOffset() * 60000));
                        return correctedDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
                      } catch { return val; }
                    }}
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val} m³`}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any, name: string) => {
                      if (name === 'ingreso') return [`${parseFloat(value).toFixed(3)} m³`, 'Ingreso'];
                      if (name === 'produccion') return [`${parseFloat(value).toFixed(3)} m³`, 'Producción'];
                      return [value, name];
                    }}
                    labelFormatter={(label) => {
                      try {
                        const d = new Date(label);
                        const correctedDate = new Date(d.getTime() + Math.abs(d.getTimezoneOffset() * 60000));
                        return correctedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                      } catch { return label; }
                    }}
                  />
                  <Legend
                    formatter={(value) => value === 'ingreso' ? 'Ingreso (m³)' : 'Producción (m³)'}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="ingreso"
                    stroke="#3786E6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorIngreso)"
                    activeDot={{ r: 5, strokeWidth: 0, fill: '#3786E6' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="produccion"
                    stroke="#09934D"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorProduccion)"
                    activeDot={{ r: 5, strokeWidth: 0, fill: '#09934D' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <TrendingUp className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-500">No hay datos suficientes para el gráfico</p>
                <p className="text-xs text-gray-400 mt-1">Conecta con la API para visualizar el rendimiento</p>
              </div>
            )}
          </div>
        </div>

        {/* Resumen General - RESUMEN GENERAL */}
        <div className="bg-white rounded-[20px] p-8 shadow-sm border border-gray-100/50 flex flex-col">
          <h2 className="font-lexend font-medium text-[16px] text-[#0A2C25] mb-8 uppercase tracking-wide">RESUMEN GENERAL</h2>
          
          <div className="space-y-6 flex-1">
            <div className="flex justify-between items-center">
              <span className="font-lexend font-medium text-[15px] text-[#839590]">Total de ingreso</span>
              <span className="font-lexend font-medium text-[15px] text-[#0A2C25]">
                {stats.volumenIngresadoHoy.toFixed(2)} m³
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-lexend font-medium text-[15px] text-[#839590]">Total de producción</span>
              <span className="font-lexend font-medium text-[15px] text-[#0A2C25]">
                {stats.volumenProducidoHoy.toFixed(2)} m³
              </span>
            </div>

            <hr className="border-[#c1cac7]" />

            <div className="mt-auto pt-2">
              <h3 className="font-lexend font-medium text-[16px] text-[#0A2C25] mb-8 uppercase tracking-wide">RENDIMIENTO</h3>
              
              <div className="w-full bg-gray-200 rounded-full h-3.5 mb-3">
                <div
                  className="bg-[#BD37E6] h-3.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(stats.rendimientoGeneral, 100)}%` }}
                ></div>
              </div>
              
              <div className="flex items-end justify-between">
                <p className="font-lexend font-normal text-[25px] leading-none text-[#BD37E6]">
                  {stats.rendimientoGeneral.toFixed(1)}%
                </p>
                <span className="font-lexend font-medium text-xs text-gray-500 pb-1">Meta: 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección Inferior: Entradas Recientes con Bordes de 20px */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100/50">
          <h2 className="font-lexend font-medium text-[16px] text-[#0A2C25] mb-6 uppercase tracking-wide">ENTRADAS RECIENTES</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#c1cac7]">
                  <th className="font-lexend font-medium text-left text-[14px] text-[#839590] pb-4">Folio</th>
                  <th className="font-lexend font-medium text-center text-[14px] text-[#839590] pb-4">Trozas</th>
                  <th className="font-lexend font-medium text-right text-[14px] text-[#839590] pb-4">Volumen (m³)</th>
                </tr>
              </thead>
              <tbody>
                {entradasRecientes.slice(0, 4).map((entrada) => (
                  <tr key={entrada.id} className="border-b border-[#e0e4e3] last:border-0 hover:bg-gray-400/10 transition-colors">
                    <td className="font-lexend font-normal py-4 text-[13px] text-[#0A2C25]">
                      {new Date(entrada.fecha).toLocaleDateString('es-ES', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                      })} - {new Date(entrada.fecha).toLocaleTimeString('es-ES', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="font-lexend font-normal py-4 text-[13px] text-gray-600 text-center">
                      {entrada.totalTrozas ?? entrada.total_trozas ?? entrada.trozas?.length ?? 0}
                    </td>
                    <td className="font-lexend font-normal py-4 text-[13px] text-gray-600 text-right pr-2">
                      {parseFloat(entrada.volumenTotal ?? entrada.volumen_total ?? entrada.volumenFinal ?? entrada.volumen_final ?? entrada.volumen ?? 0).toFixed(3)}
                    </td>
                  </tr>
                ))}
                {entradasRecientes.length === 0 && (
                  <tr>
                    <td colSpan={3} className="font-lexend font-normal py-8 text-center text-[16px] text-[#839590]">
                      No hay entradas recientes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}