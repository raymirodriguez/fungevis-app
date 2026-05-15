import React, { useState } from 'react';
import { supabase } from '../utils/supabase';

interface CILookupProps {
  value: string;
  onChange: (val: string) => void;
  onFound: (data: Record<string, unknown>) => void;
  label?: string;
  placeholder?: string;
}

export default function CILookup({ value, onChange, onFound, label = 'C.I. Titular', placeholder = 'Ej: V-12345678' }: CILookupProps) {
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const lookup = async () => {
    if (!value.trim()) return;
    setLoading(true);
    setNotFound(false);
    try {
      const { data, error } = await supabase
        .from('servicios')
        .select('*')
        .eq('ci_titular', value.trim())
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
      } else {
        onFound(data as Record<string, unknown>);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label className="form-label">{label}</label>
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); setNotFound(false); }}
          onBlur={lookup}
          placeholder={placeholder}
          className="form-input"
        />
        {loading && <span className="text-xs text-gray-500 whitespace-nowrap">Buscando...</span>}
        {notFound && <span className="text-xs text-red-500 whitespace-nowrap">No encontrado</span>}
      </div>
    </div>
  );
}
