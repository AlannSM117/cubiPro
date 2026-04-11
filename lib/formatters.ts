//Parsers
/** Parsea un número, devuelve 0 si es NaN */
export function parseNum(v: string | number): number {
  const n = parseFloat(String(v));
  return isNaN(n) ? 0 : n;
}

/** Parsea fracciones tipo "1 1/2" o "3/4" */
export function parseFraction(val: string): number {
  if (!val) return 0;
  try {
    const parts = val.trim().split(' ');
    if (parts.length === 2) {
      const whole = parseFloat(parts[0]);
      const [num, den] = parts[1].split('/');
      return whole + parseFloat(num) / parseFloat(den);
    }
    if (val.includes('/')) {
      const [num, den] = val.split('/');
      return parseFloat(num) / parseFloat(den);
    }
    return parseFloat(val) || 0;
  } catch {
    return 0;
  }
}

//Formatters de fecha
/** "10/04/2026" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
  );
}

/** "14:30" */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    }
  );
}

/** "10/04/2026 - 14:30" */
export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} - ${formatTime(iso)}`;
}

/** Corrige offset de zona horaria para fechas sin hora (YYYY-MM-DD) */
export function correctTimezoneDate(val: string): Date {
  const d = new Date(val);
  return new Date(d.getTime() + Math.abs(d.getTimezoneOffset() * 60000));
}

//Constantes compartidas
export const TURNO_ASERRADERO: Record<string, number> = {
  Matutino: 1,
  Vespertino: 2,
  Nocturno: 3,
};

export const CLASE_LABEL: Record<string, string> = {
  '1': 'Primario',
  '2': 'Secundario',
};