import { Plus } from 'lucide-react';

const VARIANTS = {
  blue:  'bg-[#3786E6] hover:bg-[#0956B6]',
  green: 'bg-[#08C565] hover:bg-[#09934D]',
} as const;

interface AddRowButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: keyof typeof VARIANTS;
  className?: string;
}

export function AddRowButton({
  label,
  onClick,
  disabled = false,
  variant = 'blue',
  className = '',
}: AddRowButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-5 py-3 text-white font-lexend text-[14px] rounded-xl transition-colors font-normal disabled:opacity-50 shadow-lg ${VARIANTS[variant]} ${className}`}>
      <Plus className="w-5 h-5" />
      {label}
    </button>
  );
}