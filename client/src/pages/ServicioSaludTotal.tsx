import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../utils/supabase';
import FungevisHeader from '../components/FungevisHeader';
import FormButtons from '../components/FormButtons';
import {
  SEXO_OPTIONS, EDO_CIVIL_OPTIONS, TIPO_OPTIONS, PLAN_OPTIONS,
  FREC_PAGO_OPTIONS, CIUDAD_OPTIONS, CIUDAD_MUNICIPIO,
} from '../utils/dropdowns';
import { calcCosto, calcMonto, calcFechaHasta, formatCurrency, isoToInput } from '../utils/calculations';

const EMPTY = {
  fecha_activacion: '', solicitud_nro: '', ci_titular: '', nombres: '', apellidos: '',
  fecha_nacimiento: '', sexo: '', edo_civil: '', act_economica: '',
  dir_estado: '', dir_ciudad: '', dir_municipio: '', dir_parroquia: '', dir_sector: '', dir_casa_apto: '',
  telefono_hab: '', telefono_ofic: '', tlf_movil: '', email: '', fax: '',
  es_persona_juridica: false, fecha_const_empresa: '', a_economica_empresa: '', naturaleza_empresa: '',
  tipo: '', plan: '', num_beneficiarios: 0, adicionales: 0, costo: 0, inscripcion: 10,
  frec_pago: '', monto: 0, fecha_desde: '', fecha_hasta: '',
};

type Servicio = typeof EMPTY & { id?: number };

