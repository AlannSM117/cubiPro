'use client';

import { TURNO_ASERRADERO } from '@/lib/formatters';

interface DatosEntradaFormProps {
  fecha: Date;
  turno: string;
  onFechaChange: (date: Date) => void;
  onTurnoChange: (turno: string) => void;
  /** Solo trocería usa origen */
  origen?: string;
  onOrigenChange?: (origen: string) => void;
  /** Solo trocería usa clase */
  clase?: string;
  onClaseChange?: (clase: string) => void;
}

const inputCls =
  'w-full px-2 font-lexend font-normal py-4 text-[13px] text-[#0A2C25] ' +
  'border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
;

const labelCls = 'block font-lexend font-medium text-left text-[14px] text-[#839590] pb-3';

export function DatosEntradaForm({
  fecha,
  turno,
  onFechaChange,
  onTurnoChange,
  origen,
  onOrigenChange,
  clase,
  onClaseChange,
}: DatosEntradaFormProps) {
  // Convierte Date "YYYY-MM-DD" para el input type="date"
  const fechaValue = [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, '0'),
    String(fecha.getDate()).padStart(2, '0'),
  ].join('-');

  function handleFechaChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.value) return;
    const [year, month, day] = e.target.value.split('-');
    const next = new Date(fecha);
    next.setFullYear(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    onFechaChange(next);
  }

  // Producción no tiene origen/clase, así que las columnas cambian
  const isTroceria = origen !== undefined;
  const gridCols = isTroceria ? 'grid-cols-4' : 'grid-cols-3';

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h2 className="font-lexend font-medium text-[16px] text-[#0A2C25] mb-6 uppercase tracking-wide">
        Datos de entrada
      </h2>

      <div className={`grid ${gridCols} gap-6`}>
        {/* Fecha */}
        <div>
          <label className={labelCls}>Fecha</label>
          <input
            type="date"
            value={fechaValue}
            onChange={handleFechaChange}
            className={inputCls}/>
        </div>

        {/* Turno */}
        <div>
          <label className={labelCls}>Turno</label>
          <select
            value={turno}
            onChange={(e) => onTurnoChange(e.target.value)}
            className={inputCls}>
            <option value="Matutino">Matutino</option>
            <option value="Vespertino">Vespertino</option>
            <option value="Nocturno">Nocturno</option>
          </select>
        </div>

        {/* Aserradero (solo lectura, derivado del turno) */}
        {!isTroceria && (
          <div>
            <label className={labelCls}>Aserradero</label>
            <div className="w-full px-2 font-lexend py-3 text-[#0A2C25] border border-gray-300 rounded-lg">
              <span className="font-lexend font-medium text-[13px] text-[#839590]">
                {TURNO_ASERRADERO[turno]}
              </span>
            </div>
          </div>
        )}

        {/* Origen Solo trocería */}
        {isTroceria && onOrigenChange && (
          <div>
            <label className={labelCls}>Origen</label>
            <select
              value={origen}
              onChange={(e) => onOrigenChange(e.target.value)}
              className={inputCls}>
              <option value="S">S</option>
              <option value="M">M</option>
            </select>
          </div>
        )}

        {/* Clase Solo trocería */}
        {isTroceria && onClaseChange && (
          <div>
            <label className={labelCls}>Clase</label>
            <select
              value={clase}
              onChange={(e) => onClaseChange(e.target.value)}
              className={inputCls}>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}