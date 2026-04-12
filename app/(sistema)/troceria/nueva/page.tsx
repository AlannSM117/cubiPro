'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/apiClient';
import { AlertTriangle, FileX, Trash2, FileText, Layers } from 'lucide-react';
import { formatDate, formatTime, TURNO_ASERRADERO, CLASE_LABEL } from '@/lib/formatters';

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
type TrozaForm = {
  id: string;
  diametro_1: string;
  diametro_2: string;
  largo: string;
  descuento_porcentaje: string;
};

type TrozaCalc = TrozaForm & {
  volumen_m3: number;
  volumen_total: number;
};

// Helpers locales
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
  return {
    volumen_m3: vol,
    volumen_total: Math.max(0, vol - vol * (desc / 100)),
  };
}

function emptyTroza(): TrozaForm {
  return {
    id: crypto.randomUUID(),
    diametro_1: '', diametro_2: '', largo: '', descuento_porcentaje: '',
  };
}

function hasTwoDecimals(val: string): boolean {
  const dotIdx = val.indexOf('.');
  if (dotIdx === -1) return false;
  return val.length - dotIdx - 1 === 2;
}

// TrozaRow
function TrozaRow({
  troza, index, isLast, inputRefs, onChangeField, onDelete, onAddTroza, canDelete,
}: {
      troza: TrozaCalc;
      index: number;
      isLast: boolean;
      inputRefs: React.RefObject<(HTMLInputElement | null)[][]>;
      onChangeField: (id: string, field: keyof TrozaForm, value: string) => void;
      onDelete: (id: string) => void;
      onAddTroza: () => string;
      canDelete: boolean;
    }
  ) 
{
  const FIELDS: (keyof TrozaForm)[] = ['diametro_1', 'diametro_2', 'largo', 'descuento_porcentaje'];

  function focusNext(rowIdx: number, colIdx: number) {
    const nextCol = colIdx + 1;
    if (nextCol < FIELDS.length) {
      const el = inputRefs.current[rowIdx]?.[nextCol];
      if (el) { el.focus(); el.select(); }
    } else {
      const el = inputRefs.current[rowIdx + 1]?.[0];
      if (el) { el.focus(); el.select(); }
      else if (isLast) onAddTroza();
    }
  }

  const inputCls =
    'w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm font-lexend text-[#0A2C25] ' +
    'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent' +
    'placeholder:text-gray-300 transition-shadow'
  ;

  return (
    <tr className="border-b border-[#e0e4e3] last:border-0 hover:bg-gray-400/10 transition-colors group">
      {FIELDS.map((field, colIdx) => (
            <td key={field} className="font-lexend font-normal py-3 text-[12px] text-[#0A2C25] px-2">
              <input
                id={`troza-${troza.id}-${field}`}
                name={`troza-${field}`}
                ref={(el) => {
                    if (!inputRefs.current[index]) inputRefs.current[index] = [];
                    inputRefs.current[index][colIdx] = el;
                  }
                }
                type="number"
                step="0.01"
                value={troza[field] as string}
                placeholder="0.00"
                className={inputCls}
                onChange={(e) => onChangeField(troza.id, field, e.target.value)}
                onInput={(e) => {
                    const val = (e.target as HTMLInputElement).value;
                    if ((colIdx === 0 || colIdx === 1) && hasTwoDecimals(val)) focusNext(index, colIdx);
                  }
                }
                onKeyDown={(e) => {
                    if (e.key !== 'Enter') return;
                    e.preventDefault();
                    colIdx === FIELDS.length - 1 && isLast ? onAddTroza() : focusNext(index, colIdx);
                  }
                }
                onFocus={(e) => e.target.select()}
              />
            </td>
          )
        )
      }
      <td className="font-lexend font-normal py-3 text-[13px] text-[#839590] px-2">
        {troza.volumen_m3.toFixed(3)} m³
      </td>
      <td className="font-lexend font-normal py-3 text-[13px] text-[#839590] px-2">
        {troza.volumen_total.toFixed(3)} m³
      </td>
      <td className="py-3 px-2">
        <button
          onClick={() => onDelete(troza.id)}
          disabled={!canDelete}
          tabIndex={-1}
          className="text-red-400 hover:text-red-600 disabled:opacity-20 transition-colors sm:opacity-0 group-hover:opacity-100">
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}

// Página principal
export default function NuevaEntradaPage() {
  const router = useRouter();
  const [fecha, setFecha] = useState(new Date());
  const [turno, setTurno] = useState('Matutino');
  const [origen, setOrigen] = useState('S');
  const [clase, setClase] = useState('1');
  const [trozas, setTrozas] = useState<TrozaForm[]>([emptyTroza()]);
  const [saving, setSaving] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  const trozasCalc: TrozaCalc[] = trozas.map((t) => ({ ...t, ...calcularVolumen(t) }));
  const volumenTotal = trozasCalc.reduce((s, t) => s + t.volumen_total, 0);

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
      onConfirm: () => router.push('/troceria'),
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
      onConfirm: () => router.push('/troceria'),
      icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
      iconBgColor: "bg-amber-50",
      confirmBtnColor: "bg-amber-500 hover:bg-amber-600 shadow-amber-200"
    });
  }
  
  const handleChangeField = useCallback(
    (id: string, field: keyof TrozaForm, value: string) =>
      setTrozas((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))),
    [],
  );

  const agregarTroza = useCallback((): string => {
      const nueva = emptyTroza();
      setTrozas((prev) => [...prev, nueva]);
      setTimeout(() => {
        const rows = inputRefs.current;
        const lastRow = rows[rows.length - 1];
        if (lastRow?.[0]) { lastRow[0].focus(); lastRow[0].select(); }
      }, 50);
      return nueva.id;
    }, []
  );

  function eliminarTroza(id: string) {
    if (trozas.length > 1) setTrozas((prev) => prev.filter((t) => t.id !== id));
  }

  async function finalizarEntrada() {
    setSaving(true);
    try {
      const entrada = await ApiClient.createEntradaTroceria({
          fecha: fecha.toISOString(), turno, origen, clase: parseInt(clase, 10),
        }
      );
      for (const t of trozas) {
        await ApiClient.addTroza(entrada.id, {
            diametro1: parseFld(t.diametro_1), diametro2: parseFld(t.diametro_2),
            largo: parseFld(t.largo), descuento: parseFld(t.descuento_porcentaje),
          }
        );
      }
      await ApiClient.finalizarEntrada(entrada.id);
      router.push('/troceria');
    } catch (e: any) {
      alert('Error en el proceso: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Header
        title="Entrada de trocería"
        subtitle="Captura de dimensiones, clasificación y cálculo automático de volumen por troza"
      />

      {/* BackButton */}
      <div onClick={handleBack} className="inline-block cursor-pointer">
        <BackButton href="#" label="Regresar al historial de trocería" />
      </div>

      {/* SidebarLayout */}
      <SidebarLayout
        main={
          <>
            {/* DatosEntradaForm */}
            <DatosEntradaForm
              fecha={fecha}
              turno={turno}
              onFechaChange={setFecha}
              onTurnoChange={setTurno}
              origen={origen}
              onOrigenChange={setOrigen}
              clase={clase}
              onClaseChange={setClase}
            />

            {/* ActionButtons */}
            <ActionButtons
              onFinalize={finalizarEntrada}
              onDiscard={handleDiscard}
              saving={saving}
            />

            {/* Tabla de trozas */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-lexend font-medium text-[16px] text-[#0A2C25] uppercase tracking-wide">
                  Trozas
                </h2>
                <p className="font-lexend text-normal text-[12px] text-[#839590]">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[12px] font-mono">Enter</kbd>
                  {' '}para avanzar &nbsp;·&nbsp;
                  <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[12px] font-mono">Enter</kbd>
                  {' '}en último campo agrega fila
                </p>
              </div>

              <div className="overflow-x-auto mb-4">
                <table className="w-full ">
                  <thead>
                    <tr className="border-b border-[#c1cac7]">
                      {['D1 (M)', 'D2 (M)', 'Largo', 'Dcto. %', 'Vol. m³', 'Vol. total', ''].map((h) => (
                        <th key={h} className="font-lexend font-medium text-left text-[13px] text-[#839590] pb-3 px-2 " >{h}</th>
                      ))}
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
                        )
                      )
                    }
                  </tbody>
                </table>
              </div>
              <AddRowButton label="Agregar troza" onClick={agregarTroza} />
            </div>
          </>
        }
        sidebar={
          <>
            {/* Card 1 Nuevo lote */}
            <StatCard
              label="Nuevo lote"
              value={`${formatDate(fecha.toISOString())} - ${formatTime(fecha.toISOString())}`}
              icon={FileText}
              variant="gray"
              valueClassName="text-[20px] font-medium"
            />

            {/* Card 2 Aserradero + Tipo: dos valores, HTML manual */}
            <div className="bg-white rounded-[20px] p-3 shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
              <div className="flex items-center gap-10">
                <div>
                  <p className="font-lexend font-medium text-[12px] text-[#0A2C25] uppercase tracking-wider mb-1.5">Aserradero</p>
                  <p className="font-lexend font-normal text-center text-[20px] leading-none text-[#0A2C25]">{TURNO_ASERRADERO[turno]}</p>
                </div>
                <div>
                  <p className="font-lexend font-medium text-[12px] text-[#0A2C25] uppercase tracking-wider mb-1.5">Tipo</p>
                  <p className="font-lexend font-normal text-[20px] leading-none text-[#0A2C25]">{CLASE_LABEL[clase]}</p>
                </div>
              </div>
            </div>

            {/* Card 3 Volumen final */}
            <StatCard
              label="Volumen final"
              value={volumenTotal.toFixed(2)}
              icon={Layers}
              variant="blue"
              suffix="m³"
            />

            {/* Card 4 Trozas */}
            <StatCard
              label="Trozas"
              value={trozas.length}
              icon={Layers}
              variant="orange"
            />
          </>
        }
      />
      {/* Modal de Confirmación para Descartar */}
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