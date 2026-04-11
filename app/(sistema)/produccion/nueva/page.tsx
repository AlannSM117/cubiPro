'use client';

import { useState, useRef, useCallback } from 'react';
import { FileX, Trash2, FileText, Factory, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/apiClient';
import { formatDate, formatTime, parseFraction } from '@/lib/formatters';

// Componentes
import Header from '@/components/layout/Header';
import { StatCard } from '@/components/cards/StatCard';
import { BackButton } from '@/components/buttons/BackButton';
import { AddRowButton } from '@/components/buttons/AddRowButton';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { ActionButtons } from '@/components/buttons/ActionButtons';
import { DatosEntradaForm } from '@/components/forms/DatosEntradaForm';
import { DiscardConfirmModal } from '@/components/modals/DiscardConfirmModal';

// Tipos
type PiezaForm = {
  id: string;
  grueso: string;
  clase: string;
  ancho: string;
  largo: string;
  verde: string;
  estufa: string;
};

type PiezaCalc = PiezaForm & {
  pies_tabla: number;
  volumen_m3: number;
};

// Helpers locales
function calcularPiesTabla(pieza: PiezaForm): number {
  const grueso = parseFraction(pieza.grueso);
  const pzas = (parseInt(pieza.verde || '0') || 0) + (parseInt(pieza.estufa || '0') || 0);
  const ancho = parseFloat(pieza.ancho) || 0;
  const largo = parseFloat(pieza.largo) || 0;
  if (pzas === 0 || grueso === 0 || ancho === 0 || largo === 0) return 0;
  return (pzas * grueso * ancho * largo) / 12;
}

function calcularVolumen(pieza: PiezaForm): number {
  return calcularPiesTabla(pieza) * 0.002359737;
}

function emptyPieza(): PiezaForm {
  return {
    id: crypto.randomUUID(),
    grueso: '', clase: '2', ancho: '', largo: '',
    verde: '', estufa: '',
  };
}

// PiezaRow
function PiezaRow({
  pieza, index, isLast, inputRefs, onChangeField, onDelete, onAddPieza, canDelete,
}: {
  pieza: PiezaCalc;
  index: number;
  isLast: boolean;
  inputRefs: React.RefObject<(HTMLInputElement | HTMLSelectElement | null)[][]>;
  onChangeField: (id: string, field: keyof PiezaForm, value: string) => void;
  onDelete: (id: string) => void;
  onAddPieza: () => string;
  canDelete: boolean;
}) {
  const FIELDS: (keyof PiezaForm)[] = ['grueso', 'clase', 'ancho', 'largo', 'verde', 'estufa'];

  function focusNext(rowIdx: number, colIdx: number) {
    const nextCol = colIdx + 1;
    if (nextCol < FIELDS.length) {
      const el = inputRefs.current[rowIdx]?.[nextCol];
      if (el) { el.focus(); if (el instanceof HTMLInputElement) el.select(); }
    } else {
      const el = inputRefs.current[rowIdx + 1]?.[0];
      if (el) { el.focus(); if (el instanceof HTMLInputElement) el.select(); }
      else if (isLast) onAddPieza();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent, colIdx: number) {
    if (e.key === 'Enter') {
      e.preventDefault();
      colIdx === FIELDS.length - 1 && isLast ? onAddPieza() : focusNext(index, colIdx);
    }
  }

  function handleDecimalInput(e: React.ChangeEvent<HTMLInputElement>, colIdx: number) {
    const val = e.target.value;
    onChangeField(pieza.id, FIELDS[colIdx], val);
    if (val.match(/\.\d/)) requestAnimationFrame(() => focusNext(index, colIdx));
  }

  const inputCls =
    'w-[85px] sm:w-20 px-2 sm:px-3 py-2 border border-gray-200 rounded-lg text-sm font-lexend text-[#0A2C25] ' +
    'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ' +
    'placeholder:text-gray-300 transition-shadow';

  return (
    <tr className="border-b border-[#e0e4e3] last:border-0 hover:bg-gray-400/10 transition-colors group">
      <td className="py-3 px-1 sm:px-2">
        <input
          ref={(el) => { if (!inputRefs.current[index]) inputRefs.current[index] = []; inputRefs.current[index][0] = el; }}
          type="text" value={pieza.grueso} placeholder="1 1/2" className={inputCls}
          onChange={(e) => onChangeField(pieza.id, 'grueso', e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, 0)} onFocus={(e) => e.target.select()}
        />
      </td>
      <td className="py-3 px-1 sm:px-2">
        <select
          ref={(el) => { if (!inputRefs.current[index]) inputRefs.current[index] = []; inputRefs.current[index][1] = el; }}
          value={pieza.clase} className={inputCls}
          onChange={(e) => onChangeField(pieza.id, 'clase', e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, 1)}
        >
          {['2','3','4','5'].map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </td>
      <td className="py-3 px-1 sm:px-2">
        <input
          ref={(el) => { if (!inputRefs.current[index]) inputRefs.current[index] = []; inputRefs.current[index][2] = el; }}
          type="number" step="0.01" value={pieza.ancho} placeholder="0.00" className={inputCls}
          onChange={(e) => handleDecimalInput(e, 2)}
          onKeyDown={(e) => handleKeyDown(e, 2)} onFocus={(e) => e.target.select()}
        />
      </td>
      <td className="py-3 px-1 sm:px-2">
        <input
          ref={(el) => { if (!inputRefs.current[index]) inputRefs.current[index] = []; inputRefs.current[index][3] = el; }}
          type="number" step="0.01" value={pieza.largo} placeholder="0.00" className={inputCls}
          onChange={(e) => handleDecimalInput(e, 3)}
          onKeyDown={(e) => handleKeyDown(e, 3)} onFocus={(e) => e.target.select()}
        />
      </td>
      <td className="py-3 px-1 sm:px-2">
        <input
          ref={(el) => { if (!inputRefs.current[index]) inputRefs.current[index] = []; inputRefs.current[index][4] = el; }}
          type="number" value={pieza.verde} placeholder="0" className={inputCls}
          onChange={(e) => onChangeField(pieza.id, 'verde', e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, 4)} onFocus={(e) => e.target.select()}
        />
      </td>
      <td className="py-3 px-1 sm:px-2">
        <input
          ref={(el) => { if (!inputRefs.current[index]) inputRefs.current[index] = []; inputRefs.current[index][5] = el; }}
          type="number" value={pieza.estufa} placeholder="0" className={inputCls}
          onChange={(e) => onChangeField(pieza.id, 'estufa', e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, 5)} onFocus={(e) => e.target.select()}
        />
      </td>
      <td className="font-lexend font-normal py-3 text-[13px] text-[#839590] px-2 min-w-[70px]">
        {pieza.pies_tabla.toFixed(2)}
      </td>
      <td className="font-lexend font-normal py-3 text-[13px] text-[#839590] px-2 min-w-[80px]">
        {pieza.volumen_m3.toFixed(3)} m³
      </td>
      <td className="py-3 px-2">
        <button
          onClick={() => onDelete(pieza.id)}
          disabled={!canDelete}
          tabIndex={-1}
          className="w-7 h-7 rounded-md bg-red-50 hover:bg-red-100 flex items-center justify-center"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-500" />
        </button>
      </td>
    </tr>
  );
}

// Página principal
export default function NuevaProduccionPage() {
  const router = useRouter();
  const [fecha,  setFecha]  = useState(new Date());
  const [turno,  setTurno]  = useState('Matutino');
  const [piezas, setPiezas] = useState<PiezaForm[]>([emptyPieza()]);
  const [saving, setSaving] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | HTMLSelectElement | null)[][]>([]);

  // 1. Estado para el Modal Dinámico
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
    icon?: React.ReactNode;
    iconBgColor?: string;
    confirmBtnColor?: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmLabel: '',
    onConfirm: () => {},
  });

  // 2. Función para el botón de DESCARTAR (Basurero Rojo)
  function handleDiscard() {
    setModalConfig({
      isOpen: true,
      title: "¿Descartar producción?",
      description: "Se perderán todos los datos capturados de las piezas. Esta acción no se puede deshacer.",
      confirmLabel: "Sí, descartar",
      onConfirm: () => router.push('/produccion'),
      icon: <FileX className="w-8 h-8 text-red-500" />,
      iconBgColor: "bg-red-50",
      confirmBtnColor: "bg-red-500 hover:bg-red-600 shadow-red-200"
    });
  }

  // 3. Función para el botón de REGRESAR (Alerta Ámbar)
  function handleBack(e: React.MouseEvent) {
    e.preventDefault();
    setModalConfig({
      isOpen: true,
      title: "¿Salir sin guardar?",
      description: "Tienes cambios pendientes en la tabla de producción. Si regresas ahora, perderás el progreso.",
      confirmLabel: "Sí, salir",
      onConfirm: () => router.push('/produccion'),
      icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
      iconBgColor: "bg-amber-50",
      confirmBtnColor: "bg-amber-500 hover:bg-amber-600 shadow-amber-200"
    });
  }

  const piezasCalc: PiezaCalc[] = piezas.map((p) => ({
    ...p,
    pies_tabla: calcularPiesTabla(p),
    volumen_m3: calcularVolumen(p),
  }));

  const handleChangeField = useCallback((id: string, field: keyof PiezaForm, value: string) => {
    setPiezas((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }, []);

  const agregarPieza = useCallback((): string => {
    const nueva = emptyPieza();
    setPiezas((prev) => [...prev, nueva]);
    setTimeout(() => {
      const rows = inputRefs.current;
      const lastRow = rows[rows.length - 1];
      if (lastRow?.[0]) { lastRow[0].focus(); if(lastRow[0] instanceof HTMLInputElement) lastRow[0].select(); }
    }, 50);
    return nueva.id;
  }, []);

  function eliminarPieza(id: string) {
    if (piezas.length > 1) setPiezas((prev) => prev.filter((p) => p.id !== id));
  }

  async function finalizarEntrada() {
    setSaving(true);
    try {
      const entrada = await ApiClient.createEntradaProduccion({ fecha: fecha.toISOString(), turno });
      for (const p of piezas) {
        await ApiClient.addPieza(entrada.id, {
          grueso: parseFraction(p.grueso),
          clase:  parseInt(p.clase, 10),
          ancho:  parseFloat(p.ancho) || 0,
          largo:  parseFloat(p.largo) || 0,
          verde:  parseInt(p.verde  || '0', 10) || 0,
          estufa: parseInt(p.estufa || '0', 10) || 0,
        });
      }
      await ApiClient.finalizarEntradaProduccion(entrada.id);
      router.push('/produccion');
    } catch (e: any) {
      alert('Error en el proceso: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  const volumenTotal  = piezasCalc.reduce((s, p) => s + p.volumen_m3,  0);
  const piesTablaTotal = piezasCalc.reduce((s, p) => s + p.pies_tabla, 0);

  return (
    <>
      <Header
        title="Entrada de madera en tabla"
        subtitle="Captura de dimensiones, clasificación y cálculo automático de volumen"
      />

      <div onClick={handleBack} className="inline-block cursor-pointer">
        <BackButton href="#" label="Regresar al historial de madera en tabla" />
      </div>

      <SidebarLayout
        main={
          <>
            <DatosEntradaForm fecha={fecha} turno={turno} onFechaChange={setFecha} onTurnoChange={setTurno} />

            <ActionButtons onFinalize={finalizarEntrada} onDiscard={handleDiscard} saving={saving} />

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                <h2 className="font-lexend font-medium text-[16px] text-[#0A2C25] uppercase tracking-wide">
                  Piezas
                </h2>
                <p className="font-lexend text-normal text-[11px] sm:text-[12px] text-[#839590]">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[12px] font-mono">Enter</kbd>
                  {' '}para avanzar &nbsp;·&nbsp;
                  <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[12px] font-mono">Enter</kbd>
                  {' '}en último campo agrega fila
                </p>
              </div>

              <div className="overflow-x-auto mb-4 pb-2">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[#c1cac7]">
                      {['Grueso','Clase','Ancho','Largo','Verde','Estufa','Pies Tabla','Volumen m³',''].map((h) => (
                        <th key={h} className="font-lexend font-medium text-left text-[12px] sm:text-[13px] text-[#839590] pb-3 px-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {piezasCalc.map((pieza, index) => (
                      <PiezaRow
                        key={pieza.id} pieza={pieza} index={index} isLast={index === piezas.length - 1}
                        inputRefs={inputRefs} onChangeField={handleChangeField} onDelete={eliminarPieza}
                        onAddPieza={agregarPieza} canDelete={piezas.length > 1}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              <AddRowButton label="Agregar pieza" onClick={agregarPieza}/>
            </div>
          </>
        }
        sidebar={
          <div className="space-y-4">
            <StatCard label="Nueva entrada" value={`${formatDate(fecha.toISOString())} - ${formatTime(fecha.toISOString())}`} icon={FileText} variant="gray" valueClassName="text-[13px] sm:text-[14px] font-medium" />
            <StatCard label="Volumen producido" value={volumenTotal.toFixed(2)} icon={Factory} variant="green" suffix="m³" />
            <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-10 transition-all hover:shadow-md">
              <div>
                <p className="font-lexend font-medium text-[11px] sm:text-[12px] text-[#0A2C25] uppercase tracking-wider mb-1.5">Pies tabla</p>
                <p className="font-lexend font-normal text-[22px] sm:text-[25px] leading-none text-[#0A2C25]">{piesTablaTotal.toFixed(1)}</p>
              </div>
              <div>
                <p className="font-lexend font-medium text-[11px] sm:text-[12px] text-[#0A2C25] uppercase tracking-wider mb-1.5">Piezas</p>
                <p className="font-lexend font-normal text-[22px] sm:text-[25px] leading-none text-[#0A2C25]">{String(piezas.length).padStart(3, '0')}</p>
              </div>
            </div>
          </div>
        }
      />

      <DiscardConfirmModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        description={modalConfig.description}
        confirmLabel={modalConfig.confirmLabel}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        icon={modalConfig.icon}
        iconBgColor={modalConfig.iconBgColor}
        confirmBtnColor={modalConfig.confirmBtnColor}
      />
    </>
  );
}