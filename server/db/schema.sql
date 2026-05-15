-- FUNGEVIS Database Schema

CREATE TABLE IF NOT EXISTS servicios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  es_persona_juridica BOOLEAN DEFAULT 0,
  fecha_const_empresa DATE,
  a_economica_empresa TEXT,
  naturaleza_empresa TEXT,
  tipo TEXT,
  plan TEXT,
  num_beneficiarios INTEGER DEFAULT 0,
  adicionales INTEGER DEFAULT 0,
  costo DECIMAL,
  inscripcion DECIMAL DEFAULT 10,
  frec_pago TEXT,
  monto DECIMAL,
  fecha_desde DATE,
  fecha_hasta DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS atencion_paciente (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ci_titular TEXT,
  afiliado BOOLEAN DEFAULT 0,
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS beneficiarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  tiene_huella BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS centros_aliados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rif TEXT,
  fecha DATE,
  nombre TEXT,
  especialidad TEXT,
  estudio TEXT,
  dias_atencion TEXT,
  email TEXT,
  telefono TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cobranzas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ci_titular TEXT,
  monto_cancelar DECIMAL,
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
  monto_inicial_pol DECIMAL,
  frec_pago TEXT,
  cuota_nro INTEGER,
  cuotas_pendientes INTEGER,
  cuotas_atrasadas INTEGER,
  total_deuda DECIMAL,
  saldo_por_pagar DECIMAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS personal_salud (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ci_pers_salud TEXT,
  num_colegio TEXT,
  nombres TEXT,
  apellidos TEXT,
  especialidad TEXT,
  monto_consulta DECIMAL,
  dias_atencion TEXT,
  email TEXT,
  telefono TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS precios_personal_salud (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  especialidad TEXT,
  nombre TEXT,
  titulo TEXT,
  precio DECIMAL,
  afiliado DECIMAL,
  no_afiliado DECIMAL
);

CREATE TABLE IF NOT EXISTS precios_ecografias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  imagen TEXT,
  estudio TEXT,
  precio DECIMAL,
  pago_10 DECIMAL,
  beneficiario_30 DECIMAL
);

CREATE TABLE IF NOT EXISTS precios_rx (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  imagen TEXT,
  estudio TEXT,
  precio DECIMAL,
  afiliado_30 DECIMAL,
  no_afiliado DECIMAL
);

CREATE TABLE IF NOT EXISTS beneficios_plan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  beneficio TEXT,
  fungevis_basico TEXT,
  fungevis_pro TEXT,
  fungevis_total TEXT
);
