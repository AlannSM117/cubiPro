import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type EntradaTroceria = {
  id: string;
  folio: string;
  fecha: string;
  turno: string;
  aserradero: number;
  volumen_final: number;
  total_trozas: number;
  created_at: string;
  user_id: string | null;
};

export type Troza = {
  id: string;
  entrada_id: string;
  origen: string;
  diametro_1: number;
  diametro_2: number;
  largo: number;
  clase: string;
  volumen_m3: number;
  descuento_porcentaje: number;
  volumen_total: number;
  created_at: string;
};

export type ProduccionDiaria = {
  id: string;
  fecha: string;
  volumen_ingresado: number;
  volumen_producido: number;
  created_at: string;
};
