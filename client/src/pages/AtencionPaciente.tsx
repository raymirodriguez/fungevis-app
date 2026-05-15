import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../utils/supabase';
import FungevisHeader from '../components/FungevisHeader';
import FormButtons from '../components/FormButtons';
import CILookup from '../components/CILookup';
import { calcVigencia, isoToInput } from '../utils/calculations';

const EMPTY = {
  ci_titular: '', afiliado: false, solicitud_nro: '', fecha_afiliacion: '',
  tipo: '', plan: '', nombres: '', apellidos: '',
  dir_estado: '', dir_ciudad: '', dir_municipio: '', dir_parroquia: '', dir_sector: '', dir_casa_apto: '',
  telefono_hab: '', telefono_ofic: '', tlf_movil: '', email: '', fax: '(0212) 261 4022',
  num_beneficiarios: 0, fecha_desde: '', fecha_hasta: '', frec_pago: '',
};
type AtencionRecord = typeof EMPTY & { id?: number };

const BENEF_COLORS = ['bg-yellow-200', 'bg-blue-200', 'bg-pink-200', 'bg-green-200', 'bg-gray-200', 'bg-white border-2'];

export default function AtencionPaciente() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [records, setRecords] = useState<AtencionRecord[]>([]);
  const [form, setForm] = useState<AtencionRecord>({ ...EMPTY });
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [beneficiarios, setBeneficiarios] = useState<Array<{ ci: string; nombres: string; apellidos: string }>>([]);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const fetchRecords = async () => {
    let query = supabase.from('atencion_paciente').select('*').order('created_at', { ascending: false }).limit(200);
    if (search) query = query.or(`ci_titular.ilike.%${search}%,nombres.ilike.%${search}%,apellidos.ilike.%${search}%`);
    const { data, error } = await query;
    if (error) toast.error('Error al cargar registros');
    else setRecords((data ?? []) as AtencionRecord[]);
  };

  useEffect(() => { fetchRecords(); }, [search]);

  const setField = (key: string, val: string | number | boolean) => setForm(prev => ({ ...prev, [key]: val }));

  const handleCIFound = async (data: Record<string, unknown>) => {
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
      fecha_desde: isoToInput(String(data.fecha_desde ?? '')),
      fecha_hasta: isoToInput(String(data.fecha_hasta ?? '')),
      frec_pago: String(data.frec_pago ?? ''),
    }));
    const { data: benefs } = await supabase.from('beneficiarios').select('ci_beneficiario,nombres,apellidos').eq('ci_titular', data.ci_titular as string);
    setBeneficiarios((benefs ?? []).map((b: Record<string, unknown>) => ({ ci: String(b.ci_beneficiario ?? ''), nombres: String(b.nombres ?? ''), apellidos: String(b.apellidos ?? '') })));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      delete (payload as AtencionRecord & { id?: number }).id;
      for (const k of ['fecha_afiliacion','fecha_desde','fecha_hasta']) {
        if (!(payload as Record<string,unknown>)[k]) (payload as Record<string,unknown>)[k] = null;
      }
      if (form.id) {
        const { error } = await supabase.from('atencion_paciente').update(payload).eq('id', form.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('atencion_paciente').insert(payload).select().single();
        if (error) throw error;
        setForm(prev => ({ ...prev, id: (data as AtencionRecord).id }));
      }
      toast.success('Registro guardado exitosamente');
      fetchRecords();
    } catch { toast.error('Error al guardar el registro'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    const { error } = await supabase.from('atencion_paciente').delete().eq('id', form.id);
    if (error) { toast.error('Error al eliminar el registro'); return; }
    toast.success('Registro eliminado');
    setForm({ ...EMPTY }); setBeneficiarios([]); setView('list'); fetchRecords();
  };

  const vigencia = calcVigencia(form.fecha_hasta);
  const paginated = records.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (view === 'list') {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-primary">Servicio Atención al Paciente</h1>
          <button onClick={() => { setForm({ ...EMPTY }); setBeneficiarios([]); setView('form'); }} className="btn-action text-sm">+ Nuevo Registro</button>
        </div>
        <div className="card">
          <input type="text" placeholder="Buscar por C.I. o Nombre..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="form-input mb-4 max-w-sm" />
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-100 text-xs uppercase text-gray-600"><th className="text-left p-2">C.I.</th><th className="text-left p-2">Nombres</th><th className="text-left p-2">Apellidos</th><th className="text-left p-2">Plan</th><th className="text-left p-2">Afiliado</th></tr></thead>
            <tbody>
              {paginated.map(r => (
                <tr key={r.id} onClick={() => { setForm({ ...r, fecha_afiliacion: isoToInput(r.fecha_afiliacion), fecha_desde: isoToInput(r.fecha_desde), fecha_hasta: isoToInput(r.fecha_hasta) }); setView('form'); }} className="border-t hover:bg-green-50 cursor-pointer">
                  <td className="p-2 font-mono">{r.ci_titular}</td><td className="p-2">{r.nombres}</td><td className="p-2">{r.apellidos}</td><td className="p-2">{r.plan}</td>
                  <td className="p-2"><span className={`px-2 py-0.5 rounded font-bold text-xs ${r.afiliado ? 'bg-green-500 text-white' : 'bg-red-400 text-white'}`}>{r.afiliado ? 'SI' : 'NO'}</span></td>
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
      <div className="flex items-center gap-3 mb-4 no-print"><button onClick={() => setView('list')} className="text-sm text-primary hover:underline">← Lista</button><h1 className="text-xl font-bold text-primary">Servicio Atención al Paciente</h1></div>
      <div className="card">
        <FungevisHeader />
        <div className="grid grid-cols-3 gap-4 mb-4">
          <CILookup value={form.ci_titular} onChange={v => setField('ci_titular', v)} onFound={handleCIFound} />
          <div>
            <label className="form-label">Afiliado</label>
            <div className="flex items-center gap-2">
              <span className={`inline-block px-4 py-1.5 rounded font-bold text-sm ${form.afiliado ? 'bg-green-500 text-white' : 'bg-red-400 text-white'}`}>{form.afiliado ? 'SI' : 'NO'}</span>
              <input type="checkbox" checked={!!form.afiliado} onChange={e => setField('afiliado', e.target.checked)} className="w-4 h-4 accent-accent" />
            </div>
          </div>
          <div><label className="form-label">Solicitud Nro</label><input type="text" value={form.solicitud_nro} readOnly className="form-input bg-gray-100" /></div>
        </div>

        <div className="section-title">Datos del Paciente</div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div><label className="form-label">Fecha Afiliación</label><input type="text" value={form.fecha_afiliacion} readOnly className="form-input bg-gray-100" /></div>
          <div><label className="form-label">Tipo</label><input type="text" value={form.tipo} readOnly className="form-input bg-gray-100" /></div>
          <div><label className="form-label">Plan</label><input type="text" value={form.plan} readOnly className="form-input bg-gray-100" /></div>
          <div><label className="form-label">Nombres</label><input type="text" value={form.nombres} readOnly className="form-input bg-gray-100" /></div>
          <div><label className="form-label">Apellidos</label><input type="text" value={form.apellidos} readOnly className="form-input bg-gray-100" /></div>
          <div><label className="form-label">Fax</label><input type="text" value={form.fax} onChange={e => setField('fax', e.target.value)} className="form-input" /></div>
        </div>

        <div className="section-title">Dirección Habitación</div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {(['dir_estado','dir_ciudad','dir_municipio','dir_parroquia','dir_sector','dir_casa_apto','telefono_hab','telefono_ofic','tlf_movil','email'] as const).map(k => (
            <div key={k}><label className="form-label">{k.replace('dir_','').replace(/_/g,' ')}</label><input type="text" value={form[k]} readOnly className="form-input bg-gray-100" /></div>
          ))}
        </div>

        {beneficiarios.length > 0 && (
          <>
            <div className="section-title">Beneficiarios</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {Array.from({ length: 6 }).map((_, i) => {
                const b = beneficiarios[i];
                return (
                  <div key={i} className={`rounded-lg p-3 border ${BENEF_COLORS[i]} min-h-[80px]`}>
                    <div className="text-xs font-bold text-gray-600 mb-1">B-{i + 1}</div>
                    {b ? (<><div className="text-xs font-mono">{b.ci}</div><div className="text-sm font-semibold">{b.nombres}</div><div className="text-sm">{b.apellidos}</div></>) : <div className="text-xs text-gray-400 italic">Vacío</div>}
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="section-title">Estatus de la Póliza</div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div><label className="form-label">Fecha Desde</label><input type="text" value={form.fecha_desde} readOnly className="form-input bg-gray-100" /></div>
          <div><label className="form-label">Fecha Hasta</label><input type="text" value={form.fecha_hasta} readOnly className="form-input bg-gray-100" /></div>
          <div>
            <label className="form-label">Días de Vigencia</label>
            <div className={`form-input font-bold ${vigencia === 'VENCIDA' ? 'text-red-600 bg-red-50' : vigencia === '#¡VALOR!' ? 'text-orange-500' : 'text-primary bg-green-50'}`}>{vigencia}</div>
          </div>
          <div><label className="form-label">Frecuencia Pago</label><input type="text" value={form.frec_pago} readOnly className="form-input bg-gray-100" /></div>
        </div>

        <FormButtons onSave={handleSave} onClear={() => { setForm({ ...EMPTY }); setBeneficiarios([]); }} onDelete={handleDelete} onPrint={() => window.print()} saving={saving} hasRecord={!!form.id} />
      </div>
    </div>
  );
}
