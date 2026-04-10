'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { ApiClient } from '@/lib/apiClient';
import {
  Plus,
  FileText,
  Layers,
  ExternalLink,
  X,
  ChevronRight,
  Pencil,
  Trash2,
  Check,
  Ban,
  AlertTriangle,
  Package,
} from 'lucide-react';

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface EntradaProduccion {
  id: number;
  fecha: string;
  turno: string;
  aserradero: string;
  volumenTotal: number;
  totalPiezas: number;
}

interface PiezaEditForm {
  grueso: string;
  clase: string;
  ancho: string;
  largo: string;
  verde: string;
  estufa: string;
}

const EMPTY_PIEZA_FORM: PiezaEditForm = {
  grueso: '',
  clase: '2',
  ancho: '',
  largo: '',
  verde: '',
  estufa: '',
};

function parseFraction(val: string): number {
  if (!val) return 0;
  try {
    const parts = val.trim().split(' ');
    if (parts.length === 2) {
      const whole = parseFloat(parts[0]);
      const frac = parts[1].split('/');
      return whole + parseFloat(frac[0]) / parseFloat(frac[1]);
    } else if (val.includes('/')) {
      const frac = val.split('/');
      return parseFloat(frac[0]) / parseFloat(frac[1]);
    }
    return parseFloat(val) || 0;
  } catch {
    return 0;
  }
}

// ─── Sub-componente: fila editable ───────────────────────────────────────────
function EditPiezaRow({
  pieza,
  index,
  entradaId,
  onSaved,
  onCancel,
}: {
  pieza: any;
  index: number;
  entradaId: string;
  onSaved: (updated: any) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<PiezaEditForm>({
    grueso: String(pieza.grueso ?? ''),
    clase: String(pieza.clase ?? '2'),
    ancho: String(pieza.ancho ?? ''),
    largo: String(pieza.largo ?? ''),
    verde: String(pieza.verde ?? ''),
    estufa: String(pieza.estufa ?? ''),
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const input =
    'w-full border border-gray-200 rounded-md px-2 py-1 font-lexend text-[12px] text-[#0A2C25] focus:outline-none focus:ring-1 focus:ring-[#3786E6]';

  async function handleSave() {
    setSaving(true);
    setErr(null);
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
      <tr className="border-b border-[#e8f4ff] bg-[#f0f8ff]">
        <td className="font-lexend text-[13px] text-[#839590] py-2 pr-2">{index + 1}</td>
        <td className="py-2 pr-2">
          <input className={input} value={form.grueso} onChange={(e) => setForm({ ...form, grueso: e.target.value })} placeholder="Ej. 1 1/2" />
        </td>
        <td className="py-2 pr-2">
          <select className={input} value={form.clase} onChange={(e) => setForm({ ...form, clase: e.target.value })}>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </td>
        <td className="py-2 pr-2">
          <input className={input} value={form.ancho} onChange={(e) => setForm({ ...form, ancho: e.target.value })} type="number" step="0.01" />
        </td>
        <td className="py-2 pr-2">
          <input className={input} value={form.largo} onChange={(e) => setForm({ ...form, largo: e.target.value })} type="number" step="0.01" />
        </td>
        <td className="py-2 pr-2">
          <input className={input} value={form.verde} onChange={(e) => setForm({ ...form, verde: e.target.value })} type="number" step="1" />
        </td>
        <td className="py-2 pr-2">
          <input className={input} value={form.estufa} onChange={(e) => setForm({ ...form, estufa: e.target.value })} type="number" step="1" />
        </td>
        <td className="py-2 text-right font-lexend text-[12px] text-[#839590]">—</td>
        <td className="py-2 text-right font-lexend text-[12px] text-[#839590]">—</td>
        <td className="py-2 pl-2">
          <div className="flex items-center gap-1 justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-7 h-7 rounded-md bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5 text-white" />
            </button>
            <button
              onClick={onCancel}
              className="w-7 h-7 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
            >
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
      )}
    </>
  );
}

// ─── Sub-componente: confirmar eliminación ────────────────────────────────────
function DeletePiezaRow({
  pieza,
  index,
  entradaId,
  onDeleted,
  onCancel,
}: {
  pieza: any;
  index: number;
  entradaId: string;
  onDeleted: (id: string) => void;
  onCancel: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setErr(null);
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
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 font-lexend text-[11px] text-white transition-colors disabled:opacity-50"
            >
              {deleting ? 'Eliminando…' : 'Eliminar'}
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 font-lexend text-[11px] text-gray-700 transition-colors"
            >
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
      )}
    </>
  );
}

