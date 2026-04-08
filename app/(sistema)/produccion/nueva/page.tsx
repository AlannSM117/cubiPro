'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { ApiClient } from '@/lib/apiClient';
import { ArrowLeft, Plus, Save, Trash2, FileText, Cloud } from 'lucide-react';

type PiezaForm = {
  id: string;
  grueso: string;
  clase: string;
  ancho: number;
  largo: number;
  verde: number;
  estufa: number;
  pies_tabla: number;
  volumen_m3: number;
};

function parseFraction(val: string): number {
  if (!val) return 0;
  try {
    const parts = val.trim().split(' ');
    if (parts.length === 2) {
      const whole = parseFloat(parts[0]);
      const frac = parts[1].split('/');
      return whole + (parseFloat(frac[0]) / parseFloat(frac[1]));
    } else if (val.includes('/')) {
      const frac = val.split('/');
      return parseFloat(frac[0]) / parseFloat(frac[1]);
    }
    return parseFloat(val) || 0;
  } catch {
    return 0;
  }
}

const turnoAserraderoMap: Record<string, number> = {
  'Matutino': 1,
  'Vespertino': 2,
  'Nocturno': 3,
};

export default function NuevaProduccionPage() {
  const router = useRouter();
  const [fecha, setFecha] = useState(new Date());
  const [turno, setTurno] = useState('Matutino');
  const [piezas, setPiezas] = useState<PiezaForm[]>([
    {
      id: crypto.randomUUID(),
      grueso: '',
      clase: '2',
      ancho: 0,
      largo: 0,
      verde: 0,
      estufa: 0,
      pies_tabla: 0,
      volumen_m3: 0,
    },
  ]);

  function calcularPiesTabla(pieza: Omit<PiezaForm, 'pies_tabla'|'volumen_m3'>) {
    const gruesoVal = parseFraction(pieza.grueso);
    const pzas = pieza.verde + pieza.estufa;
    if (pzas === 0 || gruesoVal === 0 || pieza.ancho === 0 || pieza.largo === 0) return 0;
    // (PZAS x GRUESO x ANCHO x LARGO) / 12
    return (pzas * gruesoVal * pieza.ancho * pieza.largo) / 12;
  }

  function calcularVolumen(pieza: Omit<PiezaForm, 'pies_tabla'|'volumen_m3'>) {
    const gruesoVal = parseFraction(pieza.grueso);
    const pzas = pieza.verde + pieza.estufa;
    if (pzas === 0 || gruesoVal === 0 || pieza.ancho === 0 || pieza.largo === 0) return 0;
    // Convertir de ft a m3 basado en conversiones estándar o mantener la original según necesidad
    // 1 pie tabla = 0.002359737 m3
    const piesTabla = (pzas * gruesoVal * pieza.ancho * pieza.largo) / 12;
    return piesTabla * 0.002359737; 
  }

  function handlePiezaChange(id: string, field: keyof PiezaForm, value: any) {
    setPiezas((prev) =>
      prev.map((pieza) => {
        if (pieza.id === id) {
          const updated = { ...pieza, [field]: value };
          if (field === 'verde' || field === 'estufa' || field === 'grueso' || field === 'ancho' || field === 'largo') {
            return {
              ...updated,
              pies_tabla: calcularPiesTabla(updated),
              volumen_m3: calcularVolumen(updated),
            };
          }
          return updated;
        }
        return pieza;
      })
    );
  }

  function agregarPieza() {
    setPiezas([
      ...piezas,
      {
        id: crypto.randomUUID(),
        grueso: '',
        clase: '2',
        ancho: 0,
        largo: 0,
        verde: 0,
        estufa: 0,
        pies_tabla: 0,
        volumen_m3: 0,
      },
    ]);
  }

  function eliminarPieza(id: string) {
    if (piezas.length > 1) {
      setPiezas(piezas.filter((p) => p.id !== id));
    }
  }

  async function finalizarEntrada() {
    try {
      // 1. Create Entrada
      const entrada = await ApiClient.createEntradaProduccion({
        fecha: fecha.toISOString(),
        turno,
      });

      // 2. Add each Pieza
      for (const p of piezas) {
        await ApiClient.addPieza(entrada.id, {
          grueso: parseFraction(p.grueso),
          clase: parseInt(p.clase, 10),
          ancho: p.ancho,
          largo: p.largo,
          verde: p.verde,
          estufa: p.estufa,
        });
      }

      // 3. Finalize Entrada
      await ApiClient.finalizarEntradaProduccion(entrada.id);

      router.push('/produccion');
    } catch (e: any) {
      alert('Error en el proceso: ' + e.message);
    }
  }

  function descartarEntrada() {
    if (confirm('¿Está seguro de descartar esta entrada?')) {
      router.push('/produccion');
    }
  }

  const volumenTotalProduccion = piezas.reduce((sum, p) => sum + p.volumen_m3, 0);
  const piesTablaTotal = piezas.reduce((sum, p) => sum + p.pies_tabla, 0);
  const piezasUnidadesTotal = piezas.reduce((sum, p) => sum + p.verde + p.estufa, 0);

  return (
    <>
      <Header
        title="Entrada de madera en tabla"
        subtitle="Captura de dimensiones, clasificación y cálculo automático de volumen"
      />

      <button
        onClick={() => router.push('/produccion')}
        className="flex items-center gap-2 text-[#839590] hover:text-[#0A2C25] mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-lexend font-normal">Regresar a historial de madera en tabla</span>
      </button>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="font-lexend font-medium text-[16px] text-[#0A2C25] mb-6 uppercase tracking-wide">DATOS DE ENTRADA</h2>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block font-lexend font-medium text-left text-[14px] text-[#839590] pb-3">Fecha</label>
                <input
                  type="date"
                  value={`${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [year, month, day] = e.target.value.split('-');
                      const newDate = new Date(fecha);
                      newDate.setFullYear(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
                      setFecha(newDate);
                    }
                  }}
                  className="w-full px-2 font-lexend font-normal py-4 text-[13px] text-[#0A2C25] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block font-lexend font-medium text-left text-[14px] text-[#839590] pb-3">Turno</label>
                <select
                  value={turno}
                  onChange={(e) => setTurno(e.target.value)}
                  className="w-full px-2 font-lexend font-normal py-4 text-[13px] text-[#0A2C25] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Matutino">Matutino</option>
                  <option value="Vespertino">Vespertino</option>
                  <option value="Nocturno">Nocturno</option>
                </select>
              </div>
              <div>
                <label className="block font-lexend font-medium text-left text-[14px] text-[#839590] pb-3">Aserradero</label>
                <div className="w-full px-2 font-lexend font-normal py-3 text-[#0A2C25] border border-gray-300 rounded-lg items-center">
                  <span className="font-lexend font-medium text-left text-[13px] text-[#839590]">{turnoAserraderoMap[turno]}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={finalizarEntrada}
              className="flex items-center gap-2 px-6 py-3 bg-[#08C565] text-white font-lexend rounded-lg hover:bg-[#09934D] transition-colors font-normal"
            >
              <Save className="w-5 h-5" />
              Finalizar entrada
            </button>
            <button
              onClick={descartarEntrada}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white font-lexend rounded-lg hover:bg-red-700 transition-colors font-normal"
            >
              Descartar entrada
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-lexend font-medium text-[16px] text-[#0A2C25] mb-6 uppercase tracking-wide">PIEZAS</h2>
            <div className="overflow-x-auto mb-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#c1cac7]">
                    <th className="font-lexend font-medium text-left text-[14px] text-[#839590] pb-3">Grueso</th>
                    <th className="font-lexend font-medium text-left text-[14px] text-[#839590] pb-3">Clase</th>
                    <th className="font-lexend font-medium text-left text-[14px] text-[#839590] pb-3">Ancho</th>
                    <th className="font-lexend font-medium text-left text-[14px] text-[#839590] pb-3">Largo</th>
                    <th className="font-lexend font-medium text-left text-[14px] text-[#839590] pb-3">Verde</th>
                    <th className="font-lexend font-medium text-left text-[14px] text-[#839590] pb-3">Estufa</th>
                    <th className="font-lexend font-medium text-left text-[14px] text-[#839590] pb-3">Pies Tabla</th>
                    <th className="font-lexend font-medium text-left text-[14px] text-[#839590] pb-3">Volumen m³</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {piezas.map((pieza) => (
                    <tr key={pieza.id} className="border-b border-[#e0e4e3]">
                      <td className="font-lexend font-normal py-4 text-[13px] text-[#0A2C25] px-2">
                        <input
                          type="text"
                          value={pieza.grueso}
                          onChange={(e) =>
                            handlePiezaChange(pieza.id, 'grueso', e.target.value)
                          }
                          placeholder="Ej. 1 1/2"
                          className="w-20 px-3 py-2 border border-gray-300 rounded text-sm"
                        />

                      </td>

                      <td className="font-lexend font-normal py-4 text-[13px] text-[#0A2C25] px-2">
                        <select
                          value={pieza.clase}
                          onChange={(e) => handlePiezaChange(pieza.id, 'clase', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        >
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                        </select>
                      </td>
                      
                      <td className="font-lexend font-normal py-4 text-[13px] text-[#0A2C25] px-2">
                        <input
                          type="number"
                          step="0.01"
                          value={pieza.ancho}
                          onChange={(e) =>
                            handlePiezaChange(pieza.id, 'ancho', parseFloat(e.target.value) || 0)
                          }
                          className="w-20 px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </td>

                      <td className="font-lexend font-normal py-4 text-[13px] text-[#0A2C25] px-2">
                        <input
                          type="number"
                          step="0.01"
                          value={pieza.largo}
                          onChange={(e) =>
                            handlePiezaChange(pieza.id, 'largo', parseFloat(e.target.value) || 0)
                          }
                          className="w-20 px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </td>

                      <td className="font-lexend font-normal py-4 text-[13px] text-[#0A2C25] px-2">
                        <input
                          type="number"
                          value={pieza.verde}
                          onChange={(e) =>
                            handlePiezaChange(pieza.id, 'verde', parseInt(e.target.value) || 0)
                          }
                          className="w-16 px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </td>

                      <td className="font-lexend font-normal py-4 text-[13px] text-[#0A2C25] px-2">
                        <input
                          type="number"
                          value={pieza.estufa}
                          onChange={(e) =>
                            handlePiezaChange(pieza.id, 'estufa', parseInt(e.target.value) || 0)
                          }
                          className="w-16 px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </td>

                      <td className="font-lexend font-normal py-4 text-[13px] text-[#839590] px-2 text-sm">
                        {pieza.pies_tabla.toFixed(2)}
                      </td>

                      <td className="font-lexend font-normal py-4 text-[13px] text-[#839590] px-2 text-sm">
                        {pieza.volumen_m3.toFixed(4)} m³
                      </td>

                      <td className="py-3 px-2">
                        <button
                          onClick={() => eliminarPieza(pieza.id)}
                          className="text-red-500 hover:text-red-700"
                          disabled={piezas.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={agregarPieza}
              className="flex items-center gap-2 px-6 py-3 bg-[#3786E6] text-white font-lexend rounded-lg hover:bg-[#0956B6] transition-colors font-normal"
            >
              <Plus className="w-5 h-5" />
              Agregar pieza
            </button>
          </div>
        </div>

        {/* 4 Tarjetas Derecha */}
        <div className="space-y-6">
          {/* Card 1 */}
          <div className="bg-white rounded-[15px] p-3 shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-0.5">
              <div className="w-[64px] h-[64px] bg-[#f5f5f5] rounded-2xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-8 h-8 text-[#4b5563]" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="font-lexend font-medium text-[12px] text-[#0A2C25] uppercase tracking-wider mb-1.5">NUEVA ENTRADA</p>
                <p className="font-lexend font-normal text-[25px] leading-none text-[#0A2C25]">
                  {fecha.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}{' '}
                  -{' '}
                  {fecha.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
          {/* Card 2 */}
          <div className="bg-white rounded-[15px] p-3 shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="w-[64px] h-[64px] bg-green-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Cloud className="w-8 h-8 text-[#09934D]" />
              </div>
              <div>
                <p className="font-lexend font-medium text-[12px] text-[#0A2C25] uppercase tracking-wider mb-1.5">VOLUMEN PRODUCIDO</p>
                <p className="font-lexend font-normal text-[25px] leading-none text-[#09934D]">{volumenTotalProduccion.toFixed(2)} m³</p>
              </div>
            </div>
          </div>
          {/* Card 3 */}
          <div className="bg-white rounded-[15px] p-3 shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
            <div className="flex items-center gap-10 mb-0.5">
              <div>
                <p className="font-lexend font-medium text-[12px] text-[#0A2C25] uppercase tracking-wider mb-1.5">PIES TABLA</p>
                <p className="font-lexend font-normal text-[25px] leading-none text-[#0A2C25]">{piesTablaTotal.toFixed(1)}</p>
              </div>
              <div>
                <p className="font-lexend font-medium text-[12px] text-[#0A2C25] uppercase tracking-wider mb-1.5">PIEZAS</p>
                <p className="font-lexend font-normal text-[25px] leading-none text-[#0A2C25]">{String(piezas.length).padStart(3, '0')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}