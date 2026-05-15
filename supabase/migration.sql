-- ============================================================
-- FUNGEVIS — Supabase Migration
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS servicios (
  id BIGSERIAL PRIMARY KEY,
  fecha_activacion DATE NOT NULL,
  solicitud_nro TEXT,
  ci_titular TEXT NOT NULL,
  nombres TEXT,
  apellidos TEXT,
  fecha_nacimiento DATE,
  sexo TEXT,
  edo_civil TEXT,
  act_economica TEXT,
  dir_estado TEXT,
  dir_ciudad TEXT,
  dir_municipio TEXT,
  dir_parroquia TEXT,
  dir_sector TEXT,
  dir_casa_apto TEXT,
  telefono_hab TEXT,
  telefono_ofic TEXT,
  tlf_movil TEXT,
  email TEXT,
  fax TEXT,
  es_persona_juridica BOOLEAN DEFAULT false,
  fecha_const_empresa DATE,
  a_economica_empresa TEXT,
  naturaleza_empresa TEXT,
  tipo TEXT,
  plan TEXT,
  num_beneficiarios INTEGER DEFAULT 0,
  adicionales INTEGER DEFAULT 0,
  costo NUMERIC,
  inscripcion NUMERIC DEFAULT 10,
  frec_pago TEXT,
  monto NUMERIC,
  fecha_desde DATE,
  fecha_hasta DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS atencion_paciente (
  id BIGSERIAL PRIMARY KEY,
  ci_titular TEXT,
  afiliado BOOLEAN DEFAULT false,
  solicitud_nro TEXT,
  fecha_afiliacion DATE,
  tipo TEXT,
  plan TEXT,
  nombres TEXT,
  apellidos TEXT,
  dir_estado TEXT,
  dir_ciudad TEXT,
  dir_municipio TEXT,
  dir_parroquia TEXT,
  dir_sector TEXT,
  dir_casa_apto TEXT,
  telefono_hab TEXT,
  telefono_ofic TEXT,
  tlf_movil TEXT,
  email TEXT,
  fax TEXT DEFAULT '(0212) 261 4022',
  num_beneficiarios INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS beneficiarios (
  id BIGSERIAL PRIMARY KEY,
  ci_titular TEXT,
  ci_beneficiario TEXT,
  num_benef TEXT,
  nombres TEXT,
  apellidos TEXT,
  fecha_nacimiento DATE,
  sexo TEXT,
  edo_civil TEXT,
  enfermedad_preexistente TEXT,
  dir_estado TEXT,
  dir_ciudad TEXT,
  dir_municipio TEXT,
  dir_parroquia TEXT,
  dir_sector TEXT,
  dir_casa_apto TEXT,
  telefono_hab TEXT,
  telefono_ofic TEXT,
  tlf_movil TEXT,
  email TEXT,
  fax TEXT,
  tiene_huella BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS centros_aliados (
  id BIGSERIAL PRIMARY KEY,
  rif TEXT,
  fecha DATE,
  nombre TEXT,
  especialidad TEXT,
  estudio TEXT,
  dias_atencion TEXT,
  email TEXT,
  telefono TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cobranzas (
  id BIGSERIAL PRIMARY KEY,
  ci_titular TEXT,
  monto_cancelar NUMERIC,
  solicitud_nro TEXT,
  fecha_afiliacion DATE,
  tipo TEXT,
  plan TEXT,
  nombres TEXT,
  apellidos TEXT,
  dir_estado TEXT,
  dir_ciudad TEXT,
  dir_municipio TEXT,
  dir_parroquia TEXT,
  dir_sector TEXT,
  dir_casa_apto TEXT,
  telefono_hab TEXT,
  telefono_ofic TEXT,
  tlf_movil TEXT,
  email TEXT,
  fax TEXT DEFAULT '(0212) 261 4022',
  num_beneficiarios INTEGER,
  fecha_desde DATE,
  fecha_hasta DATE,
  vigencia TEXT,
  monto_inicial_pol NUMERIC,
  frec_pago TEXT,
  cuota_nro INTEGER,
  cuotas_pendientes INTEGER,
  cuotas_atrasadas INTEGER,
  total_deuda NUMERIC,
  saldo_por_pagar NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS personal_salud (
  id BIGSERIAL PRIMARY KEY,
  ci_pers_salud TEXT,
  num_colegio TEXT,
  nombres TEXT,
  apellidos TEXT,
  especialidad TEXT,
  monto_consulta NUMERIC,
  dias_atencion TEXT,
  email TEXT,
  telefono TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS precios_personal_salud (
  id BIGSERIAL PRIMARY KEY,
  especialidad TEXT,
  nombre TEXT,
  titulo TEXT,
  precio NUMERIC,
  afiliado NUMERIC,
  no_afiliado NUMERIC
);

CREATE TABLE IF NOT EXISTS precios_ecografias (
  id BIGSERIAL PRIMARY KEY,
  imagen TEXT,
  estudio TEXT,
  precio NUMERIC,
  pago_10 NUMERIC,
  beneficiario_30 NUMERIC
);

CREATE TABLE IF NOT EXISTS precios_rx (
  id BIGSERIAL PRIMARY KEY,
  imagen TEXT,
  estudio TEXT,
  precio NUMERIC,
  afiliado_30 NUMERIC,
  no_afiliado NUMERIC
);

CREATE TABLE IF NOT EXISTS beneficios_plan (
  id BIGSERIAL PRIMARY KEY,
  beneficio TEXT,
  fungevis_basico TEXT,
  fungevis_pro TEXT,
  fungevis_total TEXT
);

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────

ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE atencion_paciente ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE centros_aliados ENABLE ROW LEVEL SECURITY;
ALTER TABLE cobranzas ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_salud ENABLE ROW LEVEL SECURITY;
ALTER TABLE precios_personal_salud ENABLE ROW LEVEL SECURITY;
ALTER TABLE precios_ecografias ENABLE ROW LEVEL SECURITY;
ALTER TABLE precios_rx ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficios_plan ENABLE ROW LEVEL SECURITY;

-- All tables: authenticated users have full access
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'servicios','atencion_paciente','beneficiarios','centros_aliados',
    'cobranzas','personal_salud','precios_personal_salud',
    'precios_ecografias','precios_rx','beneficios_plan'
  ]
  LOOP
    EXECUTE format('CREATE POLICY "auth_all_%s" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', tbl, tbl);
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────
-- SEED DATA — Personal de Salud Prices
-- ─────────────────────────────────────────────────────────────

INSERT INTO precios_personal_salud (especialidad, nombre, titulo, precio, afiliado, no_afiliado) VALUES
  ('Psicología',           'Alexandra Narváez',  'Lic.', 10, 7, 10),
  ('Pediatría',            'Ana Apóstol',         'Dra.', 10, 7, 10),
  ('Cirujano General',     'Ana Briceño',         'Dra.', 10, 7, 10),
  ('Medicina Interna',     'Antonio Franco',      'Dr.',  10, 7, 10),
  ('Medicina General',     'Crisiela Soto',       'Dra.', 10, 7, 10),
  ('Ecografía General',    'Damaris López',       'Dra.', 10, 7, 10),
  ('Otorrinolaringología', 'Gumairy Fernández',   'Dra.', 10, 7, 10),
  ('Oncólogo',             'Indira Mendoza',      'Dra.', 10, 7, 10),
  ('Pediatra',             'Karla Viera',         'Dra.', 10, 7, 10),
  ('Pediatra',             'Kiussy Garcia',       'Lic.', 10, 7, 10),
  ('Ginecología',          'Leissy Ballesteros',  'Dra.', 10, 7, 10),
  ('Fisiatría',            'Lisbeth Chirinos',    'Dra.', 10, 7, 10),
  ('Nefrólogo',            'Lismar Gomes',        'Dra.', 10, 7, 10),
  ('Fisioterapia',         'Lizth Ramírez',       'Dra.', 10, 7, 10),
  ('Cardiología',          'Marcos Pérez',        'Dr.',  10, 7, 10),
  ('Traumatología',        'Maricela Barranco',   'Dra.', 10, 7, 10),
  ('Psicología',           'Marieli Saavedra',    'Lic.', 10, 7, 10),
  ('Odontología',          'Michel Bastidas',     'Dra.', 10, 7, 10),
  ('Diabetología',         'Nieves Cazorla',      'Dra.', 10, 7, 10),
  ('Gerontólogo',          'Richard Medina',      'Lic.', 10, 7, 10),
  ('Anestesiología',       'Tomas Mosquera',      'Dr.',  10, 7, 10),
  ('Neurólogo',            'William Arrieche',    'Dr.',  10, 7, 10),
  ('Psicología',           'Yaser Morales',       'Lic.', 10, 7, 10);

-- ─────────────────────────────────────────────────────────────
-- SEED DATA — Ecografías
-- ─────────────────────────────────────────────────────────────

INSERT INTO precios_ecografias (imagen, estudio, precio, pago_10, beneficiario_30) VALUES
  ('ECO', 'ECO ABDOMINAL',           10, 9,    7),
  ('ECO', 'ECO PELVICO',             10, 9,    7),
  ('ECO', 'ECO RENAL',               10, 9,    7),
  ('ECO', 'ECO PROSTATICO',          10, 9,    7),
  ('ECO', 'ECO TESTICULAR',          10, 9,    7),
  ('ECO', 'ECO MAMARIO',             10, 9,    7),
  ('ECO', 'ECO TIROIDEO',            10, 9,    7),
  ('ECO', 'ECO CADERAS',             15, 13.5, 10.5),
  ('ECO', 'ECO RODILLAS',            15, 13.5, 10.5),
  ('ECO', 'ECO HOMBROS',             15, 13.5, 10.5),
  ('ECO', 'ECO CODO',                15, 13.5, 10.5),
  ('ECO', 'ECO TOBILLO',             15, 13.5, 10.5),
  ('ECO', 'ECO PARTES BLANDAS',      15, 13.5, 10.5),
  ('ECO', 'ECO PARED ABDOMINAL',     15, 13.5, 10.5),
  ('ECO', 'ECO CUELLO',              15, 13.5, 10.5),
  ('ECO', 'ECO DOPPLER VENOSO ARTERIAL', 15, 13.5, 10.5),
  ('ECO', 'ECO CAROTIDO',            15, 13.5, 10.5),
  ('ECO', 'ECO RENAL DOPPLER',       15, 13.5, 10.5),
  ('BIOPSIAS', 'BIOPSIA MAMARIA',        35, 31.5, 24.5),
  ('BIOPSIAS', 'BIOPSIA CUELLO UTERINO', 35, 31.5, 24.5);

-- ─────────────────────────────────────────────────────────────
-- SEED DATA — Radiología RX
-- ─────────────────────────────────────────────────────────────

INSERT INTO precios_rx (imagen, estudio, precio, afiliado_30, no_afiliado) VALUES
  ('RX', 'RX Abdomen Simple',        10, 7,    10),
  ('RX', 'RX Antebrazo',             10, 7,    10),
  ('RX', 'RX Art. Coxo Femoral',     10, 7,    10),
  ('RX', 'RX Art. Sacro-iliacas',    10, 7,    10),
  ('RX', 'RX Art. Temp. Mandibular', 10, 7,    10),
  ('RX', 'RX Calcaneo',              10, 7,    10),
  ('RX', 'RX Cervical',              10, 7,    10),
  ('RX', 'RX Clavícula',             10, 7,    10),
  ('RX', 'RX Codo',                  10, 7,    10),
  ('RX', 'RX Columna Cervical',      10, 7,    10),
  ('RX', 'RX Columna Dorsal',        10, 7,    10),
  ('RX', 'RX Columna Lumbar',        10, 7,    10),
  ('RX', 'RX Columna Total',         15, 10.5, 15),
  ('RX', 'RX Cráneo',                10, 7,    10),
  ('RX', 'RX Dedos Mano',            10, 7,    10),
  ('RX', 'RX Dedos Pie',             10, 7,    10),
  ('RX', 'RX Esternón',              10, 7,    10),
  ('RX', 'RX Fémur',                 10, 7,    10),
  ('RX', 'RX Húmero',                10, 7,    10),
  ('RX', 'RX Mano',                  10, 7,    10),
  ('RX', 'RX Muñeca',                10, 7,    10),
  ('RX', 'RX Pelvis',                10, 7,    10),
  ('RX', 'RX Pie',                   10, 7,    10),
  ('RX', 'RX Pierna',                10, 7,    10),
  ('RX', 'RX Rodilla',               10, 7,    10),
  ('RX', 'RX Senos Paranasales',     10, 7,    10),
  ('RX', 'RX Tobillo',               10, 7,    10),
  ('RX', 'RX Tórax',                 10, 7,    10),
  ('RX', 'RX Hombro',                10, 7,    10),
  ('RX', 'RX Mastoides',             10, 7,    10),
  ('RX', 'RX Orbitas',               10, 7,    10),
  ('RX', 'RX Riñón Uréter Vejiga',   10, 7,    10),
  ('RX', 'RX Sacro Cóccix',          10, 7,    10),
  ('RX', 'RX Escapula',              10, 7,    10),
  ('RX', 'RX Escanograma',           15, 10.5, 15),
  ('RX', 'RX Peñasco',               10, 7,    10),
  ('RX', 'RX Esófago Contrastado',   15, 10.5, 15),
  ('RX', 'RX Tránsito Intestinal',   20, 14,   20),
  ('RX', 'RX Colon por Enema',       25, 17.5, 25),
  ('RX', 'RX Urografía',             25, 17.5, 25);

-- ─────────────────────────────────────────────────────────────
-- SEED DATA — Beneficios por Plan
-- ─────────────────────────────────────────────────────────────

INSERT INTO beneficios_plan (beneficio, fungevis_basico, fungevis_pro, fungevis_total) VALUES
  ('Consultas Med. Gral',    '2',   '4',   '6'),
  ('Consultas Especialista', '1',   '2',   '3'),
  ('Descuento Consultas',    '30%', '30%', '50%'),
  ('Descuento Lab',          '30%', '30%', '30%'),
  ('Electrocardiograma',     '1',   '2',   '3'),
  ('Mapa Holter',            '—',   '1',   '2'),
  ('Ecografías',             '0',   '30%', '30%'),
  ('Limpieza Odontológica',  '—',   '1',   '—'),
  ('Consulta Domiciliaria',  '—',   '—',   '1'),
  ('RX',                     '0',   '30%', '30%'),
  ('Descuento Odontología',  '—',   '—',   '30%');

-- ─────────────────────────────────────────────────────────────
-- SEED DATA — Sample service record for testing
-- ─────────────────────────────────────────────────────────────

INSERT INTO servicios (
  fecha_activacion, solicitud_nro, ci_titular, nombres, apellidos,
  fecha_nacimiento, sexo, edo_civil, act_economica,
  dir_estado, dir_ciudad, dir_municipio, dir_parroquia, dir_sector, dir_casa_apto,
  telefono_hab, tlf_movil, email,
  tipo, plan, num_beneficiarios, adicionales, costo, inscripcion,
  frec_pago, monto, fecha_desde, fecha_hasta
) VALUES (
  '2024-01-15', '001', 'V-12345678', 'Juan', 'Pérez',
  '1970-05-20', 'Masc', 'Casado', 'Comerciante',
  'Lara', 'Barquisimeto', 'Iribarren', 'Concepción', 'Centro', 'Calle 10 Casa 5',
  '0251-1234567', '0412-1234567', 'juan@email.com',
  'Familiar', 'Fungevis Pro', 2, 0, 20, 10,
  'Mensual', 20, '2024-01-15', '2025-01-15'
);
