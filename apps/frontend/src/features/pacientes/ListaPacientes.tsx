import { Link } from 'react-router'
import { EstadoVazio } from '../../shared/componentes/EstadoVazio'
import type { Paciente } from './servicoPacientes'

export function ListaPacientes({ pacientes, carregando }: { pacientes: Paciente[], carregando: boolean }) {
  if (carregando) return <p className="estado">Buscando pacientes...</p>
  if (!pacientes.length) return <EstadoVazio mensagem="Nenhum paciente encontrado para esta busca." />
  return <ul className="lista lista-pacientes">{pacientes.map(paciente => <li key={paciente.id} className="patient-result">
    <span className="patient-avatar" aria-hidden="true">{paciente.nome.split(/\s+/).slice(0, 2).map(parte => parte[0]).join('').toUpperCase()}</span>
    <span><strong>{paciente.nome}</strong><small>{paciente.email} · CPF {paciente.cpf}</small><small>{paciente.dataNascimento ? `Nascimento ${new Date(`${paciente.dataNascimento}T00:00:00Z`).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}` : 'Nascimento não informado'}</small></span>
    <Link aria-label="Abrir prontuário" className="patient-open" to={`/prontuario/${paciente.id}`}>Abrir prontuário&nbsp; ›</Link>
  </li>)}</ul>
}
