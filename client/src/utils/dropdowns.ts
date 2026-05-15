export const SEXO_OPTIONS = ['Masc', 'Fem'];

export const EDO_CIVIL_OPTIONS = [
  'Soltero', 'Soltera', 'Casado', 'Casada',
  'Divorciado', 'Divorciada', 'Viudo', 'Viuda', 'Otro',
];

export const TIPO_OPTIONS = ['Unipersonal', 'Familiar'];

export const PLAN_OPTIONS = ['Fungevis Básico', 'Fungevis Pro', 'Fungevis Total'];

export const FREC_PAGO_OPTIONS = ['Mensual', 'Trimestral', 'Semestral', 'Anual'];

export const ESPECIALIDAD_OPTIONS = [
  'Psicología', 'Pediatría', 'Cirujano General', 'Medicina Interna',
  'Medicina General', 'Ecografía General', 'Otorrinolaringología',
  'Oncólogo', 'Ginecología', 'Fisiatría', 'Nefrólogo', 'Fisioterapia',
  'Cardiología', 'Traumatología', 'Odontología', 'Diabetología',
  'Gerontólogo', 'Anestesiología', 'Neurólogo',
];

export const CIUDAD_MUNICIPIO: Record<string, string> = {
  'Barquisimeto': 'Iribarren',
  'Cabudare': 'Palavecino',
  'Carora': 'Torres',
  'Duaca': 'Crespo',
  'Quíbor': 'Jiménez',
  'Sanare': 'A_E_Blanco',
  'Sarare': 'S_Planas',
  'Siquisique': 'Urdaneta',
  'Tocuyo': 'Morán',
};

export const CIUDAD_OPTIONS = Object.keys(CIUDAD_MUNICIPIO);
