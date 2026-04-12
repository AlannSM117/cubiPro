'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/apiClient';
import {
  FileText, ExternalLink, CirclePile,
  Pencil, Trash2, Check, Ban, AlertTriangle,Cylinder,
} from 'lucide-react';
import { formatDate, formatTime } from '@/lib/formatters';

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
interface TrozaForm {
  diametro1: string;
  diametro2: string;
  largo: string;
  descuento: string;
}

const EMPTY_FORM: TrozaForm = { diametro1: '', diametro2: '', largo: '', descuento: '0' };

// EditRow
// (sin cambios, ya está bien encapsulado)
function EditRow({ troza, index, entradaId, onSaved, onCancel }: {
  troza: any; index: number; entradaId: string;
  onSaved: (updated: any) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState<TrozaForm>({
      diametro1: String(troza.diametro1 ?? troza.diametro_1 ?? ''),
      diametro2: String(troza.diametro2 ?? troza.diametro_2 ?? ''),
      largo: String(troza.largo ?? ''),
      descuento: String(troza.descuento ?? '0'),
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
      const updated = await ApiClient.updateTroza(entradaId, troza.id, {
          diametro1: parseFloat(form.diametro1),
          diametro2: parseFloat(form.diametro2),
          largo: parseFloat(form.largo),
          descuento: parseFloat(form.descuento),
        }
      );
      onSaved(updated);
    } catch (e: any) {
      setErr(e?.message ?? 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <tr className="border-b border-[#e8f4ff] bg-[#f0f8ff]">
        <td className="font-lexend text-[13px] text-[#839590] py-2 pr-2">{index + 1}</td>
        {(['diametro1','diametro2','largo','descuento'] as const).map((field, i) => (
              <td key={field} className="py-2 pr-2 min-w-[80px]">
                <input
                  id={`edit-troza-${troza.id}-${field}`}
                  name={`edit-troza-${field}`}
                  className={input} value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  type="number" step={i < 2 ? '0.1' : '0.01'} />
              </td>
            )
          )
        }
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
            <td colSpan={7} className="pb-2 px-2">
              <p className="font-lexend text-[11px] text-red-500 bg-red-50 rounded-md px-2 py-1">{err}</p>
            </td>
          </tr>
        )
      }
    </>
  );
}

// DeleteConfirmRow
function DeleteConfirmRow({ troza, index, entradaId, onDeleted, onCancel }: {
  troza: any; index: number; entradaId: string;
  onDeleted: (id: string) => void; onCancel: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true); setErr(null);
    try {
      await ApiClient.deleteTroza(entradaId, troza.id);
      onDeleted(troza.id);
    } catch (e: any) {
      setErr(e?.message ?? 'Error al eliminar');
      setDeleting(false);
    }
  }

  return (
    <>
      <tr className="border-b border-red-100 bg-red-50">
        <td colSpan={6} className="py-3 px-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="font-lexend text-[12px] text-red-700">¿Eliminar troza #{index + 1}?</span>
          </div>
        </td>
        <td className="py-3 pl-2">
          <div className="flex items-center gap-1 justify-end">
            <button onClick={handleDelete} disabled={deleting}
              className="px-2 py-1 rounded-md bg-red-500 text-white text-[10px] uppercase font-bold disabled:opacity-50">
              {deleting ? '...' : 'Eliminar'}
            </button>
            <button onClick={onCancel}
              className="px-2 py-1 rounded-md bg-gray-200 text-gray-700 text-[10px] uppercase font-bold">
              No
            </button>
          </div>
        </td>
      </tr>
      {err && (
          <tr>
            <td colSpan={7} className="pb-2 px-2 text-red-500 font-lexend text-[10px]">
              {err}
            </td>
          </tr>
        )
      }
    </>
  );
}

