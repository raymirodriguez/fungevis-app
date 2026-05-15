const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'fungevis.db');
const schemaPath = path.join(__dirname, 'schema.sql');

const db = new DatabaseSync(dbPath);

// Run schema
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

// Check if already seeded
const existing = db.prepare('SELECT COUNT(*) as count FROM precios_personal_salud').get();
if (existing.count > 0) {
  console.log('Database already seeded.');
  db.close();
  process.exit(0);
}

// Seed personal salud prices
const insertPrecio = db.prepare(
  'INSERT INTO precios_personal_salud (especialidad, nombre, titulo, precio, afiliado, no_afiliado) VALUES (?, ?, ?, ?, ?, ?)'
);
const personalSaludData = [
  ['Psicología', 'Alexandra Narváez', 'Lic.', 10, 7, 10],
  ['Pediatría', 'Ana Apóstol', 'Dra.', 10, 7, 10],
  ['Cirujano General', 'Ana Briceño', 'Dra.', 10, 7, 10],
  ['Medicina Interna', 'Antonio Franco', 'Dr.', 10, 7, 10],
  ['Medicina General', 'Crisiela Soto', 'Dra.', 10, 7, 10],
  ['Ecografía General', 'Damaris López', 'Dra.', 10, 7, 10],
  ['Otorrinolaringología', 'Gumairy Fernández', 'Dra.', 10, 7, 10],
  ['Oncólogo', 'Indira Mendoza', 'Dra.', 10, 7, 10],
  ['Pediatra', 'Karla Viera', 'Dra.', 10, 7, 10],
  ['Pediatra', 'Kiussy Garcia', 'Lic.', 10, 7, 10],
  ['Ginecología', 'Leissy Ballesteros', 'Dra.', 10, 7, 10],
  ['Fisiatría', 'Lisbeth Chirinos', 'Dra.', 10, 7, 10],
  ['Nefrólogo', 'Lismar Gomes', 'Dra.', 10, 7, 10],
  ['Fisioterapia', 'Lizth Ramírez', 'Dra.', 10, 7, 10],
  ['Cardiología', 'Marcos Pérez', 'Dr.', 10, 7, 10],
  ['Traumatología', 'Maricela Barranco', 'Dra.', 10, 7, 10],
  ['Psicología', 'Marieli Saavedra', 'Lic.', 10, 7, 10],
  ['Odontología', 'Michel Bastidas', 'Dra.', 10, 7, 10],
  ['Diabetología', 'Nieves Cazorla', 'Dra.', 10, 7, 10],
  ['Gerontólogo', 'Richard Medina', 'Lic.', 10, 7, 10],
  ['Anestesiología', 'Tomas Mosquera', 'Dr.', 10, 7, 10],
  ['Neurólogo', 'William Arrieche', 'Dr.', 10, 7, 10],
  ['Psicología', 'Yaser Morales', 'Lic.', 10, 7, 10],
];

db.exec('BEGIN');
for (const row of personalSaludData) insertPrecio.run(...row);
db.exec('COMMIT');

// Seed ecografías
const insertEco = db.prepare(
  'INSERT INTO precios_ecografias (imagen, estudio, precio, pago_10, beneficiario_30) VALUES (?, ?, ?, ?, ?)'
);
const ecoData = [
  ['ECO', 'ECO ABDOMINAL', 10, 9, 7],
  ['ECO', 'ECO PELVICO', 10, 9, 7],
  ['ECO', 'ECO RENAL', 10, 9, 7],
  ['ECO', 'ECO PROSTATICO', 10, 9, 7],
  ['ECO', 'ECO TESTICULAR', 10, 9, 7],
  ['ECO', 'ECO MAMARIO', 10, 9, 7],
  ['ECO', 'ECO TIROIDEO', 10, 9, 7],
  ['ECO', 'ECO CADERAS', 15, 13.5, 10.5],
  ['ECO', 'ECO RODILLAS', 15, 13.5, 10.5],
  ['ECO', 'ECO HOMBROS', 15, 13.5, 10.5],
  ['ECO', 'ECO CODO', 15, 13.5, 10.5],
  ['ECO', 'ECO TOBILLO', 15, 13.5, 10.5],
  ['ECO', 'ECO PARTES BLANDAS', 15, 13.5, 10.5],
  ['ECO', 'ECO PARED ABDOMINAL', 15, 13.5, 10.5],
  ['ECO', 'ECO CUELLO', 15, 13.5, 10.5],
  ['ECO', 'ECO DOPPLER VENOSO ARTERIAL', 15, 13.5, 10.5],
  ['ECO', 'ECO CAROTIDO', 15, 13.5, 10.5],
  ['ECO', 'ECO RENAL DOPPLER', 15, 13.5, 10.5],
  ['BIOPSIAS', 'BIOPSIA MAMARIA', 35, 31.5, 24.5],
  ['BIOPSIAS', 'BIOPSIA CUELLO UTERINO', 35, 31.5, 24.5],
];

db.exec('BEGIN');
for (const row of ecoData) insertEco.run(...row);
db.exec('COMMIT');

