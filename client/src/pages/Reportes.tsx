import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import FungevisHeader from '../components/FungevisHeader';
import toast from 'react-hot-toast';

type Tab = 'personal' | 'eco' | 'rx' | 'planes';

interface PrecioPersonal { id: number; especialidad: string; nombre: string; titulo: string; precio: number; afiliado: number; no_afiliado: number; }
interface PrecioEco { id: number; imagen: string; estudio: string; precio: number; pago_10: number; beneficiario_30: number; }
interface PrecioRx { id: number; imagen: string; estudio: string; precio: number; afiliado_30: number; no_afiliado: number; }
interface BeneficioPlan { id: number; beneficio: string; fungevis_basico: string; fungevis_pro: string; fungevis_total: string; }

export default function Reportes() {
  const [tab, setTab] = useState<Tab>('personal');
  const [personal, setPersonal] = useState<PrecioPersonal[]>([]);
  const [eco, setEco] = useState<PrecioEco[]>([]);
  const [rx, setRx] = useState<PrecioRx[]>([]);
  const [planes, setPlanes] = useState<BeneficioPlan[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPersonal(); loadEco(); loadRx(); loadPlanes();
  }, []);

  function loadPersonal() { supabase.from('precios_personal_salud').select('*').order('especialidad').then(r => { if (r.data) setPersonal(r.data as PrecioPersonal[]); }); }
  function loadEco() { supabase.from('precios_ecografias').select('*').order('imagen').then(r => { if (r.data) setEco(r.data as PrecioEco[]); }); }
  function loadRx() { supabase.from('precios_rx').select('*').order('estudio').then(r => { if (r.data) setRx(r.data as PrecioRx[]); }); }
  function loadPlanes() { supabase.from('beneficios_plan').select('*').then(r => { if (r.data) setPlanes(r.data as BeneficioPlan[]); }); }

  function startEdit(row: Record<string, unknown>) {
    setEditingId(row.id as number);
    const vals: Record<string, string> = {};
    for (const [k, v] of Object.entries(row)) vals[k] = String(v ?? '');
    setEditValues(vals);
  }

  function cancelEdit() { setEditingId(null); setEditValues({}); }

  async function saveEdit(table: string, numericFields: string[], reload: () => void) {
    if (!editingId) return;
    setSaving(true);
    const payload: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(editValues)) {
      if (k === 'id') continue;
      payload[k] = numericFields.includes(k) ? (parseFloat(v) || 0) : v;
    }
    const { error } = await supabase.from(table).update(payload).eq('id', editingId);
    setSaving(false);
    if (error) { toast.error('Error al guardar'); return; }
    toast.success('Guardado');
    cancelEdit();
    reload();
  }

  function inp(field: string, type: 'text' | 'number' = 'text', extraCls = '') {
    return (
      <input
        type={type}
        value={editValues[field] ?? ''}
        onChange={e => setEditValues(prev => ({ ...prev, [field]: e.target.value }))}
        step={type === 'number' ? '0.01' : undefined}
        className={`border border-blue-300 rounded px-1 py-0.5 text-sm w-full focus:outline-none focus:border-blue-500 ${extraCls}`}
      />
    );
  }

  function SaveCancel({ table, numFields, reload }: { table: string; numFields: string[]; reload: () => void }) {
    return (
      <div className="flex gap-1 no-print">
        <button onClick={() => saveEdit(table, numFields, reload)} disabled={saving} title="Guardar"
          className="px-2 py-1 text-xs font-bold bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">✓</button>
        <button onClick={cancelEdit} title="Cancelar"
          className="px-2 py-1 text-xs font-bold bg-gray-400 text-white rounded hover:bg-gray-500">✕</button>
      </div>
    );
  }

  function EditBtn({ row }: { row: Record<string, unknown> }) {
    return (
      <button onClick={() => startEdit(row)} title="Editar"
        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">✏</button>
    );
  }

  const TAB_LABELS: Record<Tab, string> = { personal: 'Personal de Salud', eco: 'Ecografías', rx: 'Radiología (RX)', planes: 'Beneficios por Plan' };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-primary">Reportes y Listas de Precios</h1>
        <button onClick={() => window.print()} className="no-print px-4 py-2 rounded-full font-bold text-white text-sm" style={{ backgroundColor: '#2D5A1B' }}>🖨 Imprimir</button>
      </div>

      <div className="card">
        <FungevisHeader />

        <div className="flex gap-1 mb-6 border-b border-gray-200 no-print">
          {(Object.keys(TAB_LABELS) as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); cancelEdit(); }}
              className={`px-4 py-2 text-sm font-semibold rounded-t transition-colors ${tab === t ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {tab === 'personal' && (
          <div>
            <div className="text-center font-bold text-sm mb-3 py-2 rounded" style={{ backgroundColor: '#2D5A1B', color: 'white' }}>
              SERVICIO TOTAL DE SALUD — 30% Afiliado | 10% No Afiliado
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-xs uppercase text-gray-600">
                  <th className="text-left p-2">Especialidad</th>
                  <th className="text-left p-2">Nombre y Apellido</th>
                  <th className="text-left p-2">Título</th>
                  <th className="text-right p-2">Precio $</th>
                  <th className="text-right p-2">Afiliado (30%)</th>
                  <th className="text-right p-2">No Afiliado (10%)</th>
                  <th className="w-16 p-2 no-print"></th>
                </tr>
              </thead>
              <tbody>
                {personal.map(r => (
                  <tr key={r.id} className={`border-t ${editingId === r.id ? 'bg-blue-50' : 'hover:bg-green-50'}`}>
                    {editingId === r.id ? (
                      <>
                        <td className="p-1">{inp('especialidad')}</td>
                        <td className="p-1">{inp('nombre')}</td>
                        <td className="p-1">{inp('titulo', 'text', 'w-16')}</td>
                        <td className="p-1">{inp('precio', 'number', 'w-16 text-right')}</td>
                        <td className="p-1">{inp('afiliado', 'number', 'w-16 text-right')}</td>
                        <td className="p-1">{inp('no_afiliado', 'number', 'w-16 text-right')}</td>
                        <td className="p-1 no-print"><SaveCancel table="precios_personal_salud" numFields={['precio', 'afiliado', 'no_afiliado']} reload={loadPersonal} /></td>
                      </>
                    ) : (
                      <>
                        <td className="p-2">{r.especialidad}</td>
                        <td className="p-2">{r.nombre}</td>
                        <td className="p-2">{r.titulo}</td>
                        <td className="p-2 text-right">$ {r.precio}</td>
                        <td className="p-2 text-right text-green-700">$ {r.afiliado}</td>
                        <td className="p-2 text-right">$ {r.no_afiliado}</td>
                        <td className="p-2 no-print text-center"><EditBtn row={r as unknown as Record<string, unknown>} /></td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'eco' && (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-xs uppercase text-gray-600">
                <th className="text-left p-2">Imagen</th>
                <th className="text-left p-2">Estudio</th>
                <th className="text-right p-2">Precio $</th>
                <th className="text-right p-2">Pago (10%)</th>
                <th className="text-right p-2">Beneficiario (30%)</th>
                <th className="w-16 p-2 no-print"></th>
              </tr>
            </thead>
            <tbody>
              {eco.map(r => (
                <tr key={r.id} className={`border-t ${editingId === r.id ? 'bg-blue-50' : 'hover:bg-green-50'}`}>
                  {editingId === r.id ? (
                    <>
                      <td className="p-1">{inp('imagen', 'text', 'w-24')}</td>
                      <td className="p-1">{inp('estudio')}</td>
                      <td className="p-1">{inp('precio', 'number', 'w-16 text-right')}</td>
                      <td className="p-1">{inp('pago_10', 'number', 'w-16 text-right')}</td>
                      <td className="p-1">{inp('beneficiario_30', 'number', 'w-16 text-right')}</td>
                      <td className="p-1 no-print"><SaveCancel table="precios_ecografias" numFields={['precio', 'pago_10', 'beneficiario_30']} reload={loadEco} /></td>
                    </>
                  ) : (
                    <>
                      <td className="p-2">{r.imagen}</td>
                      <td className="p-2">{r.estudio}</td>
                      <td className="p-2 text-right">$ {r.precio}</td>
                      <td className="p-2 text-right text-green-700">$ {r.pago_10}</td>
                      <td className="p-2 text-right text-green-700">$ {r.beneficiario_30}</td>
                      <td className="p-2 no-print text-center"><EditBtn row={r as unknown as Record<string, unknown>} /></td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'rx' && (
          <div>
            <div className="text-center text-xs font-semibold mb-3 text-gray-500">
              LISTA DE PRECIOS UNIMED 2012 C.A — 70% / 30% Afiliado / 0% No Afiliado
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-xs uppercase text-gray-600">
                  <th className="text-left p-2">Imagen</th>
                  <th className="text-left p-2">Estudio</th>
                  <th className="text-right p-2">Precio $</th>
                  <th className="text-right p-2">Afiliado (30%)</th>
                  <th className="text-right p-2">No Afiliado</th>
                  <th className="w-16 p-2 no-print"></th>
                </tr>
              </thead>
              <tbody>
                {rx.map(r => (
                  <tr key={r.id} className={`border-t ${editingId === r.id ? 'bg-blue-50' : 'hover:bg-green-50'}`}>
                    {editingId === r.id ? (
                      <>
                        <td className="p-1">{inp('imagen', 'text', 'w-24')}</td>
                        <td className="p-1">{inp('estudio')}</td>
                        <td className="p-1">{inp('precio', 'number', 'w-16 text-right')}</td>
                        <td className="p-1">{inp('afiliado_30', 'number', 'w-16 text-right')}</td>
                        <td className="p-1">{inp('no_afiliado', 'number', 'w-16 text-right')}</td>
                        <td className="p-1 no-print"><SaveCancel table="precios_rx" numFields={['precio', 'afiliado_30', 'no_afiliado']} reload={loadRx} /></td>
                      </>
                    ) : (
                      <>
                        <td className="p-2">{r.imagen}</td>
                        <td className="p-2">{r.estudio}</td>
                        <td className="p-2 text-right">$ {r.precio}</td>
                        <td className="p-2 text-right text-green-700">$ {r.afiliado_30}</td>
                        <td className="p-2 text-right">$ {r.no_afiliado}</td>
                        <td className="p-2 no-print text-center"><EditBtn row={r as unknown as Record<string, unknown>} /></td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'planes' && (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#2D5A1B' }} className="text-white text-xs uppercase">
                <th className="text-left p-3">Beneficio</th>
                <th className="text-center p-3">Fungevis Básico</th>
                <th className="text-center p-3">Fungevis Pro</th>
                <th className="text-center p-3">Fungevis Total</th>
                <th className="w-16 p-3 no-print"></th>
              </tr>
            </thead>
            <tbody>
              {planes.map((r, i) => (
                <tr key={r.id} className={`border-t ${editingId === r.id ? 'bg-blue-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  {editingId === r.id ? (
                    <>
                      <td className="p-1">{inp('beneficio')}</td>
                      <td className="p-1">{inp('fungevis_basico', 'text', 'text-center')}</td>
                      <td className="p-1">{inp('fungevis_pro', 'text', 'text-center')}</td>
                      <td className="p-1">{inp('fungevis_total', 'text', 'text-center')}</td>
                      <td className="p-1 no-print"><SaveCancel table="beneficios_plan" numFields={[]} reload={loadPlanes} /></td>
                    </>
                  ) : (
                    <>
                      <td className="p-3 font-medium">{r.beneficio}</td>
                      <td className="p-3 text-center">{r.fungevis_basico}</td>
                      <td className="p-3 text-center">{r.fungevis_pro}</td>
                      <td className="p-3 text-center">{r.fungevis_total}</td>
                      <td className="p-3 no-print text-center"><EditBtn row={r as unknown as Record<string, unknown>} /></td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
