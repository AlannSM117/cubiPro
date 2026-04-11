'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

interface NewEntryButtonProps {
  href: string;
  label?: string;
}

export function NewEntryButton({ href, label = 'Nueva entrada' }: NewEntryButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(href)}
      className="w-full sm:w-auto mb-6 flex justify-center gap-2 px-6 py-3 bg-[#3786E6] text-white font-lexend rounded-xl hover:bg-[#0956B6] transition-colors font-normal text-[14px] shadow-lg shadow-blue-500/20">
      <Plus className="w-5 h-5" />
      {label}
    </button>
  );
}