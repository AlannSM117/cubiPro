import { LucideIcon, X } from 'lucide-react';

interface ModalHeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  onClose: () => void;
  variant?: 'gradient' | 'solid';
}

export function ModalHeader({
  title,
  subtitle,
  icon: Icon,
  onClose,
  variant = 'solid',
}: ModalHeaderProps) {
  const bg = variant === 'gradient'
    ? 'bg-gradient-to-r from-[#1a4a3a] to-[#0A2C25]'
    : 'bg-[#0A2C25]';

  return (
    <div className={`flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 text-white ${bg}`}>
      <div className="flex items-center gap-3">
        {variant === 'gradient' ? (
          <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-white" />
          </div>
        ) : (
          <Icon className="hidden sm:block w-5 h-5 text-white/70 flex-shrink-0" />
        )}
        <div>
          <p className="font-lexend font-medium text-[14px] sm:text-[15px]">{title}</p>
          <p className="font-lexend text-white/60 text-[10px] sm:text-[12px]">{subtitle}</p>
        </div>
      </div>

      {/* X integrada directamente, sin componente separado */}
      <button
        onClick={onClose}
        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0">
        <X className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}