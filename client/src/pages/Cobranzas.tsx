import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../utils/supabase';
import FungevisHeader from '../components/FungevisHeader';
import FormButtons from '../components/FormButtons';
import CILookup from '../components/CILookup';
import { calcVigencia, formatCurrency, isoToInput } from '../utils/calculations';

const EMPTY = {
  ci_titular: '', monto_cancelar: 0, solicitud_nro: '', fecha_afiliacion: '',
  tipo: '', plan: '', nombres: '', apellidos: '',
  dir_estado: '', dir_ciudad: '', dir_municipio: '', dir_parroquia: '', dir_sector: '', dir_casa_apto: '',
  telefono_hab: '', telefono_ofic: '', tlf_movil: '', email: '', fax: '(0212) 261 4022',
  num_beneficiarios: 0, fecha_desde: '', fecha_hasta: '', vigencia: '',
  monto_inicial_pol: 0, frec_pago: '', cuota_nro: 0,
  cuotas_pendientes: 0, cuotas_atrasadas: 0, total_deuda: 0, saldo_por_pagar: 0,
};
type CobranzaRecord = typeof EMPTY & { id?: number };

export default function Cobranzas() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [records, setRecords] = useState<CobranzaRecord[]>([]);
  const [form, setForm] = useState<CobranzaRecord>({ ...EMPTY });
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const fetchRecords = async () => {
    let query = supabase.from('cobranzas').select('*').order('created_at', { ascending: false }).limit(200);
    if (search) query = query.or(`ci_titular.ilike.%${search}%,nombres.ilike.%${search}%,apellidos.ilike.%${search}%`);
    const { data, error } = await query;
    if (error) toast.error('Error al cargar registros');
    else setRecords((data ?? []) as CobranzaRecord[]);
  };

  useEffect(() => { fetchRecords(); }, [search]);

  const setField = (key: string, val: string | number) => setForm(prev => ({ ...prev, [key]: val }));

  const handleCIFound = (data: Record<string, unknown>) => {
    const fechaDesde = isoToInput(String(data.fecha_desde ?? ''));
    const fechaHasta = isoToInput(String(data.fecha_hasta ?? ''));
    setForm(prev => ({
      ...prev,
      solicitud_nro: String(data.solicitud_nro ?? ''),
      fecha_afiliacion: isoToInput(String(data.fecha_activacion ?? '')),
      tipo: String(data.tipo ?? ''), plan: String(data.plan ?? ''),
      nombres: String(data.nombres ?? ''), apellidos: String(data.apellidos ?? ''),
      dir_estado: String(data.dir_estado ?? ''), dir_ciudad: String(data.dir_ciudad ?? ''),
      dir_municipio: String(data.dir_municipio ?? ''), dir_parroquia: String(data.dir_parroquia ?? ''),
      dir_sector: String(data.dir_sector ?? ''), dir_casa_apto: String(data.dir_casa_apto ?? ''),
      telefono_hab: String(data.telefono_hab ?? ''), telefono_ofic: String(data.telefono_ofic ?? ''),
      tlf_movil: String(data.tlf_movil ?? ''), email: String(data.email ?? ''),
      num_beneficiarios: Number(data.num_beneficiarios ?? 0),
      fecha_desde: fechaDesde, fecha_hasta: fechaHasta,
      vigencia: calcVigencia(fechaHasta),
      monto_inicial_pol: Number(data.monto ?? 0),
      frec_pago: String(data.frec_pago ?? ''),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      delete payload.id;
      for (const k of ['fecha_afiliacion','fecha_desde','fecha_hasta']) {
        if (!payload[k]) payload[k] = null;
      }
      if (form.id) {
        const { error } = await supabase.from('cobranzas').update(payload).eq('id', form.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('cobranzas').insert(payload).select().single();
        if (error) throw error;
        setForm(prev => ({ ...prev, id: (data as CobranzaRecord).id }));
      }
      toast.success('Registro guardado exitosamente');
      fetchRecords();
    } catch { toast.error('Error al guardar el registro'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    const { error } = await supabase.from('cobranzas').delete().eq('id', form.id);
    if (error) { toast.error('Error al eliminar el registro'); return; }
    toast.success('Registro eliminado');
    setForm({ ...EMPTY }); setView('list'); fetchRecords();
  };

  const paginated = records.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const vigenciaDisplay = form.fecha_hasta ? calcVigencia(form.fecha_hasta) : (form.vigencia || '#¡VALOR!');

  if (view === 'list') {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-primary">Cobranzas</h1>
          <button onClick={() => { setForm({ ...EMPTY }); setView('form'); }} className="btn-action text-sm">+ Nuevo Registro</button>
        </div>
        <div className="card">
          <input type="text" placeholder="Buscar por C.I...." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="form-input mb-4 max-w-sm" />
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-100 text-xs uppercase text-gray-600"><th className="text-left p-2">C.I.</th><th className="text-left p-2">Nombres</th><th className="text-left p-2">Plan</th><th className="text-left p-2">Monto a Cancelar</th><th className="text-left p-2">Saldo</th></tr></thead>
            <tbody>
              {paginated.map(r => (
                <tr key={r.id} onClick={() => { setForm({ ...r }); setView('form'); }} className="border-t hover:bg-green-50 cursor-pointer">
                  <td className="p-2 font-mono">{r.ci_titular}</td><td className="p-2">{r.nombres} {r.apellidos}</td><td className="p-2">{r.plan}</td><td className="p-2">{formatCurrency(r.monto_cancelar)}</td><td className="p-2">{formatCurrency(r.saldo_por_pagar)}</td>
                </tr>
              ))}
              {paginated.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-400">Sin registros</td></tr>}
            </tbody>
          </table>
          {records.length > PER_PAGE && (
            <div className="flex gap-2 mt-3 justify-end text-sm">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded border">Anterior</button>
              <span className="px-3 py-1">Página {page}</span>
              <button disabled={page * PER_PAGE >= records.length} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border">Siguiente</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-4 no-print"><button onClick={() => setView('list')} className="text-sm text-primary hover:underline">← Lista</button><h1 className="text-xl font-bold text-primary">Cobranzas</h1></div>
      <div className="card">
        <FungevisHeader />
        <div className="grid grid-cols-3 gap-4 mb-4">
          <CILookup value={form.ci_titular} onChange={v => setField('ci_titular', v)} onFound={handleCIFound} />
          <div><label className="form-label">Monto a Cancelar</label><input type="number" step="0.01" value={form.monto_cancelar} onChange={e => setField('monto_cancelar', parseFloat(e.target.value) || 0)} className="form-input" /></div>
          <div><label className="form-label">Solicitud Nro</label><input type="text" value={form.solicitud_nro} readOnly className="form-input bg-gray-100" /></div>
        </div>

        <div className="section-title">Datos del Titular</div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[['fecha_afiliacion','Fecha Afiliación'],['tipo','Tipo'],['plan','Plan'],['nombres','Nombres'],['apellidos','Apellidos']].map(([k, lbl]) => (
            <div key={k}><label className="form-label">{lbl}</label><input type="text" value={String(form[k as keyof CobranzaRecord] ?? '')} readOnly className="form-input bg-gray-100" /></div>
          ))}
          <div><label className="form-label">Fax</label><input type="text" value={form.fax} onChange={e => setField('fax', e.target.value)} className="form-input" /></div>
        </div>

        <div className="section-title">Dirección Habitación</div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {(['dir_estado','dir_ciudad','dir_municipio','dir_parroquia','dir_sector','dir_casa_apto','telefono_hab','telefono_ofic','tlf_movil','email'] as const).map(k => (
            <div key={k}><label className="form-label">{k.replace('dir_','').replace(/_/g,' ')}</label><input type="text" value={form[k]} readOnly className="form-input bg-gray-100" /></div>
          ))}
        </div>

        <div className="section-title">Estatus de la Póliza</div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div><label className="form-label">Fecha Desde</label><input type="text" value={form.fecha_desde} readOnly className="form-input bg-gray-100" /></div>
          <div><label className="form-label">Fecha Hasta</label><input type="text" value={form.fecha_hasta} readOnly className="form-input bg-gray-100" /></div>
          <div>
            <label className="form-label">Vigencia</label>
            <div className={`form-input font-bold ${vigenciaDisplay === 'VENCIDA' ? 'text-red-600 bg-red-50' : vigenciaDisplay === '#¡VALOR!' ? 'text-orange-500' : 'text-primary bg-green-50'}`}>{vigenciaDisplay}</div>
          </div>
          <div><label className="form-label">Monto Inicial Pol</label><div className="form-input bg-gray-100">{formatCurrency(form.monto_inicial_pol)}</div></div>
          <div><label className="form-label">Frecuencia Pago</label><input type="text" value={form.frec_pago} readOnly className="form-input bg-gray-100" /></div>
          <div><label className="form-label">Cuota Nro</label><input type="number" value={form.cuota_nro} onChange={e => setField('cuota_nro', parseInt(e.target.value) || 0)} className="form-input" /></div>
          <div><label className="form-label">Cuotas Pendientes</label><input type="number" value={form.cuotas_pendientes} onChange={e => setField('cuotas_pendientes', parseInt(e.target.value) || 0)} className="form-input" /></div>
          <div><label className="form-label">Cuotas Atrasadas</label><input type="number" value={form.cuotas_atrasadas} onChange={e => setField('cuotas_atrasadas', parseInt(e.target.value) || 0)} className="form-input" /></div>
          <div><label className="form-label">Total Deuda</label><input type="number" step="0.01" value={form.total_deuda} onChange={e => setField('total_deuda', parseFloat(e.target.value) || 0)} className="form-input" /></div>
          <div><label className="form-label">Saldo por Pagar</label><input type="number" step="0.01" value={form.saldo_por_pagar} onChange={e => setField('saldo_por_pagar', parseFloat(e.target.value) || 0)} className="form-input" /></div>
        </div>

        <FormButtons onSave={handleSave} onClear={() => setForm({ ...EMPTY })} onDelete={handleDelete} onPrint={() => window.print()} saving={saving} hasRecord={!!form.id} />
      </div>
    </div>
  );
}