// TrozasModal
function TrozasModal({ entrada, onClose }: { entrada: any; onClose: () => void }) {
  const [trozas, setTrozas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<TrozaForm>(EMPTY_FORM);
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const fetchTrozas = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      setTrozas(await ApiClient.getTrozasByEntrada(entrada.id));
    } catch (e: any) {
      setError(e?.message ?? 'Error al cargar trozas');
    } finally {
      setLoading(false);
    }
  }, [entrada.id]);

  useEffect(() => { fetchTrozas(); }, [fetchTrozas]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  async function handleAddTroza() {
    setAddSaving(true); setAddError(null);
    try {
      const created = await ApiClient.addTroza(entrada.id, {
          diametro1: parseFloat(addForm.diametro1),
          diametro2: parseFloat(addForm.diametro2),
          largo: parseFloat(addForm.largo),
          descuento: parseFloat(addForm.descuento || '0'),
        }
      );
      setTrozas((prev) => [...prev, created]);
      setAddForm(EMPTY_FORM);
      setShowAddForm(false);
    } catch (e: any) {
      setAddError(e?.message ?? 'Error al agregar troza');
    } finally {
      setAddSaving(false);
    }
  }

  const volumenTotal = trozas.reduce(
    (s, t) => s + parseFloat(t.volumen ?? t.volumenFinal ?? t.volumen_final ?? 0), 0
  );

  const inputCls =
    'w-full border border-gray-200 rounded-md px-2 py-1.5 font-lexend text-[12px] ' +
    'text-[#0A2C25] focus:outline-none focus:ring-1 focus:ring-[#3786E6] placeholder:text-gray-300';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm bg-[#0A2C25]/20"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-top-2 duration-200">

        {/* Header */}
        <ModalHeader
          title="Trozas de la entrada"
          subtitle={`${formatDate(entrada.fecha)} · ${formatTime(entrada.fecha)} · ${entrada.turno}`}
          icon={Cylinder}
          onClose={onClose}
          variant="gradient"
        />

        {/* Resumen — usando StatCard en versión compacta horizontal */}
        <div className="grid grid-cols-3 divide-x divide-gray-200 px-6 py-4 border-b border-gray-100 bg-gray-50">
          {[
            { label: 'Total trozas', value: loading ? '—' : String(trozas.length), color: 'text-[#0A2C25]' },
            { label: 'Volumen total', value: loading ? '—' : `${volumenTotal.toFixed(3)} m³`, color: 'text-[#3786E6]' },
            { label: 'Clase', value: entrada.clase ?? '—', color: 'text-[#C4670B]' },
          ].map(({ label, value, color }) => (
                <div key={label} className="text-center px-2">
                  <p className="font-lexend font-medium text-[14px] text-[#839590] tracking-wider mb-0.5">{label}</p>
                  <p className={`font-lexend font-normal text-[20px] ${color}`}>{value}</p>
                </div>
              )
            )
          }
        </div>

        {/* Tabla */}
        <div className="overflow-auto flex-1 p-4 sm:px-6">
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
                      {['#','Diám. 1','Diám. 2','Largo','Desc.','Volumen','Acc.'].map((h, i) => (
                            <th key={h} className={`font-lexend font-medium text-[14px] text-[#839590] pb-3 pr-2
                              ${i === 5 ? 'text-right' : 'text-left'} ${i === 6 ? 'text-right pl-2' : ''}`}>
                              {h}
                            </th>
                          )
                        )
                      }
                    </tr>
                  </thead>
                  <tbody>
                    {trozas.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-10 text-center">
                          <p className="font-lexend text-[13px] text-[#839590]">Sin trozas registradas</p>
                        </td>
                      </tr>
                    )}
                    {trozas.map((troza, i) =>
                        editingId === troza.id ? (
                          <EditRow key={troza.id} troza={troza} index={i} entradaId={entrada.id}
                            onSaved={(u) => { setTrozas(prev => prev.map(t => t.id === u.id ? u : t)); setEditingId(null); }}
                            onCancel={() => setEditingId(null)} />
                        ) : deletingId === troza.id ? (
                          <DeleteConfirmRow key={troza.id} troza={troza} index={i} entradaId={entrada.id}
                            onDeleted={(id) => { setTrozas(prev => prev.filter(t => t.id !== id)); setDeletingId(null); }}
                            onCancel={() => setDeletingId(null)} />
                        ) : (
                          <tr key={troza.id ?? i}
                            className="border-b border-[#e0e4e3] last:border-0 hover:bg-gray-300/20 transition-colors group">
                            <td className="font-lexend text-[13px] text-[#839590] py-3 pr-2">{i + 1}</td>
                            <td className="font-lexend text-[13px] text-[#0A2C25] py-3 pr-2">{parseFloat(troza.diametro1 ?? 0).toFixed(1)}</td>
                            <td className="font-lexend text-[13px] text-[#0A2C25] py-3 pr-2">{parseFloat(troza.diametro2 ?? 0).toFixed(1)}</td>
                            <td className="font-lexend text-[13px] text-[#0A2C25] py-3 pr-2">{parseFloat(troza.largo     ?? 0).toFixed(2)}</td>
                            <td className="font-lexend text-[13px] text-[#0A2C25] py-3 pr-2">{parseFloat(troza.descuento ?? 0).toFixed(2)}</td>
                            <td className="font-lexend text-[14px] font-medium text-[#3786E6] py-3 text-right">
                              {parseFloat(troza.volumen ?? 0).toFixed(4)}
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center gap-1 justify-end sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setDeletingId(null); setEditingId(troza.id); }}
                                  className="w-7 h-7 rounded-md bg-blue-100 hover:bg-blue-200 flex items-center justify-center">
                                  <Pencil className="w-3.5 h-3.5 text-blue-500" />
                                </button>
                                <button onClick={() => { setEditingId(null); setDeletingId(troza.id); }}
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
                          <tr className="bg-emerald-50 ">
                            <td className="py-2 pr-2 font-lexend text-[12px] text-emerald-600">+</td>
                            {[
                              { field: 'diametro1', step: '0.1' },
                              { field: 'diametro2', step: '0.1' },
                              { field: 'largo', step: '0.01' },
                              { field: 'descuento', step: '0.01' },
                            ].map(({ field, step }) => (
                                  <td key={field} className="py-2 pr-2">
                                    <input
                                      id={`add-troza-${field}`}
                                      name={`add-troza-${field}`}
                                      className={inputCls} type="number" step={step}
                                      value={addForm[field as keyof TrozaForm]}
                                      onChange={(e) => setAddForm({ ...addForm, [field]: e.target.value })}  />
                                  </td>
                                )
                              )
                            }
                            <td className="py-2 text-right font-lexend text-medium text-[12px] text-[#839590]">—</td>
                            <td className="py-2">
                              <div className="flex justify-end gap-1">
                                <button onClick={handleAddTroza} disabled={addSaving}
                                  className="p-1.5 bg-emerald-500/70 rounded-md disabled:opacity-50">
                                  <Check className="w-3.5 h-3.5 text-white" />
                                </button>
                                <button onClick={() => { setShowAddForm(false); setAddForm(EMPTY_FORM); setAddError(null); }}
                                  className="p-1.5 bg-gray-400 rounded-md">
                                  <Ban className="w-3.5 h-3.5 text-white" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {addError && (
                              <tr>
                                <td colSpan={7} className="pb-2 px-2">
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
        <div className="p-4 sm:px-6 border-t border-gray-100 flex items-center justify-between">
          <AddRowButton
            label="Agregar troza"
            onClick={() => { setShowAddForm(true); setEditingId(null); setDeletingId(null); }}
            disabled={loading}
            variant="green"
            className="flex-1 sm:flex-none justify-center"
          />
         <CloseButton onClose={onClose} />
        </div>
      </div>
    </div>
  );
}

// Página principal
export default function TroceriaPage() {
  const router = useRouter();
  const [entradas, setEntradas] = useState<any[]>([]);
  const [selectedEntrada, setSelectedEntrada] = useState<any | null>(null);
  const [modalEntrada, setModalEntrada] = useState<any | null>(null);

  useEffect(() => { loadEntradas(); }, []);

  async function loadEntradas() {
    try {
      const data = await ApiClient.getTrocerias();
      setEntradas(data || []);
      if (data?.length > 0) setSelectedEntrada(data[0]);
    } catch (e) { console.error(e); }
  }

  const handleCloseModal = useCallback(() => setModalEntrada(null), []);

  return (
    <>
      <Header
        title="Historial de trocería"
        subtitle="Visualización detallada de volúmenes totales y conteo de trozas"
      />

      <NewEntryButton href="/troceria/nueva" />

      {/* Usando SidebarLayout */}
      <SidebarLayout
        main={
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <h2 className="font-lexend font-medium text-[16px] text-[#0A2C25] mb-6 uppercase tracking-wide">
              Listado de trocería
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-[#c1cac7]">
                    {['Fecha/Folio','Turno','Trozas','Acción'].map((h, i) => (
                          <th key={h} className={`font-lexend font-medium text-[14px] text-[#839590] pb-3
                            ${i === 2 || i === 3 ? 'text-center' : 'text-left'}`}>
                            {h}
                          </th>
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
                          className={`border-b border-[#e0e4e3] last:border-0 hover:bg-gray-50 transition-colors cursor-pointer ${selectedEntrada?.id === entrada.id ? 'bg-[#f0fdf4]' : ''}`}>
                          {/* Usando formatters */}
                          <td className="font-lexend font-normal py-4 text-[14px] text-[#0A2C25]">
                            {formatDate(entrada.fecha)} - {formatTime(entrada.fecha)}
                          </td>
                          <td className="font-lexend font-normal py-4 text-[13px] text-[#0A2C25]">{entrada.turno}</td>
                          <td className="font-lexend font-normal py-4 text-[13px] text-[#0A2C25] text-center">
                            {entrada.totalTrozas ?? entrada.total_trozas ?? 0}
                          </td>
                          <td className="py-4 text-center">
                            <button
                              onClick={(e) => { e.stopPropagation(); setModalEntrada(entrada); }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A2C25] text-white font-lexend text-[12px] rounded-md hover:bg-[#1a4a3a] transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />Abrir
                            </button>
                          </td>
                        </tr>
                      )
                    )
                  }
                  {entradas.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center font-lexend text-[14px] text-[#839590]">
                          No hay entradas de trocería
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
            {/* Usando StatCard */}
            <StatCard
              label="Entrada seleccionada"
              value={selectedEntrada ? `${formatDate(selectedEntrada.fecha)} - ${formatTime(selectedEntrada.fecha)}` : 'Ninguna'}
              icon={FileText}
              variant="gray"
              valueClassName="text-[20px] font-medium"
            />

            {selectedEntrada && (
              <>
                <StatCard
                  label="Volumen total"
                  value={`${parseFloat(selectedEntrada.volumenTotal ?? 0).toFixed(2)}`}
                  icon={CirclePile}
                  variant="blue"
                  suffix="m³"
                />
                <StatCard
                  label="Trozas (cantidad)"
                  value={String(selectedEntrada.totalTrozas || 0).padStart(3, '0')}
                  icon={Cylinder}
                  variant="orange"
                />
                <ViewDetailButton
                  label="Ver detalle de trozas"
                  onClick={() => setModalEntrada(selectedEntrada)}
                />
              </>
            )}
          </>
        }
      />
      {modalEntrada && <TrozasModal entrada={modalEntrada} onClose={handleCloseModal} />}
    </>
  );
}