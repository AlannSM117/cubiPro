import { ChevronRight } from 'lucide-react';

interface ViewDetailButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

export function ViewDetailButton({ label, onClick, className = '' }: ViewDetailButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0A2C25] text-white font-lexend text-[13px] rounded-xl hover:bg-[#1a4a3a] transition-colors ${className}`}>
      <ChevronRight className="w-4 h-4" />
      {label}
    </button>
  );
}