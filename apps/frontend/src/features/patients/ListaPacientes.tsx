import { Link } from 'react-router'
import { EstadoVazio } from '../../shared/componentes/EstadoVazio'
import type { Paciente } from './servicoPacientes'

export function ListaPacientes({ pacientes, carregando }: { pacientes: Paciente[], carregando: boolean }) {
  if (carregando) return <p className="estado">Buscando pacientes...</p>
  if (!pacientes.length) return <EstadoVazio mensagem="Nenhum paciente encontrado para esta busca." />
  return (
    <ul className="lista">
      {pacientes.map(paciente => (
        <li key={paciente.id}>
          <div>
            <strong>{paciente.nome}</strong>
            <span>{paciente.email} - {paciente.cpf}</span>
          </div>
          <Link to={`/prontuario/${paciente.id}`}>Abrir prontuário</Link>
        </li>
      ))}
    </ul>
  )
}
