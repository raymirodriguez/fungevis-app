import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../utils/supabase';
import FungevisHeader from '../components/FungevisHeader';
import FormButtons from '../components/FormButtons';
import CILookup from '../components/CILookup';
import { SEXO_OPTIONS, EDO_CIVIL_OPTIONS, CIUDAD_OPTIONS, CIUDAD_MUNICIPIO } from '../utils/dropdowns';
import { isoToInput } from '../utils/calculations';

const EMPTY = {
  ci_titular: '', ci_beneficiario: '', num_benef: '',
  nombres: '', apellidos: '', fecha_nacimiento: '', sexo: '', edo_civil: '',
  enfermedad_preexistente: '',
  dir_estado: '', dir_ciudad: '', dir_municipio: '', dir_parroquia: '', dir_sector: '', dir_casa_apto: '',
  telefono_hab: '', telefono_ofic: '', tlf_movil: '', email: '', fax: '',
  tiene_huella: false, lugar: '', firma_fecha: '',
};
type BenefRecord = typeof EMPTY & { id?: number };

export default function Beneficiarios() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [records, setRecords] = useState<BenefRecord[]>([]);
  const [form, setForm] = useState<BenefRecord>({ ...EMPTY });
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const fetchRecords = async () => {
    let query = supabase.from('beneficiarios').select('*').order('created_at', { ascending: false }).limit(200);
    if (search) query = query.or(`ci_titular.ilike.%${search}%,ci_beneficiario.ilike.%${search}%,nombres.ilike.%${search}%`);
    const { data, error } = await query;
    if (error) toast.error('Error al cargar registros');
    else setRecords((data ?? []) as BenefRecord[]);
  };

  useEffect(() => { fetchRecords(); }, [search]);

  const setField = (key: string, val: string | number | boolean) => {
    setForm(prev => {
      const updated = { ...prev, [key]: val };
      if (key === 'dir_ciudad') updated.dir_municipio = CIUDAD_MUNICIPIO[val as string] ?? '';
      return updated;
    });
  };

  const handleCITitularFound = async (data: Record<string, unknown>) => {
    const { count } = await supabase.from('beneficiarios').select('*', { count: 'exact', head: true }).eq('ci_titular', data.ci_titular as string);
    setForm(prev => ({ ...prev, num_benef: `B-${(count ?? 0) + 1}` }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      delete payload.id; delete payload.lugar; delete payload.firma_fecha;
      if (!payload.fecha_nacimiento) payload.fecha_nacimiento = null;
      if (form.id) {
        const { error } = await supabase.from('beneficiarios').update(payload).eq('id', form.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('beneficiarios').insert(payload).select().single();
        if (error) throw error;
        setForm(prev => ({ ...prev, id: (data as BenefRecord).id }));
      }
      toast.success('Registro guardado exitosamente');
      fetchRecords();
    } catch { toast.error('Error al guardar el registro'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    const { error } = await supabase.from('beneficiarios').delete().eq('id', form.id);
    if (error) { toast.error('Error al eliminar el registro'); return; }
    toast.success('Registro eliminado');
    setForm({ ...EMPTY }); setView('list'); fetchRecords();
  };

  const paginated = records.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (view === 'list') {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-primary">Beneficiarios</h1>
          <button onClick={() => { setForm({ ...EMPTY }); setView('form'); }} className="btn-action text-sm">+ Nuevo Registro</button>
        </div>
        <div className="card">
          <input type="text" placeholder="Buscar por C.I...." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="form-input mb-4 max-w-sm" />
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-100 text-xs uppercase text-gray-600"><th className="text-left p-2"># Benef</th><th className="text-left p-2">C.I. Titular</th><th className="text-left p-2">C.I. Beneficiario</th><th className="text-left p-2">Nombres</th><th className="text-left p-2">Apellidos</th></tr></thead>
            <tbody>
              {paginated.map(r => (
                <tr key={r.id} onClick={() => { setForm({ ...r, fecha_nacimiento: isoToInput(r.fecha_nacimiento) }); setView('form'); }} className="border-t hover:bg-green-50 cursor-pointer">
                  <td className="p-2 font-bold">{r.num_benef}</td><td className="p-2 font-mono">{r.ci_titular}</td><td className="p-2 font-mono">{r.ci_beneficiario}</td><td className="p-2">{r.nombres}</td><td className="p-2">{r.apellidos}</td>
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
      <div className="flex items-center gap-3 mb-4 no-print"><button onClick={() => setView('list')} className="text-sm text-primary hover:underline">← Lista</button><h1 className="text-xl font-bold text-primary">Beneficiarios</h1></div>
      <div className="card">
        <FungevisHeader />
        <div className="grid grid-cols-3 gap-4 mb-4">
          <CILookup value={form.ci_titular} onChange={v => setField('ci_titular', v)} onFound={handleCITitularFound} />
          <div><label className="form-label">C.I. Beneficiario</label><input type="text" value={form.ci_beneficiario} onChange={e => setField('ci_beneficiario', e.target.value)} className="form-input" placeholder="Ej: V-87654321" /></div>
          <div><label className="form-label"># Benef (auto)</label><input type="text" value={form.num_benef} readOnly className="form-input bg-gray-100 font-bold" /></div>
        </div>

        <div className="section-title">Datos Personales</div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div><label className="form-label">Nombres</label><input type="text" value={form.nombres} onChange={e => setField('nombres', e.target.value)} className="form-input" /></div>
          <div><label className="form-label">Apellidos</label><input type="text" value={form.apellidos} onChange={e => setField('apellidos', e.target.value)} className="form-input" /></div>
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
        <div className="mb-4"><label className="form-label">Enfermedad Preexistente</label><textarea value={form.enfermedad_preexistente} onChange={e => setField('enfermedad_preexistente', e.target.value)} className="form-input h-20 resize-none" /></div>

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

        <div className="section-title">Declaración Legal</div>
        <div className="border border-gray-300 rounded p-4 mb-4 bg-gray-50 text-sm italic text-gray-700">
          <p>"Yo, <span className="font-semibold not-italic">{form.nombres} {form.apellidos}</span>, <span className="font-semibold not-italic">{form.ci_beneficiario || '_______________'}</span>, C.I., doy fe que el dinero para el pago de la Prima, proviene de una fuente lícita y por lo tanto no tiene relación alguna con dinero, capitales, bienes, haberes, beneficios, valores o títulos producto de las actividades o acciones derivadas de operaciones ilícitas."</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div><label className="form-label">Lugar</label><input type="text" value={form.lugar} onChange={e => setField('lugar', e.target.value)} className="form-input" placeholder="Ciudad, Estado" /></div>
          <div><label className="form-label">Fecha</label><input type="text" value={form.firma_fecha} onChange={e => setField('firma_fecha', e.target.value)} className="form-input" placeholder="DD/MM/AAAA" /></div>
        </div>
        <div className="mb-4"><label className="form-label">Firma del Titular</label><div className="border-b-2 border-gray-400 w-64 h-8"></div></div>

        <div className="section-title">Huella Digital</div>
        <div className="border-2 border-dashed border-gray-400 rounded p-6 mb-4 text-center">
          <div className="text-sm text-gray-500 mb-2">Pulgar derecho del titular</div>
          <label className="flex items-center gap-2 justify-center cursor-pointer">
            <input type="checkbox" checked={!!form.tiene_huella} onChange={e => setField('tiene_huella', e.target.checked)} className="w-4 h-4 accent-accent" />
            <span className="text-sm">Huella registrada</span>
          </label>
        </div>

        <FormButtons onSave={handleSave} onClear={() => setForm({ ...EMPTY })} onDelete={handleDelete} onPrint={() => window.print()} saving={saving} hasRecord={!!form.id} />
      </div>
    </div>
  );
}
