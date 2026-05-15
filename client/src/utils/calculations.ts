// Pricing tables
const MENSUALIDAD: Record<string, Record<string, number>> = {
  'Fungevis Básico': { 'Unipersonal': 10, 'Familiar': 15 },
  'Fungevis Pro':    { 'Unipersonal': 15, 'Familiar': 20 },
  'Fungevis Total':  { 'Unipersonal': 20, 'Familiar': 25 },
};

// Annual prima amounts by plan/tipo/frecuencia
// [Anual, Trimestral, Semestral] for Unipersonal then Familiar
const PRIMA: Record<string, Record<string, Record<string, number>>> = {
  'Fungevis Básico': {
    'Unipersonal': { 'Anual': 130, 'Trimestral': 32.50, 'Semestral': 65, 'Mensual': 10 },
    'Familiar':    { 'Anual': 190, 'Trimestral': 47.50, 'Semestral': 95, 'Mensual': 15 },
  },
  'Fungevis Pro': {
    'Unipersonal': { 'Anual': 190, 'Trimestral': 47.50, 'Semestral': 95, 'Mensual': 15 },
    'Familiar':    { 'Anual': 250, 'Trimestral': 62.50, 'Semestral': 125, 'Mensual': 20 },
  },
  'Fungevis Total': {
    'Unipersonal': { 'Anual': 250, 'Trimestral': 62.50, 'Semestral': 125, 'Mensual': 20 },
    'Familiar':    { 'Anual': 310, 'Trimestral': 77.50, 'Semestral': 155, 'Mensual': 25 },
  },
};

export function calcCosto(plan: string, tipo: string): number {
  return MENSUALIDAD[plan]?.[tipo] ?? 0;
}

export function calcMonto(plan: string, tipo: string, frecPago: string): number {
  return PRIMA[plan]?.[tipo]?.[frecPago] ?? 0;
}

export function calcFechaHasta(fechaDesde: string): string {
  if (!fechaDesde) return '';
  const d = new Date(fechaDesde);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
}

export function calcVigencia(fechaHasta: string): string {
  if (!fechaHasta) return '#¡VALOR!';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const hasta = new Date(fechaHasta);
  const diff = Math.floor((hasta.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'VENCIDA';
  return `${diff} días restantes`;
}

export function formatCurrency(val: number | string | undefined): string {
  if (val === undefined || val === null || val === '') return '$ 0.00';
  return `$ ${Number(val).toFixed(2)}`;
}

export function formatDateDisplay(isoDate: string): string {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

export function isoToInput(isoDate: string): string {
  return isoDate ? isoDate.split('T')[0] : '';
}
