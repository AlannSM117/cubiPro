import { AlertTriangle } from 'lucide-react';

interface DiscardConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: React.ReactNode; 
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: React.ReactNode; 
  iconBgColor?: string;
  confirmBtnColor?: string;
}

export function DiscardConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = "¿Descartar entrada?", 
  description = "Esta acción no se puede deshacer.",
  confirmLabel = "Sí, descartar",
  cancelLabel = "Continuar editando",
  // Valores por defecto (Rojo y Alerta)
  icon = <AlertTriangle className="w-8 h-8 text-red-500" />,
  iconBgColor = "bg-red-50",
  confirmBtnColor = "bg-red-500 hover:bg-red-600 shadow-red-200"
}: DiscardConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="backdrop-blur-sm fixed inset-0 bg-[#0A2C25]/20 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[20px] shadow-2xl p-8 w-full max-w-md border border-gray-100 animate-in zoom-in-95 duration-200">

        <div className="flex flex-col items-center text-center mb-8">
          {/* Fondo del icono dinámico */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${iconBgColor}`}>
            {icon}
          </div>
          <p className="font-lexend font-medium text-[18px] text-[#0A2C25] uppercase tracking-wide mb-2">
            {title}
          </p>
          <p className="font-lexend font-normal text-[13px] text-[#839590] leading-relaxed">
            {description}
          </p>
        </div>
  
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 rounded-xl font-lexend font-medium transition-all text-[14px]"
          >
            {cancelLabel}
          </button>
          {/* Botón de confirmar con color dinámico */}
          <button 
            onClick={onConfirm}
            className={`flex-1 px-6 py-3 text-white rounded-xl font-lexend font-medium transition-colors shadow-lg text-[14px] ${confirmBtnColor}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}