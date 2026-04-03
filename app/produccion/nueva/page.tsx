'use client';



import { useState } from 'react';

import { useRouter } from 'next/navigation';

import Header from '@/components/Header';

import { db } from '@/lib/localDb';

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
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 16));
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
    const volumenTotal = piezas.reduce((sum, p) => sum + p.volumen_m3, 0);
    const piesTablaTotal = piezas.reduce((sum, p) => sum + p.pies_tabla, 0);
    const piezasTotalesUnidades = piezas.reduce((sum, p) => sum + p.verde + p.estufa, 0);
    const aserradero = turnoAserraderoMap[turno];
    const folio = `${new Date(fecha).toLocaleDateString('es-ES').replace(/\//g, '/')}-${new Date(fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;

    // OMITIMOS LLAMADA A BD PORQUE TODAVIA ESTA CON DB.FROM AQUI (SEGUN ARCHIVO), LUEGO LO PUEDO ADAPTAR AL APICLIENT SI EL USUARIO QUIERE
    const { data: entrada, error: entradaError } = await db
      .from('entradas_produccion')
      .insert({
        folio,
        fecha: new Date(fecha).toISOString(),
        turno,
        aserradero,
        volumen_producido: volumenTotal,
        total_piezas: piezasTotalesUnidades,
        pies_tabla: piesTablaTotal,
      })
      .select()
      .single();

    if (entradaError || !entrada) {
      alert('Error al crear la entrada');
      return;
    }

    const piezasData = piezas.map((p) => ({
      entrada_id: entrada.id,
      grueso: parseFraction(p.grueso),
      clase: p.clase,
      ancho: p.ancho,
      largo: p.largo,
      verde: p.verde,
      estufa: p.estufa,
      pies_tabla: p.pies_tabla,
      volumen_m3: p.volumen_m3,
    }));

    const { error: piezasError } = await db.from('piezas_produccion').insert(piezasData);

    if (piezasError) {
      alert('Error al guardar las piezas');
      return;
    }

    router.push('/produccion');
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
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Regresar a historial de madera en tabla</span>
      </button>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">DATOS DE ENTRADA</h2>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                <input
                  type="datetime-local"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Turno</label>
                <select
                  value={turno}
                  onChange={(e) => setTurno(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Matutino">Matutino</option>
                  <option value="Vespertino">Vespertino</option>
                  <option value="Nocturno">Nocturno</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aserradero</label>
                <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                  <span className="text-sm font-medium text-gray-900">{turnoAserraderoMap[turno]}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={finalizarEntrada}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              <Save className="w-5 h-5" />
              Finalizar entrada
            </button>
            <button
              onClick={descartarEntrada}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Descartar entrada
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">PIEZAS</h2>
            <div className="overflow-x-auto mb-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase pb-3 px-2">
                      Grueso
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase pb-3 px-2">
                      Clase
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase pb-3 px-2">
                      Ancho
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase pb-3 px-2">
                      Largo
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase pb-3 px-2">
                      Verde
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase pb-3 px-2">
                      Estufa
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase pb-3 px-2">
                      Pies Tabla
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase pb-3 px-2">
                      Volumen m³
                    </th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {piezas.map((pieza) => (
                    <tr key={pieza.id} className="border-b border-gray-100">
                      <td className="py-3 px-2">

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

                      <td className="py-3 px-2">

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

                      <td className="py-3 px-2">

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

                      <td className="py-3 px-2">

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

                      <td className="py-3 px-2">

                        <input

                          type="number"

                          value={pieza.verde}

                          onChange={(e) =>

                            handlePiezaChange(pieza.id, 'verde', parseInt(e.target.value) || 0)

                          }

                          className="w-16 px-3 py-2 border border-gray-300 rounded text-sm"

                        />

                      </td>

                      <td className="py-3 px-2">

                        <input

                          type="number"

                          value={pieza.estufa}

                          onChange={(e) =>

                            handlePiezaChange(pieza.id, 'estufa', parseInt(e.target.value) || 0)

                          }

                          className="w-16 px-3 py-2 border border-gray-300 rounded text-sm"

                        />

                      </td>

                      <td className="py-3 px-2 text-sm text-gray-600">

                        {pieza.pies_tabla.toFixed(2)}

                      </td>

                      <td className="py-3 px-2 text-sm text-gray-900 font-medium">

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

              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"

            >

              <Plus className="w-5 h-5" />

              Agregar pieza

            </button>

          </div>

        </div>



        <div className="space-y-6">

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">

            <div className="flex items-center gap-3 mb-4">

              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">

                <FileText className="w-5 h-5 text-gray-600" />

              </div>

              <div>

                <p className="text-xs font-semibold text-gray-600 uppercase">NUEVA ENTRADA</p>

                <p className="text-lg font-bold text-gray-900">

                  {new Date(fecha).toLocaleDateString('es-ES', {

                    day: '2-digit',

                    month: '2-digit',

                    year: 'numeric',

                  })}{' '}

                  -{' '}

                  {new Date(fecha).toLocaleTimeString('es-ES', {

                    hour: '2-digit',

                    minute: '2-digit',

                  })}

                </p>

              </div>

            </div>

          </div>



          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">

            <div className="flex items-start gap-4">

              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">

                <Cloud className="w-6 h-6 text-green-600" />

              </div>

              <div>

                <p className="text-xs font-semibold text-gray-600 uppercase mb-1">VOLUMEN PRODUCIDO</p>

                <p className="text-2xl font-bold text-green-600">{volumenTotalProduccion.toFixed(2)} m³</p>

              </div>

            </div>

          </div>



          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">

            <div className="space-y-4">

              <div>

                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">PIES TABLA</p>

                <p className="text-2xl font-bold text-gray-900">{piesTablaTotal.toFixed(1)}</p>

              </div>

              <div>

                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">PIEZAS</p>

                <p className="text-2xl font-bold text-gray-900">{String(piezas.length).padStart(3, '0')}</p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </>

  );

}