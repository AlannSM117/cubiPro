'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/apiClient';
import { formatDate, formatTime, parseFraction } from '@/lib/formatters';
import {
  FileText, Cuboid, ExternalLink, Layers,
  Pencil, Trash2, Check, Ban, AlertTriangle, Package,
  Boxes,
} from 'lucide-react';

// Componentes
import Header from '@/components/layout/Header';
import { StatCard } from '@/components/cards/StatCard';
import { ModalHeader }from '@/components/modals/ModalHeader';
import { CloseButton } from '@/components/buttons/CloseButton';
import { AddRowButton } from '@/components/buttons/AddRowButton';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { NewEntryButton } from '@/components/buttons/NewEntryButton';
import { ViewDetailButton } from '@/components/buttons/ViewDetailButton';

// Tipos
interface EntradaProduccion {
  id: number;
  fecha: string;
  turno: string;
  aserradero: string;
  volumenTotal: number;
  totalPiezas: number;
}

interface PiezaEditForm {
  grueso: string; clase: string; ancho: string;
  largo: string;  verde: string; estufa: string;
}

const EMPTY_PIEZA_FORM: PiezaEditForm = {
  grueso: '', clase: '2', ancho: '', largo: '', verde: '', estufa: '',
};

// EditPiezaRow
function EditPiezaRow({ pieza, index, entradaId, onSaved, onCancel }: {
  pieza: any; index: number; entradaId: string;
  onSaved: (updated: any) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState<PiezaEditForm>({
      grueso: String(pieza.grueso ?? ''),
      clase: String(pieza.clase ?? '2'),
      ancho: String(pieza.ancho ?? ''),
      largo: String(pieza.largo ?? ''),
      verde: String(pieza.verde ?? ''),
      estufa: String(pieza.estufa ?? ''),
    }
  );

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const input =
    'w-full border border-gray-200 rounded-md px-2 py-1 font-lexend text-[12px] ' +
    'text-[#0A2C25] focus:outline-none focus:ring-1 focus:ring-[#3786E6]'
  ;

  async function handleSave() {
    setSaving(true); setErr(null);
    try {
      const updated = await ApiClient.updatePieza(entradaId, pieza.id, {
        grueso: parseFraction(form.grueso),
        clase: parseInt(form.clase, 10),
        ancho: parseFloat(form.ancho),
        largo: parseFloat(form.largo),
        verde: parseInt(form.verde, 10),
        estufa: parseInt(form.estufa, 10),
      });
      onSaved(updated);
    } catch (e: any) {
      setErr(e?.message ?? 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <tr className="border-b border-[#e0e4e3] last:border-0 hover:bg-gray-400/10 transition-colors">
        <td className="font-lexend font-normal py-3 text-[12px] text-[#0A2C25] px-2">{index + 1}</td>
        <td className="py-2 pr-2">
          <input
            id={`edit-pieza-${pieza.id}-grueso`}
            name="edit-pieza-grueso"
            className={input} value={form.grueso} placeholder="Ej. 1 1/2"
            onChange={(e) => setForm({ ...form, grueso: e.target.value })} />
        </td>
        <td className="py-2 pr-2">
          <select
            id={`edit-pieza-${pieza.id}-clase`}
            name="edit-pieza-clase"
            aria-label="Clase de pieza"
            className={input} value={form.clase}
            onChange={(e) => setForm({ ...form, clase: e.target.value })}>
            {['2','3','4','5'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </td>
        {(['ancho','largo'] as const).map((field) => (
              <td key={field} className="py-2 pr-2">
                <input className={input} type="number" step="0.01" value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
              </td>
            )
          )
        }
        {(['verde','estufa'] as const).map((field) => (
              <td key={field} className="py-2 pr-2">
                <input
                  id={`edit-pieza-${pieza.id}-${field}`}
                  name={`edit-pieza-${field}`}
                  className={input} type="number" step="1" value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
              </td>
            )
          )
        }
        <td className="py-2 text-right font-lexend text-[12px] text-[#839590]">—</td>
        <td className="py-2 text-right font-lexend text-[12px] text-[#839590]">—</td>
        <td className="py-2 pl-2">
          <div className="flex items-center gap-1 justify-end">
            <button onClick={handleSave} disabled={saving}
              className="w-7 h-7 rounded-md bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center disabled:opacity-50">
              <Check className="w-3.5 h-3.5 text-white" />
            </button>
            <button onClick={onCancel}
              className="w-7 h-7 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
              <Ban className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>
        </td>
      </tr>
      {err && (
          <tr>
            <td colSpan={10} className="pb-2 px-2">
              <p className="font-lexend text-[11px] text-red-500 bg-red-50 rounded-md px-2 py-1">{err}</p>
            </td>
          </tr>
        )
      }
    </>
  );
}

// DeletePiezaRow
function DeletePiezaRow({ pieza, index, entradaId, onDeleted, onCancel }: {
  pieza: any; index: number; entradaId: string;
  onDeleted: (id: string) => void; onCancel: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true); setErr(null);
    try {
      await ApiClient.deletePieza(entradaId, pieza.id);
      onDeleted(pieza.id);
    } catch (e: any) {
      setErr(e?.message ?? 'Error al eliminar');
      setDeleting(false);
    }
  }

  return (
    <>
      <tr className="border-b border-red-100 bg-red-50">
        <td colSpan={9} className="py-3 px-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="font-lexend text-[12px] text-red-700">
              ¿Eliminar pieza #{index + 1}? Esta acción no se puede deshacer.
            </span>
          </div>
        </td>
        <td className="py-3 pl-2">
          <div className="flex items-center gap-1 justify-end">
            <button onClick={handleDelete} disabled={deleting}
              className="px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 font-lexend text-[11px] text-white disabled:opacity-50">
              {deleting ? 'Eliminando…' : 'Eliminar'}
            </button>
            <button onClick={onCancel}
              className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 font-lexend text-[11px] text-gray-700">
              Cancelar
            </button>
          </div>
        </td>
      </tr>
      {err && (
          <tr>
            <td colSpan={10} className="pb-2 px-2">
              <p className="font-lexend text-[11px] text-red-500">{err}</p>
            </td>
          </tr>
        )
      }
    </>
  );
}

// PiezasModal
function PiezasModal({ entrada, onClose }: { entrada: any; onClose: () => void }) {
  const [piezas, setPiezas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<PiezaEditForm>(EMPTY_PIEZA_FORM);
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const fetchPiezas = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      setPiezas(await ApiClient.getPiezasByEntrada(String(entrada.id)));
    } catch (e: any) {
      setError(e?.message ?? 'Error al cargar piezas');
    } finally {
      setLoading(false);
    }
  }, [entrada.id]);

  useEffect(() => { fetchPiezas(); }, [fetchPiezas]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  async function handleAddPieza() {
    setAddSaving(true); setAddError(null);
    try {
      const created = await ApiClient.addPieza(String(entrada.id), {
          grueso: parseFraction(addForm.grueso),
          clase: parseInt(addForm.clase, 10),
          ancho: parseFloat(addForm.ancho),
          largo: parseFloat(addForm.largo),
          verde: parseInt(addForm.verde  || '0', 10),
          estufa: parseInt(addForm.estufa || '0', 10),
        }
      );
      setPiezas((prev) => [...prev, created]);
      setAddForm(EMPTY_PIEZA_FORM);
      setShowAddForm(false);
    } catch (e: any) {
      setAddError(e?.message ?? 'Error al agregar pieza');
    } finally {
      setAddSaving(false);
    }
  }

  const volumenTotal = piezas.reduce((s, p) => s + parseFloat(p.volumenM3 ?? p.volumen_m3 ?? p.volumen ?? 0), 0);
  const piesTablaTotal = piezas.reduce((s, p) => s + parseFloat(p.piesTabla ?? p.pies_tabla ?? 0), 0);

  const inputCls =
    'w-full border border-gray-200 rounded-md px-2 py-1.5 font-lexend text-[12px] ' +
    'text-[#0A2C25] focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-gray-300'
  ;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm bg-[#0A2C25]/20"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-top-2 duration-200">

        {/* Header */}
        <ModalHeader
          title="Piezas de la entrada"
          subtitle={`${formatDate(entrada.fecha)} · ${formatTime(entrada.fecha)} · ${entrada.turno} · ${entrada.aserradero || 'Aserradero #1'}`}
          icon={Cuboid}
          onClose={onClose}
          variant="gradient"
        />

        {/* Resumen compacto */}
        <div className="grid grid-cols-3 divide-x divide-gray-200 px-6 py-4 border-b border-gray-100 bg-gray-50">
          {
            [
              {label: 'Total piezas', value: loading ? '—' : String(piezas.length), color: 'text-[#0A2C25]' },
              {label: 'Volumen total', value: loading ? '—' : `${volumenTotal.toFixed(3)} m³`, color: 'text-[#3786E6]' },
              {label: 'Pies tabla', value: loading ? '—' : piesTablaTotal.toFixed(1), color: 'text-[#C4670B]' },
            ].map(({ label, value, color }) => (
                <div key={label} className="text-center px-2">
                  <p className="font-lexend font-medium text-[14px] text-[#839590] tracking-wider mb-0.5">{label}</p>
                  <p className={`font-lexend font-normal text-[20px] ${color}`}>{value}</p>
                </div>
              )
            )
          }
        </div>

        {/* Cuerpo */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-8 h-8 border-2 border-[#3786E6] border-t-transparent rounded-full animate-spin" />
                <p className="font-lexend font-medium text-[14px] text-[#839590]">Cargando piezas...</p>
              </div>
            )
          }
          {error && !loading && (
              <p className="font-lexend text-[14px] text-red-500 text-center py-12">{error}</p>
            )
          }
          {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#e0e4e3]">
                      {['#','Grueso','Clase','Ancho','Largo','Verde','Estufa','Pies Tabla','Vol. m³','Acciones'].map((h, i) => (
                          <th key={h} className={`font-lexend font-medium text-[14px] text-[#839590] pb-3 pr-2
                            ${i >= 7 ? 'text-right' : 'text-left'} ${i === 9 ? 'pl-2' : ''}`}>
                            {h}
                          </th>
                        )
                      )
                    }
                    </tr>
                  </thead>
                  <tbody>
                    {piezas.length === 0 && (
                        <tr>
                          <td colSpan={10} className="py-10 text-center">
                            <p className="font-lexend text-[13px] text-[#839590]">Sin piezas registradas</p>
                          </td>
                        </tr>
                      )
                    }

                    {piezas.map((pieza, i) =>
                      editingId === pieza.id ? (
                        <EditPiezaRow key={pieza.id} pieza={pieza} index={i}
                          entradaId={String(entrada.id)}
                          onSaved={(u) => { setPiezas(prev => prev.map(p => p.id === u.id ? u : p)); setEditingId(null); }}
                          onCancel={() => setEditingId(null)} />
                      ) : deletingId === pieza.id ? (
                        <DeletePiezaRow key={pieza.id} pieza={pieza} index={i}
                          entradaId={String(entrada.id)}
                          onDeleted={(id) => { setPiezas(prev => prev.filter(p => p.id !== id)); setDeletingId(null); }}
                          onCancel={() => setDeletingId(null)} />
                      ) : (
                          <tr key={pieza.id ?? i}
                            className="border-b border-[#e0e4e3] last:border-0 hover:bg-gray-300/20 transition-colors group">
                            <td className="font-lexend text-[13px] text-[#839590] py-3 pr-2">{i + 1}</td>
                            <td className="font-lexend text-[13px] text-[#0A2C25] py-3 pr-2">{pieza.grueso}</td>
                            <td className="font-lexend text-[13px] text-[#0A2C25] py-3 pr-2">{pieza.clase}</td>
                            <td className="font-lexend text-[13px] text-[#0A2C25] py-3 pr-2">{parseFloat(pieza.ancho ?? 0).toFixed(2)}</td>
                            <td className="font-lexend text-[13px] text-[#0A2C25] py-3 pr-2">{parseFloat(pieza.largo ?? 0).toFixed(2)}</td>
                            <td className="font-lexend text-[13px] text-[#0A2C25] py-3 pr-2">{pieza.verde}</td>
                            <td className="font-lexend text-[13px] text-[#0A2C25] py-3 pr-2">{pieza.estufa}</td>
                            <td className="font-lexend text-[14px] font-medium text-[#C4670B] py-3 text-right">
                              {parseFloat(pieza.piesTabla ?? pieza.pies_tabla ?? 0).toFixed(2)}
                            </td>
                            <td className="font-lexend text-[14px] font-medium text-[#09934D] py-3 text-right">
                              {parseFloat(pieza.volumenM3 ?? pieza.volumen_m3 ?? pieza.volumen ?? 0).toFixed(4)}
                            </td>
                            <td className="py-3 pl-2">
                              <div className="flex items-center gap-1 justify-end sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setDeletingId(null); setEditingId(pieza.id); }}
                                  className="w-7 h-7 rounded-md bg-blue-100 hover:bg-blue-200 flex items-center justify-center">
                                  <Pencil className="w-3.5 h-3.5 text-blue-500" />
                                </button>
                                <button onClick={() => { setEditingId(null); setDeletingId(pieza.id); }}
                                  className="w-7 h-7 rounded-md bg-red-100 hover:bg-red-200 flex items-center justify-center">
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )
                    }

                    {/* Fila agregar */}
                    {showAddForm && (
                        <>
                          <tr className="border-b border-emerald-100 bg-emerald-50">
                            <td className="font-lexend text-[12px] text-emerald-600 py-2 pr-2">+</td>
                            <td className="py-2 pr-2">
                              <input
                                id="add-pieza-grueso"
                                name="add-pieza-grueso"
                                className={inputCls} placeholder="Grueso" value={addForm.grueso}
                                onChange={(e) => setAddForm({ ...addForm, grueso: e.target.value })} />
                            </td>
                            <td className="py-2 pr-2">
                              <select
                                id="add-pieza-clase"
                                name="add-pieza-clase"
                                aria-label="Clase de pieza"
                                className={inputCls} value={addForm.clase}
                                onChange={(e) => setAddForm({ ...addForm, clase: e.target.value })}>
                                {['2','3','4','5'].map(v => <option key={v} value={v}>{v}</option>)}
                              </select>
                            </td>
                            {([
                              {field: 'ancho', type: 'number', step: '0.01'},
                              {field: 'largo', type: 'number', step: '0.01'},
                              {field: 'verde', type: 'number', step: '1'},
                              {field: 'estufa',type: 'number', step: '1'},
                            ] as const).map(({ field, step }) => (
                                  <td key={field} className="py-2 pr-2">
                                    <input
                                      id={`add-pieza-${field}`}
                                      name={`add-pieza-${field}`}
                                      className={inputCls} type="number" step={step}
                                      placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                      value={addForm[field]}
                                      onChange={(e) => setAddForm({ ...addForm, [field]: e.target.value })} />
                                  </td>
                                )
                              )
                            }
                            <td className="py-2 text-right font-lexend text-medium text-[12px] text-[#839590]">—</td>
                            <td className="py-2 text-right font-lexend text-medium text-[12px] text-[#839590]">—</td>
                            <td className="py-2 pl-2">
                              <div className="flex items-center gap-1 justify-end">
                                <button onClick={handleAddPieza} disabled={addSaving}
                                  className="w-7 h-7 rounded-md bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center disabled:opacity-50">
                                  <Check className="w-3.5 h-3.5 text-white" />
                                </button>
                                <button onClick={() => { setShowAddForm(false); setAddForm(EMPTY_PIEZA_FORM); setAddError(null); }}
                                  className="w-7 h-7 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
                                  <Ban className="w-3.5 h-3.5 text-gray-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {addError && (
                              <tr>
                                <td colSpan={10} className="pb-2 px-2">
                                  <p className="font-lexend text-[11px] text-red-500 bg-red-50 rounded-md px-2 py-1">{addError}</p>
                                </td>
                              </tr>
                            )
                          }
                        </>
                      )
                    }
                  </tbody>
                </table>
              </div>
            )
          }
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <AddRowButton
            label="Agregar pieza"
            onClick={() => { setShowAddForm(true); setEditingId(null); setDeletingId(null); }}
            disabled={loading}
            variant="green"
          />
          <CloseButton onClose={onClose} />
        </div>
      </div>
    </div>
  );
}

//Página principal
export default function ProduccionPage() {
  const router = useRouter();
  const [entradas, setEntradas] = useState<EntradaProduccion[]>([]);
  const [selectedEntrada, setSelectedEntrada] = useState<EntradaProduccion | null>(null);
  const [modalEntrada, setModalEntrada] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadEntradas(); }, []);

  async function loadEntradas() {
    setIsLoading(true);
    try {
      const data = await ApiClient.getProducciones();
      setEntradas(data || []);
      if (data?.length > 0) setSelectedEntrada(data[0]);
    } catch (e) {
      console.error(e);
      setEntradas([]);
    }
    setIsLoading(false);
  }

  const handleCloseModal = useCallback(() => setModalEntrada(null), []);

  return (
    <>
      <Header
        title="Historial de madera en tabla"
        subtitle="Visualización detallada de volúmenes totales y conteo de piezas por entrada de producción"
      />

      <NewEntryButton href="/produccion/nueva" />

      {/* SidebarLayout */}
      <SidebarLayout
        main={
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-lexend font-medium text-[16px] text-[#0A2C25] mb-6 uppercase tracking-wide">
              Listado de madera en tabla
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#c1cac7]">
                    {
                      [
                        {label: 'Folio (Fecha)', align: 'text-left'},
                        {label: 'Turno', align: 'text-left'},
                        {label: 'Aserradero', align: 'text-left'  },
                        {label: 'Piezas', align: 'text-center'},
                        {label: 'Acción', align: 'text-center'},
                      ].map(({ label, align }) => (
                         <th key={label} className={`font-lexend font-medium ${align} text-[14px] text-[#839590] pb-3`}>{label}</th>
                        )
                      )
                    }
                  </tr>
                </thead>
                <tbody>
                  {entradas.map((entrada) => (
                        <tr
                          key={entrada.id}
                          onClick={() => setSelectedEntrada(entrada)}
                          className={`border-b border-[#e0e4e3] last:border-0 hover:bg-gray-50 transition-colors cursor-pointer ${selectedEntrada?.id === entrada.id ? 'bg-[#f0fdf4]' : ''}`}
                        >
                          {/* formatters */}
                          <td className="font-lexend font-normal py-4 text-[14px] text-[#0A2C25]">
                            {formatDate(entrada.fecha)} - {formatTime(entrada.fecha)}
                          </td>
                          <td className="font-lexend font-normal py-4 text-[13px] text-[#0A2C25]">{entrada.turno}</td>
                          <td className="font-lexend font-normal py-4 text-[13px] text-[#0A2C25]">{entrada.aserradero}</td>
                          <td className="font-lexend font-normal py-4 text-[13px] text-[#0A2C25] text-center">{entrada.totalPiezas || 0}</td>
                          <td className="py-4 text-center">
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedEntrada(entrada); setModalEntrada(entrada); }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A2C25] text-white font-lexend text-[12px] rounded-md hover:bg-[#1a4a3a] transition-colors">
                              <ExternalLink className="w-3.5 h-3.5" /> Abrir
                            </button>
                          </td>
                        </tr>
                      )
                    )
                  }
                  {entradas.length === 0 && (
                      <tr>
                        <td 
                          colSpan={5} className="font-lexend py-8 text-center text-[16px] text-[#839590]">No hay entradas de producción
                        </td>
                      </tr>
                    )
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
        sidebar={
          <>
            {/* StatCard */}
            <StatCard
              label="Entrada seleccionada"
              value={selectedEntrada
                ? `${formatDate(selectedEntrada.fecha)} - ${formatTime(selectedEntrada.fecha)}`
                : 'Ninguna'}
              icon={FileText}
              variant="gray"
              valueClassName="text-[20px] font-medium"
            />

            {selectedEntrada && (
              <>
                <StatCard
                  label="Volumen total"
                  value={selectedEntrada.volumenTotal != null
                    ? selectedEntrada.volumenTotal.toFixed(2)
                    : '0.00'}
                  icon={Layers}
                  variant="blue"
                  suffix="m³"
                />
                <StatCard
                  label="Piezas (cantidad)"
                  value={String(selectedEntrada.totalPiezas || 0).padStart(3, '0')}
                  icon={Cuboid}
                  variant="orange"
                />
                <ViewDetailButton
                  label="Ver piezas de esta entrada"
                  onClick={() => setModalEntrada(selectedEntrada)}
                />
              </>
            )}
          </>
        }
      />
      {modalEntrada && <PiezasModal entrada={modalEntrada} onClose={handleCloseModal} />}
    </>
  );
}