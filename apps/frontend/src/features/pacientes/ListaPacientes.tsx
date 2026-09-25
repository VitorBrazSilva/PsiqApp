import { Link } from 'react-router'
import { EstadoVazio } from '../../shared/componentes/EstadoVazio'
import type { Paciente } from './servicoPacientes'

export function ListaPacientes({ pacientes, carregando }: { pacientes: Paciente[], carregando: boolean }) {
  if (carregando) return <p className="estado">Buscando pacientes...</p>
  if (!pacientes.length) return <EstadoVazio mensagem="Nenhum paciente encontrado para esta busca." />
  return <ul className="lista lista-pacientes">{pacientes.map(paciente => <li key={paciente.id}>
    <Link aria-label="Abrir prontuário" className="patient-result" to={`/prontuario/${paciente.id}`}>
      <span className="patient-avatar" aria-hidden="true">{paciente.nome.split(/\s+/).slice(0, 2).map(parte => parte[0]).join('').toUpperCase()}</span>
      <span><strong>{paciente.nome}</strong><small>{idade(paciente.dataNascimento)} anos / {paciente.email}</small></span>
      <span className="patient-open">Abrir prontuário</span>
      <svg className="patient-open-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
    </Link>
  </li>)}</ul>
}

function idade(dataNascimento: string) {
  const nascimento = new Date(`${dataNascimento}T00:00:00Z`)
  const hoje = new Date()
  let anos = hoje.getUTCFullYear() - nascimento.getUTCFullYear()
  const aniversarioAindaNaoChegou = hoje.getUTCMonth() < nascimento.getUTCMonth() || (hoje.getUTCMonth() === nascimento.getUTCMonth() && hoje.getUTCDate() < nascimento.getUTCDate())
  if (aniversarioAindaNaoChegou) anos -= 1
  return anos
}
