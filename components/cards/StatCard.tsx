import { LucideIcon } from 'lucide-react';

const VARIANTS = {
  blue:   { bg: 'bg-blue-50',   icon: 'text-[#3786E6]', value: 'text-[#3786E6]' },
  green:  { bg: 'bg-green-50',  icon: 'text-[#09934D]', value: 'text-[#09934D]' },
  orange: { bg: 'bg-orange-50', icon: 'text-[#C4670B]', value: 'text-[#C4670B]' },
  purple: { bg: 'bg-purple-50', icon: 'text-[#BD37E6]', value: 'text-[#BD37E6]' },
  gray:   { bg: 'bg-gray-100',  icon: 'text-[#4b5563]', value: 'text-[#0A2C25]' },
} as const;

export type StatCardVariant = keyof typeof VARIANTS;

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: StatCardVariant;
  suffix?: string;
  valueClassName?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  variant = 'blue',
  suffix,
  valueClassName,
}: StatCardProps) {
  const colors = VARIANTS[variant];

  return (
    <div className="bg-white rounded-[20px] p-3 shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
      <div className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-8 h-8 ${colors.icon}`} />
      </div>

      <div className="flex flex-col justify-center min-w-0">
        <p className="font-lexend font-medium text-[12px] text-[#0A2C25] uppercase tracking-wider mb-1.5 leading-tight">
          {label}
        </p>

        {/* valueClassName sobreescribe el tamaño por defecto cuando se necesita */}
        <p className={`font-lexend font-normal leading-none ${colors.value} ${valueClassName ?? 'text-[25px]'}`}>
          {value}
          {suffix && <span className="text-xl ml-1">{suffix}</span>}
        </p>
      </div>
    </div>
  );
}