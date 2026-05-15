import React from 'react';

interface FormButtonsProps {
  onSave: () => void;
  onClear: () => void;
  onDelete?: () => void;
  onPrint?: () => void;
  saving?: boolean;
  hasRecord?: boolean;
}

export default function FormButtons({ onSave, onClear, onDelete, onPrint, saving, hasRecord }: FormButtonsProps) {
  const handleDelete = () => {
    if (window.confirm('¿Está seguro que desea eliminar este registro?')) {
      onDelete?.();
    }
  };

  return (
    <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-200 no-print">
      <button onClick={onSave} disabled={saving} className="btn-action">
        {saving ? 'Guardando...' : 'GRABAR'}
      </button>
      <button onClick={onClear} className="btn-action">
        LIMPIAR
      </button>
      {hasRecord && onDelete && (
        <button onClick={handleDelete} className="btn-action" style={{ backgroundColor: '#dc2626' }}>
          ELIMINAR
        </button>
      )}
      {onPrint && (
        <button
          onClick={onPrint ?? (() => window.print())}
          className="px-6 py-2 rounded-full font-bold text-white text-sm"
          style={{ backgroundColor: '#2D5A1B', minWidth: '120px' }}
        >
          🖨 IMPRIMIR
        </button>
      )}
    </div>
  );
}