// Seed RX
const insertRx = db.prepare(
  'INSERT INTO precios_rx (imagen, estudio, precio, afiliado_30, no_afiliado) VALUES (?, ?, ?, ?, ?)'
);
const rxData = [
  ['RX', 'RX Abdomen Simple', 10, 7, 10],
  ['RX', 'RX Antebrazo', 10, 7, 10],
  ['RX', 'RX Art. Coxo Femoral', 10, 7, 10],
  ['RX', 'RX Art. Sacro-iliacas', 10, 7, 10],
  ['RX', 'RX Art. Temp. Mandibular', 10, 7, 10],
  ['RX', 'RX Calcaneo', 10, 7, 10],
  ['RX', 'RX Cervical', 10, 7, 10],
  ['RX', 'RX Clavícula', 10, 7, 10],
  ['RX', 'RX Codo', 10, 7, 10],
  ['RX', 'RX Columna Cervical', 10, 7, 10],
  ['RX', 'RX Columna Dorsal', 10, 7, 10],
  ['RX', 'RX Columna Lumbar', 10, 7, 10],
  ['RX', 'RX Columna Total', 15, 10.5, 15],
  ['RX', 'RX Cráneo', 10, 7, 10],
  ['RX', 'RX Dedos Mano', 10, 7, 10],
  ['RX', 'RX Dedos Pie', 10, 7, 10],
  ['RX', 'RX Esternón', 10, 7, 10],
  ['RX', 'RX Fémur', 10, 7, 10],
  ['RX', 'RX Húmero', 10, 7, 10],
  ['RX', 'RX Mano', 10, 7, 10],
  ['RX', 'RX Muñeca', 10, 7, 10],
  ['RX', 'RX Pelvis', 10, 7, 10],
  ['RX', 'RX Pie', 10, 7, 10],
  ['RX', 'RX Pierna', 10, 7, 10],
  ['RX', 'RX Rodilla', 10, 7, 10],
  ['RX', 'RX Senos Paranasales', 10, 7, 10],
  ['RX', 'RX Tobillo', 10, 7, 10],
  ['RX', 'RX Tórax', 10, 7, 10],
  ['RX', 'RX Hombro', 10, 7, 10],
  ['RX', 'RX Mastoides', 10, 7, 10],
  ['RX', 'RX Orbitas', 10, 7, 10],
  ['RX', 'RX Riñón Uréter Vejiga', 10, 7, 10],
  ['RX', 'RX Sacro Cóccix', 10, 7, 10],
  ['RX', 'RX Escapula', 10, 7, 10],
  ['RX', 'RX Escanograma', 15, 10.5, 15],
  ['RX', 'RX Peñasco', 10, 7, 10],
  ['RX', 'RX Esófago Contrastado', 15, 10.5, 15],
  ['RX', 'RX Tránsito Intestinal', 20, 14, 20],
  ['RX', 'RX Colon por Enema', 25, 17.5, 25],
  ['RX', 'RX Urografía', 25, 17.5, 25],
];

db.exec('BEGIN');
for (const row of rxData) insertRx.run(...row);
db.exec('COMMIT');

// Seed beneficios por plan
const insertBeneficio = db.prepare(
  'INSERT INTO beneficios_plan (beneficio, fungevis_basico, fungevis_pro, fungevis_total) VALUES (?, ?, ?, ?)'
);
const beneficiosData = [
  ['Consultas Med. Gral', '2', '4', '6'],
  ['Consultas Especialista', '1', '2', '3'],
  ['Descuento Consultas', '30%', '30%', '50%'],
  ['Descuento Lab', '30%', '30%', '30%'],
  ['Electrocardiograma', '1', '2', '3'],
  ['Mapa Holter', '—', '1', '2'],
  ['Ecografías', '0', '30%', '30%'],
  ['Limpieza Odontológica', '—', '1', '—'],
  ['Consulta Domiciliaria', '—', '—', '1'],
  ['RX', '0', '30%', '30%'],
  ['Descuento Odontología', '—', '—', '30%'],
];

db.exec('BEGIN');
for (const row of beneficiosData) insertBeneficio.run(...row);
db.exec('COMMIT');

// Seed one sample service record for testing
const insertServicio = db.prepare(`
  INSERT INTO servicios (fecha_activacion, solicitud_nro, ci_titular, nombres, apellidos,
    fecha_nacimiento, sexo, edo_civil, act_economica, dir_estado, dir_ciudad, dir_municipio,
    dir_parroquia, dir_sector, dir_casa_apto, telefono_hab, tlf_movil, email,
    tipo, plan, num_beneficiarios, adicionales, costo, inscripcion, frec_pago, monto,
    fecha_desde, fecha_hasta)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

insertServicio.run(
  '2024-01-15', '001', 'V-12345678', 'Juan', 'Pérez',
  '1970-05-20', 'Masc', 'Casado', 'Comerciante', 'Lara', 'Barquisimeto', 'Iribarren',
  'Concepción', 'Centro', 'Calle 10 Casa 5', '0251-1234567', '0412-1234567', 'juan@email.com',
  'Familiar', 'Fungevis Pro', 2, 0, 20, 10, 'Mensual', 20,
  '2024-01-15', '2025-01-15'
);

console.log('Database seeded successfully!');
db.close();
