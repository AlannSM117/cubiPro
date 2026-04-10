'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { ApiClient } from '@/lib/apiClient';
import { ArrowLeft, Plus, Save, Trash2, FileText, Layers } from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type TrozaForm = {
  id: string;
  diametro_1: string;   // string para controlar el valor crudo del input
  diametro_2: string;
  largo: string;
  descuento_porcentaje: string;
};

type TrozaCalc = TrozaForm & {
  volumen_m3: number;
  volumen_total: number;
};

const turnoAserraderoMap: Record<string, number> = {
  Matutino: 1,
  Vespertino: 2,
  Nocturno: 3,
};

const claseTypeMap: Record<string, string> = {
  '1': 'Primario',
  '2': 'Secundario',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseFld(v: string): number {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function calcularVolumen(t: TrozaForm): { volumen_m3: number; volumen_total: number } {
  const d1 = parseFld(t.diametro_1);
  const d2 = parseFld(t.diametro_2);
  const largo = parseFld(t.largo);
  const desc = parseFld(t.descuento_porcentaje);
  const d = (d1 + d2) / 2;
  const vol = 0.7854 * d * d * largo;
  const descAmt = vol * (desc / 100);
  return {
    volumen_m3: vol,
    volumen_total: Math.max(0, vol - descAmt),
  };
}

function emptyTroza(): TrozaForm {
  return {
    id: crypto.randomUUID(),
    diametro_1: '',
    diametro_2: '',
    largo: '',
    descuento_porcentaje: '',
  };
}

// ─── Hook: detectar si ya se ingresaron 2 decimales ──────────────────────────
/**
 * Devuelve true si el valor tiene exactamente 2 dígitos decimales
 * Ej: "0.12" → true | "0.1" → false | "12" → false
 */
function hasTwoDecimals(val: string): boolean {
  const dotIdx = val.indexOf('.');
  if (dotIdx === -1) return false;
  return val.length - dotIdx - 1 === 2;
}

// ─── Componente: TrozaRow ─────────────────────────────────────────────────────
function TrozaRow({
  troza,
  index,
  isLast,
  inputRefs,
  onChangeField,
  onDelete,
  onAddTroza,
  canDelete,
}: {
  troza: TrozaCalc;
  index: number;
  isLast: boolean;
  /** refs[rowIndex][fieldIndex 0-3] */
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[][]>;
  onChangeField: (id: string, field: keyof TrozaForm, value: string) => void;
  onDelete: (id: string) => void;
  onAddTroza: () => string; // returns new row id
  canDelete: boolean;
}) {
  const FIELDS: (keyof TrozaForm)[] = [
    'diametro_1',
    'diametro_2',
    'largo',
    'descuento_porcentaje',
  ];

  function focusNext(rowIdx: number, colIdx: number) {
    const nextCol = colIdx + 1;
    if (nextCol < FIELDS.length) {
      // siguiente campo en la misma fila
      const el = inputRefs.current[rowIdx]?.[nextCol];
      if (el) { el.focus(); el.select(); }
    } else {
      // último campo → siguiente fila o nueva fila
      const nextRow = rowIdx + 1;
      const el = inputRefs.current[nextRow]?.[0];
      if (el) {
        el.focus();
        el.select();
      } else if (isLast) {
        // no hay fila siguiente → agregar nueva y hacer foco en ella
        onAddTroza();
        // el foco lo maneja agregarTroza a través de useEffect en el padre
      }
    }
  }

  const inputCls =
    'w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm font-lexend text-[#0A2C25] ' +
    'focus:outline-none focus:ring-2 focus:ring-[#3786E6] focus:border-transparent ' +
    'placeholder:text-gray-300 transition-shadow';

  return (
    <tr className="border-b border-[#e0e4e3] last:border-0 hover:bg-[#f8fffe] transition-colors group">
      {FIELDS.map((field, colIdx) => (
        <td key={field} className="font-lexend font-normal py-3 text-[12px] text-[#0A2C25] px-2">
          <input
            ref={(el) => {
              if (!inputRefs.current[index]) inputRefs.current[index] = [];
              inputRefs.current[index][colIdx] = el;
            }}
            type="number"
            step="0.01"
            value={troza[field] as string}
            placeholder="0.00"
            className={inputCls}
            onChange={(e) => {
              const val = e.target.value;
              onChangeField(troza.id, field, val);
            }}
            onInput={(e) => {
              const val = (e.target as HTMLInputElement).value;
              // Auto-avance solo para diámetros (colIdx 0 y 1): saltar al escribir 2 decimales
              if ((colIdx === 0 || colIdx === 1) && hasTwoDecimals(val)) {
                focusNext(index, colIdx);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (colIdx === FIELDS.length - 1 && isLast) {
                  // Enter en último campo de última fila → nueva troza
                  onAddTroza();
                } else {
                  focusNext(index, colIdx);
                }
              }
            }}
            onFocus={(e) => e.target.select()}
          />
        </td>
      ))}

      {/* Volumen calculado (solo lectura) */}
      <td className="font-lexend font-normal py-3 text-[13px] text-[#839590] px-2">
        {troza.volumen_m3.toFixed(3)} m³
      </td>
      <td className="font-lexend font-normal py-3 text-[13px] text-[#839590] px-2">
        {troza.volumen_total.toFixed(3)} m³
      </td>

      {/* Eliminar */}
      <td className="py-3 px-2">
        <button
          onClick={() => onDelete(troza.id)}
          disabled={!canDelete}
          tabIndex={-1}
          className="text-red-400 hover:text-red-600 disabled:opacity-20 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function NuevaEntradaPage() {
  const router = useRouter();
  const [fecha, setFecha] = useState(new Date());
  const [turno, setTurno] = useState('Matutino');
  const [origen, setOrigen] = useState('S');
  const [clase, setClase] = useState('1');
  const [trozas, setTrozas] = useState<TrozaForm[]>([emptyTroza()]);
  const [saving, setSaving] = useState(false);

  // refs[fila][columna] para navegación con teclado
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  // ── Calcular volúmenes ──
  const trozasCalc: TrozaCalc[] = trozas.map((t) => ({
    ...t,
    ...calcularVolumen(t),
  }));

  const volumenTotal = trozasCalc.reduce((s, t) => s + t.volumen_total, 0);

  // ── CRUD ──
  const handleChangeField = useCallback(
    (id: string, field: keyof TrozaForm, value: string) => {
      setTrozas((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
    },
    [],
  );

  const agregarTroza = useCallback((): string => {
    const nueva = emptyTroza();
    setTrozas((prev) => [...prev, nueva]);
    // Foco en el primer input de la nueva fila (al siguiente tick)
    setTimeout(() => {
      const newIdx = inputRefs.current.length; // aún no se montó, así que length == prev.length
      // Buscamos el primer input disponible al final
      const rows = inputRefs.current;
      const lastRow = rows[rows.length - 1];
      if (lastRow?.[0]) {
        lastRow[0].focus();
        lastRow[0].select();
      }
    }, 50);
    return nueva.id;
  }, []);

  function eliminarTroza(id: string) {
    if (trozas.length > 1) {
      setTrozas((prev) => prev.filter((t) => t.id !== id));
    }
  }

  async function finalizarEntrada() {
    setSaving(true);
    try {
      const entrada = await ApiClient.createEntradaTroceria({
        fecha: fecha.toISOString(),
        turno,
        origen,
        clase: parseInt(clase, 10),
      });

      for (const t of trozas) {
        await ApiClient.addTroza(entrada.id, {
          diametro1: parseFld(t.diametro_1),
          diametro2: parseFld(t.diametro_2),
          largo: parseFld(t.largo),
          descuento: parseFld(t.descuento_porcentaje),
        });
      }

      await ApiClient.finalizarEntrada(entrada.id);
      router.push('/troceria');
    } catch (e: any) {
      alert('Error en el proceso: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  function descartarEntrada() {
    if (confirm('¿Está seguro de descartar esta entrada?')) {
      router.push('/troceria');
    }
  }

  return (
    <>
      <Header
        title="Entrada de trocería"
        subtitle="Captura de dimensiones, clasificación y cálculo automático de volumen por troza"
      />

      <button
        onClick={() => router.push('/troceria')}
        className="flex items-center gap-2 text-[#839590] hover:text-[#0A2C25] mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-lexend font-normal">Regresar a historial de trocería</span>
      </button>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2">
          {/* ── Datos de entrada ── */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="font-lexend font-medium text-[16px] text-[#0A2C25] mb-6 uppercase tracking-wide">
              DATOS DE ENTRADA
            </h2>
            <div className="grid grid-cols-5 gap-6">
              <div>
                <label className="block font-lexend font-medium text-left text-[14px] text-[#839590] pb-3">
                  Fecha
                </label>
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
                  className="w-full px-4 font-lexend font-normal py-4 text-[13px] text-[#0A2C25] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block font-lexend font-medium text-left text-[14px] text-[#839590] pb-3">
                  Turno
                </label>
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
                <label className="block font-lexend font-medium text-left text-[14px] text-[#839590] pb-3">
                  Origen
                </label>
                <select
                  value={origen}
                  onChange={(e) => setOrigen(e.target.value)}
                  className="w-full px-2 font-lexend font-normal py-4 text-[13px] text-[#0A2C25] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="S">S</option>
                  <option value="M">M</option>
                </select>
              </div>
              <div>
                <label className="block font-lexend font-medium text-left text-[14px] text-[#839590] pb-3">
                  Clase
                </label>
                <select
                  value={clase}
                  onChange={(e) => setClase(e.target.value)}
                  className="w-full px-4 font-lexend font-normal py-4 text-[13px] text-[#0A2C25] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Botones acción ── */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={finalizarEntrada}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-[#08C565] text-white font-lexend rounded-lg hover:bg-[#09934D] transition-colors font-normal disabled:opacity-60"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Guardando…' : 'Finalizar entrada'}
            </button>
            <button
              onClick={descartarEntrada}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white font-lexend rounded-lg hover:bg-red-700 transition-colors font-normal disabled:opacity-60"
            >
              Descartar entrada
            </button>
          </div>

          {/* ── Tabla de trozas ── */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-lexend font-medium text-[16px] text-[#0A2C25] uppercase tracking-wide">
                TROZAS
              </h2>
              <p className="font-lexend text-[11px] text-[#839590]">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono">Enter</kbd>
                {' '}para avanzar &nbsp;·&nbsp;
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono">Enter</kbd>
                {' '}en último campo agrega fila
              </p>
            </div>

            <div className="overflow-x-auto mb-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#c1cac7]">
                    <th className="font-lexend font-medium text-left text-[13px] text-[#839590] pb-3 px-2">
                      D1 (M)
                    </th>
                    <th className="font-lexend font-medium text-left text-[13px] text-[#839590] pb-3 px-2">
                      D2 (M)
                    </th>
                    <th className="font-lexend font-medium text-left text-[13px] text-[#839590] pb-3 px-2">
                      Largo
                    </th>
                    <th className="font-lexend font-medium text-left text-[13px] text-[#839590] pb-3 px-2">
                      Dcto. %
                    </th>
                    <th className="font-lexend font-medium text-left text-[13px] text-[#839590] pb-3 px-2">
                      Vol. m³
                    </th>
                    <th className="font-lexend font-medium text-left text-[13px] text-[#839590] pb-3 px-2">
                      Vol. total
                    </th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {trozasCalc.map((troza, index) => (
                    <TrozaRow
                      key={troza.id}
                      troza={troza}
                      index={index}
                      isLast={index === trozas.length - 1}
                      inputRefs={inputRefs}
                      onChangeField={handleChangeField}
                      onDelete={eliminarTroza}
                      onAddTroza={agregarTroza}
                      canDelete={trozas.length > 1}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={agregarTroza}
              className="flex items-center gap-2 px-6 py-3 bg-[#3786E6] text-white font-lexend rounded-lg hover:bg-[#0956B6] transition-colors font-normal"
            >
              <Plus className="w-5 h-5" />
              Agregar troza
            </button>
          </div>
        </div>

        {/* ── Panel lateral ── */}
        <div className="space-y-6">
          {/* Card 1 */}
          <div className="bg-white rounded-[15px] p-3 shadow-sm border border-gray-100 flex items-center gap- transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-0.5">
              <div className="w-[64px] h-[64px] bg-[#f5f5f5] rounded-2xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-8 h-8 text-[#4b5563]" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="font-lexend font-medium text-[12px] text-[#0A2C25] uppercase tracking-wider mb-1.5">
                  NUEVO LOTE
                </p>
                <p className="font-lexend font-normal text-[25px] leading-none text-[#0A2C25]">
                  {fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}{' '}
                  -{' '}
                  {fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-[15px] p-3 shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
            <div className="flex items-center gap-10 mb-0.5">
              <div>
                <p className="font-lexend font-medium text-[12px] text-[#0A2C25] uppercase tracking-wider mb-1.5">
                  ASERRADERO
                </p>
                <p className="font-lexend font-normal text-[25px] leading-none text-[#0A2C25]">
                  {turnoAserraderoMap[turno]}
                </p>
              </div>
              <div>
                <p className="font-lexend font-medium text-[12px] text-[#0A2C25] uppercase tracking-wider mb-1.5">
                  TIPO
                </p>
                <p className="font-lexend font-normal text-[25px] leading-none text-[#0A2C25]">
                  {claseTypeMap[clase]}
                </p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-[15px] p-3 shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="w-[64px] h-[64px] bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Layers className="w-8 h-8 text-[#3786E6]" />
              </div>
              <div>
                <p className="font-lexend font-medium text-[12px] text-[#0A2C25] uppercase tracking-wider mb-1.5">
                  VOLUMEN FINAL
                </p>
                <p className="font-lexend font-normal text-[25px] leading-none text-[#3786E6]">
                  {volumenTotal.toFixed(2)} m³
                </p>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-[20px] p-3 shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="w-[64px] h-[64px] bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Layers className="w-8 h-8 text-[#C4670B]" />
              </div>
              <div>
                <p className="font-lexend font-medium text-[12px] text-[#0A2C25] uppercase tracking-wider mb-1.5">
                  TROZAS
                </p>
                <p className="font-lexend font-normal text-[25px] leading-none text-[#C4670B]">
                  {trozas.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