// ─── Modal de Piezas ─────────────────────────────────────────────────────────
function PiezasModal({
  entrada,
  onClose,
}: {
  entrada: any;
  onClose: () => void;
}) {
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
      setLoading(true);
      setError(null);
      const data = await ApiClient.getPiezasByEntrada(String(entrada.id));
      setPiezas(data);
    } catch (e: any) {
      setError(e?.message ?? 'Error al cargar piezas');
    } finally {
      setLoading(false);
    }
  }, [entrada.id]);

  useEffect(() => {
    fetchPiezas();
  }, [fetchPiezas]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function handleEditSaved(updated: any) {
    setPiezas((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditingId(null);
  }

  function handleDeleted(id: string) {
    setPiezas((prev) => prev.filter((p) => p.id !== id));
    setDeletingId(null);
  }

  async function handleAddPieza() {
    setAddSaving(true);
    setAddError(null);
    try {
      const created = await ApiClient.addPieza(String(entrada.id), {
        grueso: parseFraction(addForm.grueso),
        clase: parseInt(addForm.clase, 10),
        ancho: parseFloat(addForm.ancho),
        largo: parseFloat(addForm.largo),
        verde: parseInt(addForm.verde || '0', 10),
        estufa: parseInt(addForm.estufa || '0', 10),
      });
      setPiezas((prev) => [...prev, created]);
      setAddForm(EMPTY_PIEZA_FORM);
      setShowAddForm(false);
    } catch (e: any) {
      setAddError(e?.message ?? 'Error al agregar pieza');
    } finally {
      setAddSaving(false);
    }
  }

  const fechaLabel = new Date(entrada.fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const horaLabel = new Date(entrada.fecha).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const volumenTotal = piezas.reduce(
    (s, p) => s + parseFloat(p.volumenM3 ?? p.volumen_m3 ?? p.volumen ?? 0),
    0,
  );

  const piesTablaTotal = piezas.reduce(
    (s, p) => s + parseFloat(p.piesTabla ?? p.pies_tabla ?? 0),
    0,
  );

  const inputCls =
    'w-full border border-gray-200 rounded-md px-2 py-1.5 font-lexend text-[12px] text-[#0A2C25] focus:outline-none focus:ring-1 focus:ring-[#3786E6] placeholder:text-gray-300';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(10,44,37,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#0A2C25] to-[#1a4a3a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-lexend font-semibold text-white text-[15px]">Piezas de la entrada</p>
              <p className="font-lexend font-normal text-white/60 text-[12px]">
                {fechaLabel} · {horaLabel}&nbsp;·&nbsp;{entrada.turno}&nbsp;·&nbsp;{entrada.aserradero || 'Aserradero #1'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="text-center">
            <p className="font-lexend text-[11px] text-[#839590] uppercase tracking-wider mb-0.5">Total piezas</p>
            <p className="font-lexend text-[22px] font-semibold text-[#0A2C25]">
              {loading ? '—' : piezas.length}
            </p>
          </div>
          <div className="text-center">
            <p className="font-lexend text-[11px] text-[#839590] uppercase tracking-wider mb-0.5">Volumen total</p>
            <p className="font-lexend text-[22px] font-semibold text-[#09934D]">
              {loading ? '—' : `${volumenTotal.toFixed(3)} m³`}
            </p>
          </div>
          <div className="text-center">
            <p className="font-lexend text-[11px] text-[#839590] uppercase tracking-wider mb-0.5">Pies tabla</p>
            <p className="font-lexend text-[22px] font-semibold text-[#C4670B]">
              {loading ? '—' : piesTablaTotal.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 border-2 border-[#3786E6] border-t-transparent rounded-full animate-spin" />
              <p className="font-lexend text-[13px] text-[#839590]">Cargando piezas…</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p className="font-lexend text-[14px] text-red-500">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e0e4e3]">
                    <th className="font-lexend font-medium text-left text-[11px] text-[#839590] pb-3 pr-2 w-6">#</th>
                    <th className="font-lexend font-medium text-left text-[11px] text-[#839590] pb-3 pr-2">Grueso</th>
                    <th className="font-lexend font-medium text-left text-[11px] text-[#839590] pb-3 pr-2">Clase</th>
                    <th className="font-lexend font-medium text-left text-[11px] text-[#839590] pb-3 pr-2">Ancho</th>
                    <th className="font-lexend font-medium text-left text-[11px] text-[#839590] pb-3 pr-2">Largo</th>
                    <th className="font-lexend font-medium text-left text-[11px] text-[#839590] pb-3 pr-2">Verde</th>
                    <th className="font-lexend font-medium text-left text-[11px] text-[#839590] pb-3 pr-2">Estufa</th>
                    <th className="font-lexend font-medium text-right text-[11px] text-[#839590] pb-3">Pies Tabla</th>
                    <th className="font-lexend font-medium text-right text-[11px] text-[#839590] pb-3">Vol. m³</th>
                    <th className="font-lexend font-medium text-right text-[11px] text-[#839590] pb-3 pl-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {piezas.length === 0 && (
                    <tr>
                      <td colSpan={10} className="py-10 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Package className="w-8 h-8 text-gray-300" />
                          <p className="font-lexend text-[13px] text-[#839590]">Sin piezas registradas</p>
                        </div>
                      </td>
                    </tr>
                  )}

                  {piezas.map((pieza, i) => {
                    if (editingId === pieza.id) {
                      return (
                        <EditPiezaRow
                          key={pieza.id}
                          pieza={pieza}
                          index={i}
                          entradaId={String(entrada.id)}
                          onSaved={handleEditSaved}
                          onCancel={() => setEditingId(null)}
                        />
                      );
                    }
                    if (deletingId === pieza.id) {
                      return (
                        <DeletePiezaRow
                          key={pieza.id}
                          pieza={pieza}
                          index={i}
                          entradaId={String(entrada.id)}
                          onDeleted={handleDeleted}
                          onCancel={() => setDeletingId(null)}
                        />
                      );
                    }
                    return (
                      <tr
                        key={pieza.id ?? i}
                        className="border-b border-[#f0f2f1] last:border-0 hover:bg-[#f8fffe] transition-colors group"
                      >
                        <td className="font-lexend text-[12px] text-[#839590] py-3 pr-2">{i + 1}</td>
                        <td className="font-lexend text-[13px] text-[#0A2C25] py-3 pr-2">{pieza.grueso}</td>
                        <td className="font-lexend text-[13px] text-[#0A2C25] py-3 pr-2">{pieza.clase}</td>
                        <td className="font-lexend text-[13px] text-[#0A2C25] py-3 pr-2">{parseFloat(pieza.ancho ?? 0).toFixed(2)}</td>
                        <td className="font-lexend text-[13px] text-[#0A2C25] py-3 pr-2">{parseFloat(pieza.largo ?? 0).toFixed(2)}</td>
                        <td className="font-lexend text-[13px] text-[#0A2C25] py-3 pr-2">{pieza.verde}</td>
                        <td className="font-lexend text-[13px] text-[#0A2C25] py-3 pr-2">{pieza.estufa}</td>
                        <td className="font-lexend text-[13px] font-semibold text-[#C4670B] py-3 text-right">
                          {parseFloat(pieza.piesTabla ?? pieza.pies_tabla ?? 0).toFixed(2)}
                        </td>
                        <td className="font-lexend text-[13px] font-semibold text-[#09934D] py-3 text-right">
                          {parseFloat(pieza.volumenM3 ?? pieza.volumen_m3 ?? pieza.volumen ?? 0).toFixed(4)}
                        </td>
                        <td className="py-3 pl-2">
                          <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setDeletingId(null);
                                setEditingId(pieza.id);
                              }}
                              title="Editar"
                              className="w-7 h-7 rounded-md bg-[#3786E6]/10 hover:bg-[#3786E6]/20 flex items-center justify-center transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5 text-[#3786E6]" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setDeletingId(pieza.id);
                              }}
                              title="Eliminar"
                              className="w-7 h-7 rounded-md bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Fila nueva pieza */}
                  {showAddForm && (
                    <>
                      <tr className="border-b border-emerald-100 bg-emerald-50">
                        <td className="font-lexend text-[12px] text-[#839590] py-2 pr-2">+</td>
                        <td className="py-2 pr-2">
                          <input className={inputCls} placeholder="Grueso" value={addForm.grueso} onChange={(e) => setAddForm({ ...addForm, grueso: e.target.value })} />
                        </td>
                        <td className="py-2 pr-2">
                          <select className={inputCls} value={addForm.clase} onChange={(e) => setAddForm({ ...addForm, clase: e.target.value })}>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                          </select>
                        </td>
                        <td className="py-2 pr-2">
                          <input className={inputCls} placeholder="Ancho" type="number" step="0.01" value={addForm.ancho} onChange={(e) => setAddForm({ ...addForm, ancho: e.target.value })} />
                        </td>
                        <td className="py-2 pr-2">
                          <input className={inputCls} placeholder="Largo" type="number" step="0.01" value={addForm.largo} onChange={(e) => setAddForm({ ...addForm, largo: e.target.value })} />
                        </td>
                        <td className="py-2 pr-2">
                          <input className={inputCls} placeholder="Verde" type="number" value={addForm.verde} onChange={(e) => setAddForm({ ...addForm, verde: e.target.value })} />
                        </td>
                        <td className="py-2 pr-2">
                          <input className={inputCls} placeholder="Estufa" type="number" value={addForm.estufa} onChange={(e) => setAddForm({ ...addForm, estufa: e.target.value })} />
                        </td>
                        <td className="py-2 text-right font-lexend text-[12px] text-[#839590]">—</td>
                        <td className="py-2 text-right font-lexend text-[12px] text-[#839590]">—</td>
                        <td className="py-2 pl-2">
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              onClick={handleAddPieza}
                              disabled={addSaving}
                              className="w-7 h-7 rounded-md bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center transition-colors disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5 text-white" />
                            </button>
                            <button
                              onClick={() => { setShowAddForm(false); setAddForm(EMPTY_PIEZA_FORM); setAddError(null); }}
                              className="w-7 h-7 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                            >
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
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <button
            disabled={loading}
            onClick={() => {
              setShowAddForm(true);
              setEditingId(null);
              setDeletingId(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-lexend text-[13px] rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar pieza
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0A2C25] text-white font-lexend text-[13px] rounded-lg hover:bg-[#1a4a3a] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function ProduccionPage() {
  const router = useRouter();
  const [entradas, setEntradas] = useState<EntradaProduccion[]>([]);
  const [selectedEntrada, setSelectedEntrada] = useState<EntradaProduccion | null>(null);
  const [modalEntrada, setModalEntrada] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEntradas();
  }, []);

  async function loadEntradas() {
    setIsLoading(true);
    try {
      const data = await ApiClient.getProducciones();
      setEntradas(data || []);
      if (data && data.length > 0) {
        setSelectedEntrada(data[0]);
      }
    } catch (e) {
      console.error(e);
      setEntradas([]);
    }
    setIsLoading(false);
  }

  function handleNuevaEntrada() {
    router.push('/produccion/nueva');
  }

  const handleCloseModal = useCallback(() => setModalEntrada(null), []);

  return (
    <>
      <Header
        title="Historial de madera en tabla"
        subtitle="Visualización detallada de volúmenes totales y conteo de piezas por entrada de producción"
      />

      <button
        onClick={handleNuevaEntrada}
        className="flex items-center gap-2 px-6 py-3 bg-[#3786E6] text-white font-lexend rounded-lg hover:bg-[#0956B6] transition-colors mb-6 font-normal"
      >
        <Plus className="w-5 h-5" />
        Nueva entrada
      </button>

      <div className="grid grid-cols-3 gap-6">
        {/* Tabla principal */}
        <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-lexend font-medium text-[16px] text-[#0A2C25] mb-6 uppercase tracking-wide">
            LISTADO DE MADERA EN TABLA
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#c1cac7]">
                  <th className="font-lexend font-medium text-left text-[14px] text-[#839590] pb-3">Folio (Fecha)</th>
                  <th className="font-lexend font-medium text-left text-[14px] text-[#839590] pb-3">Turno</th>
                  <th className="font-lexend font-medium text-left text-[14px] text-[#839590] pb-3">Aserradero</th>
                  <th className="font-lexend font-medium text-center text-[14px] text-[#839590] pb-3">Piezas</th>
                  <th className="font-lexend font-medium text-center text-[14px] text-[#839590] pb-3">Acción</th>
                </tr>
              </thead>
              <tbody>
                {entradas.map((entrada) => {
                  const isSelected = selectedEntrada?.id === entrada.id;
                  return (
                    <tr
                      key={entrada.id}
                      onClick={() => setSelectedEntrada(entrada)}
                      className={`border-b border-[#e0e4e3] last:border-0 hover:bg-gray-400/10 transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#f0fdf4]' : ''
                      }`}
                    >
                      <td className="font-lexend font-normal py-4 text-[14px] text-[#0A2C25]">
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
                      <td className="font-lexend font-normal py-4 text-[13px] text-[#0A2C25]">{entrada.turno}</td>
                      <td className="font-lexend font-normal py-4 text-[13px] text-[#0A2C25]">{entrada.aserradero}</td>
                      <td className="font-lexend font-normal py-4 text-[13px] text-[#0A2C25] text-center">{entrada.totalPiezas || 0}</td>
                      <td className="py-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEntrada(entrada);
                            setModalEntrada(entrada);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A2C25] text-white font-lexend text-[12px] rounded-md hover:bg-[#1a4a3a] transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Abrir
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {entradas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="font-lexend font-normal py-8 text-center text-[16px] text-[#839590]">
                      No hay entradas de producción
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Card 1 */}
          <div className="bg-white rounded-[15px] p-3 shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-0.5">
              <div className="w-[64px] h-[64px] bg-[#f5f5f5] rounded-2xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-8 h-8 text-[#4b5563]" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="font-lexend font-medium text-[12px] text-[#0A2C25] uppercase tracking-wider mb-1.5">
                  ENTRADA SELECCIONADA
                </p>
                <p className="font-lexend font-normal text-[25px] leading-none text-[#0A2C25]">
                  {selectedEntrada
                    ? `${new Date(selectedEntrada.fecha).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })} - ${new Date(selectedEntrada.fecha).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`
                    : 'Ninguna'}
                </p>
              </div>
            </div>
          </div>

          {selectedEntrada && (
            <>
              {/* Card 2 */}
              <div className="bg-white rounded-[15px] p-3 shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-[64px] h-[64px] bg-green-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Layers className="w-8 h-8 text-[#09934D]" />
                  </div>
                  <div>
                    <p className="font-lexend font-medium text-[12px] text-[#0A2C25] uppercase tracking-wider mb-1.5">
                      VOLUMEN TOTAL
                    </p>
                    <p className="font-lexend font-normal text-[25px] leading-none text-[#09934D]">
                      {selectedEntrada.volumenTotal != null
                        ? selectedEntrada.volumenTotal.toFixed(2)
                        : '0.00'}{' '}
                      m³
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-[15px] p-3 shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-[64px] h-[64px] bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Layers className="w-8 h-8 text-[#C4670B]" />
                  </div>
                  <div>
                    <p className="font-lexend font-medium text-[12px] text-[#0A2C25] uppercase tracking-wider mb-1.5">
                      PIEZAS (CANTIDAD)
                    </p>
                    <p className="font-lexend font-normal text-[25px] leading-none text-[#C4670B]">
                      {String(selectedEntrada.totalPiezas || 0).padStart(3, '0')}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setModalEntrada(selectedEntrada)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0A2C25] text-white font-lexend text-[13px] rounded-xl hover:bg-[#1a4a3a] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
                Ver piezas de esta entrada
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalEntrada && <PiezasModal entrada={modalEntrada} onClose={handleCloseModal} />}
    </>
  );
}