export default function ServicioSaludTotal() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [records, setRecords] = useState<Servicio[]>([]);
  const [form, setForm] = useState<Servicio>({ ...EMPTY });
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const fetchRecords = async () => {
    let query = supabase.from('servicios').select('*').order('created_at', { ascending: false }).limit(200);
    if (search) {
      query = query.or(`ci_titular.ilike.%${search}%,nombres.ilike.%${search}%,apellidos.ilike.%${search}%`);
    }
    const { data, error } = await query;
    if (error) toast.error('Error al cargar registros');
    else setRecords((data ?? []) as Servicio[]);
  };

  useEffect(() => { fetchRecords(); }, [search]);

  const setField = (key: string, val: string | number | boolean) => {
    setForm(prev => {
      const updated = { ...prev, [key]: val };
      if (key === 'dir_ciudad') updated.dir_municipio = CIUDAD_MUNICIPIO[val as string] ?? '';
      if (key === 'plan' || key === 'tipo') {
        const plan = key === 'plan' ? String(val) : String(updated.plan);
        const tipo = key === 'tipo' ? String(val) : String(updated.tipo);
        updated.costo = calcCosto(plan, tipo);
        updated.monto = calcMonto(plan, tipo, String(updated.frec_pago));
      }
      if (key === 'frec_pago') {
        updated.monto = calcMonto(String(updated.plan), String(updated.tipo), String(val));
      }
      if (key === 'fecha_desde') {
        updated.fecha_hasta = calcFechaHasta(String(val));
      }
      return updated;
    });
  };

  const getNextSolicitudNro = async (): Promise<string> => {
    const { data } = await supabase.from('servicios').select('solicitud_nro').order('id', { ascending: false }).limit(1);
    if (data && data.length > 0 && data[0].solicitud_nro) {
      const n = parseInt(data[0].solicitud_nro, 10);
      if (!isNaN(n)) return String(n + 1).padStart(3, '0');
    }
    return '001';
  };

  const handleSave = async () => {
    if (!form.fecha_activacion || !form.ci_titular) {
      toast.error('Fecha de activación y C.I. son requeridos');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      delete (payload as Servicio & { id?: number }).id;
      // Clean up empty date strings to null
      for (const k of ['fecha_nacimiento','fecha_const_empresa','fecha_desde','fecha_hasta']) {
        if (!(payload as Record<string,unknown>)[k]) (payload as Record<string,unknown>)[k] = null;
      }

      if (form.id) {
        const { error } = await supabase.from('servicios').update(payload).eq('id', form.id);
        if (error) throw error;
      } else {
        if (!payload.solicitud_nro) payload.solicitud_nro = await getNextSolicitudNro();
        const { data, error } = await supabase.from('servicios').insert(payload).select().single();
        if (error) throw error;
        setForm(prev => ({ ...prev, id: (data as Servicio).id }));
      }
      toast.success('Registro guardado exitosamente');
      fetchRecords();
    } catch { toast.error('Error al guardar el registro'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    const { error } = await supabase.from('servicios').delete().eq('id', form.id);
    if (error) { toast.error('Error al eliminar el registro'); return; }
    toast.success('Registro eliminado');
    setForm({ ...EMPTY });
    setView('list');
    fetchRecords();
  };

  const openRecord = (r: Servicio) => {
    setForm({
      ...r,
      fecha_activacion: isoToInput(r.fecha_activacion),
      fecha_nacimiento: isoToInput(r.fecha_nacimiento),
      fecha_desde: isoToInput(r.fecha_desde),
      fecha_hasta: isoToInput(r.fecha_hasta),
    });
    setView('form');
  };

  const paginated = records.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (view === 'list') {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-primary">Servicio de Salud Total</h1>
          <button onClick={() => { setForm({ ...EMPTY }); setView('form'); }} className="btn-action text-sm">+ Nuevo Registro</button>
        </div>
        <div className="card">
          <input type="text" placeholder="Buscar por C.I. o Nombre..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="form-input mb-4 max-w-sm" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-xs uppercase">
                  <th className="text-left p-2">Nro</th><th className="text-left p-2">C.I.</th>
                  <th className="text-left p-2">Nombres</th><th className="text-left p-2">Apellidos</th>
                  <th className="text-left p-2">Plan</th><th className="text-left p-2">Tipo</th>
                  <th className="text-left p-2">Fecha Activación</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(r => (
                  <tr key={r.id} onClick={() => openRecord(r)} className="border-t hover:bg-green-50 cursor-pointer">
                    <td className="p-2">{r.solicitud_nro}</td>
                    <td className="p-2 font-mono">{r.ci_titular}</td>
                    <td className="p-2">{r.nombres}</td>
                    <td className="p-2">{r.apellidos}</td>
                    <td className="p-2">{r.plan}</td>
                    <td className="p-2">{r.tipo}</td>
                    <td className="p-2">{isoToInput(r.fecha_activacion)}</td>
                  </tr>
                ))}
                {paginated.length === 0 && <tr><td colSpan={7} className="p-4 text-center text-gray-400">Sin registros</td></tr>}
              </tbody>
            </table>
          </div>
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
      <div className="flex items-center gap-3 mb-4 no-print">
        <button onClick={() => setView('list')} className="text-sm text-primary hover:underline">← Lista</button>
        <h1 className="text-xl font-bold text-primary">Servicio de Salud Total</h1>
      </div>

      <div className="card">
        <FungevisHeader />

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="form-label">Fecha de Activación *</label>
            <input type="date" value={form.fecha_activacion} onChange={e => setField('fecha_activacion', e.target.value)} className="form-input" />
          </div>
          <div>
            <label className="form-label">Solicitud Nro</label>
            <input type="text" value={form.solicitud_nro} onChange={e => setField('solicitud_nro', e.target.value)} placeholder="Auto-generado" className="form-input" />
          </div>
        </div>

        <div className="section-title">Datos Personales</div>
        <div className="grid grid-cols-1 gap-3 mb-4">
          <div>
            <label className="form-label">C.I. Titular *</label>
            <input type="text" value={form.ci_titular} onChange={e => setField('ci_titular', e.target.value)} placeholder="Ej: V-12345678" className="form-input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="form-label">Nombres</label><input type="text" value={form.nombres} onChange={e => setField('nombres', e.target.value)} className="form-input" /></div>
            <div><label className="form-label">Apellidos</label><input type="text" value={form.apellidos} onChange={e => setField('apellidos', e.target.value)} className="form-input" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="form-label">F. Nacimiento</label><input type="date" value={form.fecha_nacimiento} onChange={e => setField('fecha_nacimiento', e.target.value)} className="form-input" /></div>
            <div>
              <label className="form-label">Sexo</label>
              <select value={form.sexo} onChange={e => setField('sexo', e.target.value)} className="form-select">
                <option value="">--</option>{SEXO_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Edo. Civil</label>
              <select value={form.edo_civil} onChange={e => setField('edo_civil', e.target.value)} className="form-select">
                <option value="">--</option>{EDO_CIVIL_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div><label className="form-label">Act. Económica</label><input type="text" value={form.act_economica} onChange={e => setField('act_economica', e.target.value)} className="form-input" /></div>
        </div>

        <div className="section-title">Dirección de Habitación</div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div><label className="form-label">Estado</label><input type="text" value={form.dir_estado} onChange={e => setField('dir_estado', e.target.value)} className="form-input" /></div>
          <div>
            <label className="form-label">Ciudad</label>
            <select value={form.dir_ciudad} onChange={e => setField('dir_ciudad', e.target.value)} className="form-select">
              <option value="">--</option>{CIUDAD_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div><label className="form-label">Municipio (auto)</label><input type="text" value={form.dir_municipio} readOnly className="form-input bg-gray-100" /></div>
          <div><label className="form-label">Parroquia</label><input type="text" value={form.dir_parroquia} onChange={e => setField('dir_parroquia', e.target.value)} className="form-input" /></div>
          <div><label className="form-label">Sector</label><input type="text" value={form.dir_sector} onChange={e => setField('dir_sector', e.target.value)} className="form-input" /></div>
          <div><label className="form-label">Casa/Apto #</label><input type="text" value={form.dir_casa_apto} onChange={e => setField('dir_casa_apto', e.target.value)} className="form-input" /></div>
          <div><label className="form-label">Teléfono Hab</label><input type="text" value={form.telefono_hab} onChange={e => setField('telefono_hab', e.target.value)} className="form-input" /></div>
          <div><label className="form-label">Teléfono Ofic</label><input type="text" value={form.telefono_ofic} onChange={e => setField('telefono_ofic', e.target.value)} className="form-input" /></div>
          <div><label className="form-label">Tlf Móvil</label><input type="text" value={form.tlf_movil} onChange={e => setField('tlf_movil', e.target.value)} className="form-input" /></div>
          <div><label className="form-label">e-mail</label><input type="email" value={form.email} onChange={e => setField('email', e.target.value)} className="form-input" /></div>
          <div><label className="form-label">Fax</label><input type="text" value={form.fax} onChange={e => setField('fax', e.target.value)} className="form-input" /></div>
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={!!form.es_persona_juridica} onChange={e => setField('es_persona_juridica', e.target.checked)} className="w-4 h-4 accent-accent" />
            <span className="text-sm font-semibold text-gray-700">Si es Tomador es Persona Jurídica responda adicionalmente</span>
          </label>
          {form.es_persona_juridica && (
            <div className="mt-3 grid grid-cols-3 gap-3 border-l-4 border-accent pl-4">
              <div><label className="form-label">Fecha Const. Empresa</label><input type="date" value={form.fecha_const_empresa} onChange={e => setField('fecha_const_empresa', e.target.value)} className="form-input" /></div>
              <div><label className="form-label">A. Económica</label><input type="text" value={form.a_economica_empresa} onChange={e => setField('a_economica_empresa', e.target.value)} className="form-input" /></div>
              <div><label className="form-label">Naturaleza de la Empresa</label><input type="text" value={form.naturaleza_empresa} onChange={e => setField('naturaleza_empresa', e.target.value)} className="form-input" /></div>
            </div>
          )}
        </div>

        <div className="section-title">Afiliación del Servicio</div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="form-label">Tipo</label>
            <select value={form.tipo} onChange={e => setField('tipo', e.target.value)} className="form-select">
              <option value="">--</option>{TIPO_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Plan</label>
            <select value={form.plan} onChange={e => setField('plan', e.target.value)} className="form-select">
              <option value="">--</option>{PLAN_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div><label className="form-label">Beneficiarios</label><input type="number" min={0} value={form.num_beneficiarios} onChange={e => setField('num_beneficiarios', parseInt(e.target.value) || 0)} className="form-input" /></div>
          <div><label className="form-label">Adicionales</label><input type="number" min={0} value={form.adicionales} onChange={e => setField('adicionales', parseInt(e.target.value) || 0)} className="form-input" /></div>
          <div><label className="form-label">Costo (calculado)</label><div className="form-input bg-gray-100 font-semibold text-primary">{formatCurrency(form.costo)}</div></div>
          <div><label className="form-label">Inscripción</label><div className="form-input bg-gray-100 font-semibold text-primary">$ 10.00</div></div>
          <div>
            <label className="form-label">Frec. Pago</label>
            <select value={form.frec_pago} onChange={e => setField('frec_pago', e.target.value)} className="form-select">
              <option value="">--</option>{FREC_PAGO_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div><label className="form-label">Monto (calculado)</label><div className="form-input bg-gray-100 font-semibold text-primary">{formatCurrency(form.monto)}</div></div>
          <div><label className="form-label">Fecha Desde</label><input type="date" value={form.fecha_desde} onChange={e => setField('fecha_desde', e.target.value)} className="form-input" /></div>
          <div><label className="form-label">Fecha Hasta (auto)</label><input type="date" value={form.fecha_hasta} readOnly className="form-input bg-gray-100" /></div>
        </div>

        <FormButtons onSave={handleSave} onClear={() => setForm({ ...EMPTY })} onDelete={handleDelete} onPrint={() => window.print()} saving={saving} hasRecord={!!form.id} />
      </div>
    </div>
  );
}
