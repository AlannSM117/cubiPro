'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  href: string;
  label: string;
}

export function BackButton({ href, label }: BackButtonProps) {
  const router = useRouter();

  return (
    <button onClick={() => router.push(href)} className="flex items-center gap-2 text-[#839590] hover:text-[#0A2C25] mb-6 transition-colors">
      <ArrowLeft className="w-5 h-5" />
      <span className="text-sm font-lexend font-normal">{label}</span>
    </button>
  );
}