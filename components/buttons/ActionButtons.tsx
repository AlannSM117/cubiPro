'use client';

import { Save } from 'lucide-react';

interface ActionButtonsProps {
  onFinalize: () => void;
  onDiscard: () => void;
  saving?: boolean;
  /** Texto del botón principal. Default: "Finalizar entrada" */
  finalizeLabel?: string;
}

export function ActionButtons({
  onFinalize,
  onDiscard,
  saving = false,
  finalizeLabel = 'Finalizar entrada',
}: ActionButtonsProps) {
  return (
    <div className="flex gap-4">
      <button
        onClick={onFinalize}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-[#08C565] text-white font-lexend rounded-xl hover:bg-[#09934D] transition-colors font-normal text-[14px] shadow-lg shadow-[#08C565]/20">
        <Save className="w-5 h-5" />
        {saving ? 'Guardando…' : finalizeLabel}
      </button>

      <button
        onClick={onDiscard}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 rounded-xl font-lexend font-medium transition-all text-[14px]">
        Descartar entrada
      </button>
    </div>
  );
}