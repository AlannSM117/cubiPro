interface CloseButtonProps {
  onClose: () => void;
  label?: string;
}

export function CloseButton({ onClose, label = 'Cerrar' }: CloseButtonProps) {
  return (
    <button
      onClick={onClose}
      className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 rounded-xl font-lexend font-medium transition-all text-[14px]">
      {label}
    </button>
  );
}