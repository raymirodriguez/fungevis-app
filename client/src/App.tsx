import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import ServicioSaludTotal from './pages/ServicioSaludTotal';
import AtencionPaciente from './pages/AtencionPaciente';
import Beneficiarios from './pages/Beneficiarios';
import CentrosAliados from './pages/CentrosAliados';
import Cobranzas from './pages/Cobranzas';
import PersonalSalud from './pages/PersonalSalud';
import Reportes from './pages/Reportes';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-primary font-bold">Cargando...</div>;
  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/servicios"    element={<PrivateRoute><ServicioSaludTotal /></PrivateRoute>} />
      <Route path="/atencion"     element={<PrivateRoute><AtencionPaciente /></PrivateRoute>} />
      <Route path="/beneficiarios" element={<PrivateRoute><Beneficiarios /></PrivateRoute>} />
      <Route path="/centros"      element={<PrivateRoute><CentrosAliados /></PrivateRoute>} />
      <Route path="/cobranzas"    element={<PrivateRoute><Cobranzas /></PrivateRoute>} />
      <Route path="/personal"     element={<PrivateRoute><PersonalSalud /></PrivateRoute>} />
      <Route path="/reportes"     element={<PrivateRoute><Reportes /></PrivateRoute>} />
      <Route path="*"             element={<Navigate to="/servicios" replace />} />
    </Routes>
  );
}
