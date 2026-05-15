import React from 'react';

export default function FungevisHeader() {
  return (
    <div className="print-header mb-4 border-b-2 border-primary pb-3">
      <div className="flex items-center gap-3">
        <div className="text-4xl">🌳</div>
        <div>
          <div className="text-2xl font-black text-primary leading-tight">FUNGEVIS</div>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-widest">
            Fundación Gerontológica Vida y Salud
          </div>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500 grid grid-cols-1 sm:grid-cols-3 gap-1">
        <span>Urb. Daniel Carías, calle 2 entre 2 y 3, Av. la mata, Cabudare.</span>
        <span>Teléfonos: 0251 263 20 72</span>
        <span>Correo: fungevis@gmail.com</span>
      </div>
    </div>
  );
}
