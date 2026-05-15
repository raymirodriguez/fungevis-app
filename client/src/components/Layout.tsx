import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { path: '/servicios', label: 'Servicio de Salud Total' },
  { path: '/atencion', label: 'Servicio Atención al Paciente' },
  { path: '/beneficiarios', label: 'Beneficiarios' },
  { path: '/centros', label: 'Centros de Atención Aliadas' },
  { path: '/cobranzas', label: 'Cobranzas' },
  { path: '/personal', label: 'Personal de Salud Fungevis' },
  { path: '/reportes', label: 'Reportes y Listas de Precios' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { username, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`no-print flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-14'}`}
        style={{ backgroundColor: '#2D5A1B' }}
      >
        {/* Logo area */}
        <div className="p-4 border-b border-green-800 flex items-center gap-2">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white text-lg flex-shrink-0">
            ☰
          </button>
          {sidebarOpen && (
            <div>
              <div className="text-white font-black text-lg leading-tight">🌳 FUNGEVIS</div>
              <div className="text-green-300 text-xs">Gestión de Salud</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map((item, i) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-accent text-white font-semibold'
                    : 'text-green-200 hover:bg-green-800 hover:text-white'
                }`
              }
            >
              <span className="flex-shrink-0 w-5 text-center text-xs font-bold">{i + 1}</span>
              {sidebarOpen && <span className="leading-snug">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User area */}
        {sidebarOpen && (
          <div className="p-4 border-t border-green-800">
            <div className="text-green-300 text-xs mb-2">Usuario: {username}</div>
            <button
              onClick={handleLogout}
              className="text-xs text-white bg-green-800 hover:bg-green-700 px-3 py-1.5 rounded w-full"
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}
