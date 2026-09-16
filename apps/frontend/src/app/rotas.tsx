import { Link, Navigate, Route, Routes } from 'react-router'
import { PaginaPacientes } from '../features/patients/PaginaPacientes'
import { PaginaAgenda } from '../features/appointments/PaginaAgenda'
import { PaginaProntuario } from '../features/clinical-records/PaginaProntuario'

export function Rotas() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/pacientes" replace />} />
      <Route path="/pacientes" element={<PaginaPacientes />} />
      <Route path="/agenda" element={<PaginaAgenda />} />
      <Route path="/prontuario" element={<PaginaProntuario />} />
      <Route path="/prontuario/:pacienteId" element={<PaginaProntuario />} />
      <Route path="*" element={
        <section className="painel">
          <h1>Página não encontrada</h1>
          <p>Use a navegação para acessar uma área disponível.</p>
          <Link to="/pacientes">Ir para pacientes</Link>
        </section>
      } />
    </Routes>
  )
}
