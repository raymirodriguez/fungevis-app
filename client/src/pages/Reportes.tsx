import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import FungevisHeader from '../components/FungevisHeader';

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

  useEffect(() => {
    supabase.from('precios_personal_salud').select('*').order('especialidad').then(r => { if (r.data) setPersonal(r.data as PrecioPersonal[]); });
    supabase.from('precios_ecografias').select('*').order('imagen').then(r => { if (r.data) setEco(r.data as PrecioEco[]); });
    supabase.from('precios_rx').select('*').order('estudio').then(r => { if (r.data) setRx(r.data as PrecioRx[]); });
    supabase.from('beneficios_plan').select('*').then(r => { if (r.data) setPlanes(r.data as BeneficioPlan[]); });
  }, []);

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
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-semibold rounded-t transition-colors ${tab === t ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {tab === 'personal' && (
          <div>
            <div className="text-center font-bold text-sm mb-3 py-2 rounded" style={{ backgroundColor: '#2D5A1B', color: 'white' }}>SERVICIO TOTAL DE SALUD — 30% Afiliado | 10% No Afiliado</div>
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-100 text-xs uppercase text-gray-600"><th className="text-left p-2">Especialidad</th><th className="text-left p-2">Nombre y Apellido</th><th className="text-left p-2">Título</th><th className="text-right p-2">Precio $</th><th className="text-right p-2">Afiliado (30%)</th><th className="text-right p-2">No Afiliado (10%)</th></tr></thead>
              <tbody>
                {personal.map(r => (
                  <tr key={r.id} className="border-t hover:bg-green-50">
                    <td className="p-2">{r.especialidad}</td><td className="p-2">{r.nombre}</td><td className="p-2">{r.titulo}</td>
                    <td className="p-2 text-right">$ {r.precio}</td><td className="p-2 text-right text-green-700">$ {r.afiliado}</td><td className="p-2 text-right">$ {r.no_afiliado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'eco' && (
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-100 text-xs uppercase text-gray-600"><th className="text-left p-2">Imagen</th><th className="text-left p-2">Estudio</th><th className="text-right p-2">Precio $</th><th className="text-right p-2">Pago (10%)</th><th className="text-right p-2">Beneficiario (30%)</th></tr></thead>
            <tbody>
              {eco.map(r => (
                <tr key={r.id} className="border-t hover:bg-green-50">
                  <td className="p-2">{r.imagen}</td><td className="p-2">{r.estudio}</td>
                  <td className="p-2 text-right">$ {r.precio}</td><td className="p-2 text-right text-green-700">$ {r.pago_10}</td><td className="p-2 text-right text-green-700">$ {r.beneficiario_30}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'rx' && (
          <div>
            <div className="text-center text-xs font-semibold mb-3 text-gray-500">LISTA DE PRECIOS UNIMED 2012 C.A — 70% / 30% Afiliado / 0% No Afiliado</div>
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-100 text-xs uppercase text-gray-600"><th className="text-left p-2">Imagen</th><th className="text-left p-2">Estudio</th><th className="text-right p-2">Precio $</th><th className="text-right p-2">Afiliado (30%)</th><th className="text-right p-2">No Afiliado</th></tr></thead>
              <tbody>
                {rx.map(r => (
                  <tr key={r.id} className="border-t hover:bg-green-50">
                    <td className="p-2">{r.imagen}</td><td className="p-2">{r.estudio}</td>
                    <td className="p-2 text-right">$ {r.precio}</td><td className="p-2 text-right text-green-700">$ {r.afiliado_30}</td><td className="p-2 text-right">$ {r.no_afiliado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'planes' && (
          <table className="w-full text-sm">
            <thead><tr style={{ backgroundColor: '#2D5A1B' }} className="text-white text-xs uppercase"><th className="text-left p-3">Beneficio</th><th className="text-center p-3">Fungevis Básico</th><th className="text-center p-3">Fungevis Pro</th><th className="text-center p-3">Fungevis Total</th></tr></thead>
            <tbody>
              {planes.map((r, i) => (
                <tr key={r.id} className={`border-t ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="p-3 font-medium">{r.beneficio}</td><td className="p-3 text-center">{r.fungevis_basico}</td><td className="p-3 text-center">{r.fungevis_pro}</td><td className="p-3 text-center">{r.fungevis_total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
