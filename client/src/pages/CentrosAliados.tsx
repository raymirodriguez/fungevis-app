import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../utils/supabase';
import FungevisHeader from '../components/FungevisHeader';
import FormButtons from '../components/FormButtons';
import { isoToInput } from '../utils/calculations';

const EMPTY = { rif: '', fecha: '', nombre: '', especialidad: '', estudio: '', dias_atencion: '', email: '', telefono: '' };
type Centro = typeof EMPTY & { id?: number };

export default function CentrosAliados() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [records, setRecords] = useState<Centro[]>([]);
  const [form, setForm] = useState<Centro>({ ...EMPTY });
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const fetchRecords = async () => {
    let query = supabase.from('centros_aliados').select('*').order('created_at', { ascending: false }).limit(200);
    if (search) query = query.ilike('nombre', `%${search}%`);
    const { data, error } = await query;
    if (error) toast.error('Error al cargar registros');
    else setRecords((data ?? []) as Centro[]);
  };

  useEffect(() => { fetchRecords(); }, [search]);

  const setField = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      delete payload.id;
      if (!payload.fecha) payload.fecha = null;
      if (form.id) {
        const { error } = await supabase.from('centros_aliados').update(payload).eq('id', form.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('centros_aliados').insert(payload).select().single();
        if (error) throw error;
        setForm(prev => ({ ...prev, id: (data as Centro).id }));
      }
      toast.success('Registro guardado exitosamente');
      fetchRecords();
    } catch { toast.error('Error al guardar el registro'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    const { error } = await supabase.from('centros_aliados').delete().eq('id', form.id);
    if (error) { toast.error('Error al eliminar el registro'); return; }
    toast.success('Registro eliminado');
    setForm({ ...EMPTY }); setView('list'); fetchRecords();
  };

  const paginated = records.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (view === 'list') {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-primary">Centros de Atención Aliadas</h1>
          <button onClick={() => { setForm({ ...EMPTY }); setView('form'); }} className="btn-action text-sm">+ Nuevo Registro</button>
        </div>
        <div className="card">
          <input type="text" placeholder="Buscar por Nombre..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="form-input mb-4 max-w-sm" />
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-100 text-xs uppercase text-gray-600"><th className="text-left p-2">RIF</th><th className="text-left p-2">Nombre</th><th className="text-left p-2">Especialidad</th><th className="text-left p-2">Teléfono</th></tr></thead>
            <tbody>
              {paginated.map(r => (
                <tr key={r.id} onClick={() => { setForm({ ...r, fecha: isoToInput(r.fecha) }); setView('form'); }} className="border-t hover:bg-green-50 cursor-pointer">
                  <td className="p-2">{r.rif}</td><td className="p-2">{r.nombre}</td><td className="p-2">{r.especialidad}</td><td className="p-2">{r.telefono}</td>
                </tr>
              ))}
              {paginated.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-400">Sin registros</td></tr>}
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
      <div className="flex items-center gap-3 mb-4 no-print"><button onClick={() => setView('list')} className="text-sm text-primary hover:underline">← Lista</button><h1 className="text-xl font-bold text-primary">Centros de Atención Aliadas</h1></div>
      <div className="card">
        <FungevisHeader />
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div><label className="form-label">RIF</label><input type="text" value={form.rif} onChange={e => setField('rif', e.target.value)} className="form-input" /></div>
          <div><label className="form-label">Fecha</label><input type="date" value={form.fecha} onChange={e => setField('fecha', e.target.value)} className="form-input" /></div>
          <div className="col-span-2"><label className="form-label">Nombre</label><input type="text" value={form.nombre} onChange={e => setField('nombre', e.target.value)} className="form-input" /></div>
          <div><label className="form-label">Especialidad</label><input type="text" value={form.especialidad} onChange={e => setField('especialidad', e.target.value)} className="form-input" /></div>
          <div><label className="form-label">Estudio</label><input type="text" value={form.estudio} onChange={e => setField('estudio', e.target.value)} className="form-input" /></div>
          <div><label className="form-label">Días Atnc</label><input type="text" value={form.dias_atencion} onChange={e => setField('dias_atencion', e.target.value)} className="form-input" placeholder="Ej: Lun-Vie" /></div>
          <div><label className="form-label">e-mail</label><input type="email" value={form.email} onChange={e => setField('email', e.target.value)} className="form-input" /></div>
          <div className="col-span-2"><label className="form-label">Teléfono</label><input type="text" value={form.telefono} onChange={e => setField('telefono', e.target.value)} className="form-input" /></div>
        </div>
        <FormButtons onSave={handleSave} onClear={() => setForm({ ...EMPTY })} onDelete={handleDelete} onPrint={() => window.print()} saving={saving} hasRecord={!!form.id} />
      </div>
    </div>
  );
}
