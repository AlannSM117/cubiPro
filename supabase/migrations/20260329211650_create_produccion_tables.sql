/*
  # Sistema de Producción - Tablas de madera en tabla

  1. Nuevas Tablas
    - `entradas_produccion`
      - `id` (uuid, primary key)
      - `folio` (text, único)
      - `fecha` (timestamptz)
      - `turno` (text)
      - `aserradero` (integer)
      - `volumen_producido` (numeric)
      - `total_piezas` (integer)
      - `pies_tabla` (numeric)
      - `created_at` (timestamptz)
    
    - `piezas_produccion`
      - `id` (uuid, primary key)
      - `entrada_id` (uuid, foreign key)
      - `grueso` (integer)
      - `clase` (text)
      - `ancho` (numeric)
      - `largo` (numeric)
      - `verde` (integer)
      - `estufa` (integer)
      - `pies_tabla` (numeric)
      - `volumen_m3` (numeric)
      - `created_at` (timestamptz)

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas para usuarios autenticados
*/

-- Tabla de entradas de producción
CREATE TABLE IF NOT EXISTS entradas_produccion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folio text UNIQUE NOT NULL,
  fecha timestamptz NOT NULL DEFAULT now(),
  turno text NOT NULL,
  aserradero integer NOT NULL,
  volumen_producido numeric(10,2) DEFAULT 0,
  total_piezas integer DEFAULT 0,
  pies_tabla numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE entradas_produccion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver todas las entradas de producción"
  ON entradas_produccion FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios pueden crear entradas de producción"
  ON entradas_produccion FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios pueden actualizar entradas de producción"
  ON entradas_produccion FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios pueden eliminar entradas de producción"
  ON entradas_produccion FOR DELETE
  TO authenticated
  USING (true);

-- Tabla de piezas de producción
CREATE TABLE IF NOT EXISTS piezas_produccion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entrada_id uuid REFERENCES entradas_produccion(id) ON DELETE CASCADE,
  grueso integer NOT NULL DEFAULT 0,
  clase text NOT NULL DEFAULT '2-5',
  ancho numeric(10,2) DEFAULT 0,
  largo numeric(10,2) DEFAULT 0,
  verde integer DEFAULT 0,
  estufa integer DEFAULT 0,
  pies_tabla numeric(10,2) DEFAULT 0,
  volumen_m3 numeric(10,3) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE piezas_produccion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver todas las piezas"
  ON piezas_produccion FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios pueden crear piezas"
  ON piezas_produccion FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios pueden actualizar piezas"
  ON piezas_produccion FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios pueden eliminar piezas"
  ON piezas_produccion FOR DELETE
  TO authenticated
  USING (true);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_entradas_produccion_fecha ON entradas_produccion(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_piezas_produccion_entrada ON piezas_produccion(entrada_id);