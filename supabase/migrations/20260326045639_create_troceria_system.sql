/*
  # Sistema de Trocería - Base de datos completa

  1. Nuevas Tablas
    - `entradas_troceria`
      - `id` (uuid, primary key)
      - `folio` (text, único)
      - `fecha` (timestamptz)
      - `turno` (text)
      - `aserradero` (integer)
      - `volumen_final` (numeric)
      - `total_trozas` (integer)
      - `created_at` (timestamptz)
      - `user_id` (uuid)
    
    - `trozas`
      - `id` (uuid, primary key)
      - `entrada_id` (uuid, foreign key)
      - `origen` (text)
      - `diametro_1` (numeric)
      - `diametro_2` (numeric)
      - `largo` (numeric)
      - `clase` (text)
      - `volumen_m3` (numeric)
      - `descuento_porcentaje` (numeric)
      - `volumen_total` (numeric)
      - `created_at` (timestamptz)

    - `produccion_diaria`
      - `id` (uuid, primary key)
      - `fecha` (date)
      - `volumen_ingresado` (numeric)
      - `volumen_producido` (numeric)
      - `created_at` (timestamptz)

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas para usuarios autenticados
*/

-- Tabla de entradas de trocería
CREATE TABLE IF NOT EXISTS entradas_troceria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folio text UNIQUE NOT NULL,
  fecha timestamptz NOT NULL DEFAULT now(),
  turno text NOT NULL,
  aserradero integer NOT NULL,
  volumen_final numeric(10,2) DEFAULT 0,
  total_trozas integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  user_id uuid
);

ALTER TABLE entradas_troceria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver todas las entradas"
  ON entradas_troceria FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios pueden crear entradas"
  ON entradas_troceria FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios pueden actualizar entradas"
  ON entradas_troceria FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios pueden eliminar entradas"
  ON entradas_troceria FOR DELETE
  TO authenticated
  USING (true);

-- Tabla de trozas
CREATE TABLE IF NOT EXISTS trozas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entrada_id uuid REFERENCES entradas_troceria(id) ON DELETE CASCADE,
  origen text NOT NULL DEFAULT 'Origen',
  diametro_1 numeric(10,2) DEFAULT 0,
  diametro_2 numeric(10,2) DEFAULT 0,
  largo numeric(10,2) DEFAULT 0,
  clase text NOT NULL DEFAULT 'Clase',
  volumen_m3 numeric(10,3) DEFAULT 0,
  descuento_porcentaje numeric(5,2) DEFAULT 0,
  volumen_total numeric(10,3) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trozas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver todas las trozas"
  ON trozas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios pueden crear trozas"
  ON trozas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios pueden actualizar trozas"
  ON trozas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios pueden eliminar trozas"
  ON trozas FOR DELETE
  TO authenticated
  USING (true);

-- Tabla de producción diaria
CREATE TABLE IF NOT EXISTS produccion_diaria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha date NOT NULL,
  volumen_ingresado numeric(10,2) DEFAULT 0,
  volumen_producido numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(fecha)
);

ALTER TABLE produccion_diaria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver producción diaria"
  ON produccion_diaria FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios pueden crear producción diaria"
  ON produccion_diaria FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios pueden actualizar producción diaria"
  ON produccion_diaria FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_entradas_fecha ON entradas_troceria(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_trozas_entrada ON trozas(entrada_id);
CREATE INDEX IF NOT EXISTS idx_produccion_fecha ON produccion_diaria(fecha DESC);