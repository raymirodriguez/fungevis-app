import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../utils/supabase';
import FungevisHeader from '../components/FungevisHeader';
import FormButtons from '../components/FormButtons';
import { ESPECIALIDAD_OPTIONS } from '../utils/dropdowns';

const EMPTY = { ci_pers_salud: '', num_colegio: '', nombres: '', apellidos: '', especialidad: '', monto_consulta: 0, dias_atencion: '', email: '', telefono: '' };
type PersonalRecord = typeof EMPTY & { id?: number };

export default function PersonalSalud() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [form, setForm] = useState<PersonalRecord>({ ...EMPTY });
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const fetchRecords = async () => {
    let query = supabase.from('personal_salud').select('*').order('created_at', { ascending: false }).limit(200);
    if (search) query = query.or(`ci_pers_salud.ilike.%${search}%,nombres.ilike.%${search}%,apellidos.ilike.%${search}%`);
    const { data, error } = await query;
    if (error) toast.error('Error al cargar registros');
    else setRecords((data ?? []) as PersonalRecord[]);
  };

  useEffect(() => { fetchRecords(); }, [search]);

  const setField = (key: string, val: string | number) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      delete payload.id;
      if (form.id) {
        const { error } = await supabase.from('personal_salud').update(payload).eq('id', form.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('personal_salud').insert(payload).select().single();
        if (error) throw error;
        setForm(prev => ({ ...prev, id: (data as PersonalRecord).id }));
      }
      toast.success('Registro guardado exitosamente');
      fetchRecords();
    } catch { toast.error('Error al guardar el registro'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    const { error } = await supabase.from('personal_salud').delete().eq('id', form.id);
    if (error) { toast.error('Error al eliminar el registro'); return; }
    toast.success('Registro eliminado');
    setForm({ ...EMPTY }); setView('list'); fetchRecords();
  };

  const paginated = records.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (view === 'list') {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-primary">Personal de Salud Fungevis</h1>
          <button onClick={() => { setForm({ ...EMPTY }); setView('form'); }} className="btn-action text-sm">+ Nuevo Registro</button>
        </div>
        <div className="card">
          <input type="text" placeholder="Buscar por C.I. o Nombre..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="form-input mb-4 max-w-sm" />
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-100 text-xs uppercase text-gray-600"><th className="text-left p-2">C.I.</th><th className="text-left p-2">Nombres</th><th className="text-left p-2">Apellidos</th><th className="text-left p-2">Especialidad</th><th className="text-left p-2">Monto Consulta</th></tr></thead>
            <tbody>
              {paginated.map(r => (
                <tr key={r.id} onClick={() => { setForm(r); setView('form'); }} className="border-t hover:bg-green-50 cursor-pointer">
                  <td className="p-2 font-mono">{r.ci_pers_salud}</td><td className="p-2">{r.nombres}</td><td className="p-2">{r.apellidos}</td><td className="p-2">{r.especialidad}</td><td className="p-2">$ {r.monto_consulta}</td>
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
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-4 no-print"><button onClick={() => setView('list')} className="text-sm text-primary hover:underline">← Lista</button><h1 className="text-xl font-bold text-primary">Personal de Salud Fungevis</h1></div>
      <div className="card">
        <FungevisHeader />
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div><label className="form-label">C.I. Pers. Salud</label><input type="text" value={form.ci_pers_salud} onChange={e => setField('ci_pers_salud', e.target.value)} className="form-input" placeholder="V-12345678" /></div>
          <div><label className="form-label"># Colegio</label><input type="text" value={form.num_colegio} onChange={e => setField('num_colegio', e.target.value)} className="form-input" /></div>
          <div><label className="form-label">Nombres</label><input type="text" value={form.nombres} onChange={e => setField('nombres', e.target.value)} className="form-input" /></div>
          <div><label className="form-label">Apellidos</label><input type="text" value={form.apellidos} onChange={e => setField('apellidos', e.target.value)} className="form-input" /></div>
          <div>
            <label className="form-label">Especialidad</label>
            <select value={form.especialidad} onChange={e => setField('especialidad', e.target.value)} className="form-select">
              <option value="">--</option>{ESPECIALIDAD_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div><label className="form-label">Monto Consulta ($)</label><input type="number" step="0.01" value={form.monto_consulta} onChange={e => setField('monto_consulta', parseFloat(e.target.value) || 0)} className="form-input" /></div>
          <div><label className="form-label">Días Atnc</label><input type="text" value={form.dias_atencion} onChange={e => setField('dias_atencion', e.target.value)} className="form-input" placeholder="Lun-Vie" /></div>
          <div><label className="form-label">e-mail</label><input type="email" value={form.email} onChange={e => setField('email', e.target.value)} className="form-input" /></div>
          <div className="col-span-2"><label className="form-label">Teléfono</label><input type="text" value={form.telefono} onChange={e => setField('telefono', e.target.value)} className="form-input" /></div>
        </div>
        <FormButtons onSave={handleSave} onClear={() => setForm({ ...EMPTY })} onDelete={handleDelete} onPrint={() => window.print()} saving={saving} hasRecord={!!form.id} />
      </div>
    </div>
  );
}
