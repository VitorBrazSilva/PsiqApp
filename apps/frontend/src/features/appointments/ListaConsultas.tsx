import { EstadoVazio } from '../../shared/componentes/EstadoVazio'
import { SeletorStatusConsulta } from './SeletorStatusConsulta'
import { rotuloStatus, type Consulta } from './servicoConsultas'

export function ListaConsultas({ consultas, carregando, aoAtualizar, nomesPacientes }: {
  consultas: Consulta[]
  carregando: boolean
  aoAtualizar: (consulta: Consulta) => void
  nomesPacientes?: Record<string, string>
}) {
  if (carregando) return <p className="estado">Carregando agenda...</p>
  if (!consultas.length) return <EstadoVazio mensagem="Nenhuma consulta encontrada para o periodo." />
  return (
    <ul className="lista consultas">
      {consultas.map(consulta => (
        <li key={consulta.id}>
          <div>
            <strong>{formatarDataHora(consulta.agendadaPara)}</strong>
            <span>Paciente: {nomesPacientes?.[consulta.pacienteId] ?? consulta.pacienteId}</span>
            <span>Status: {rotuloStatus(consulta.status)}</span>
            {consulta.observacoes && <p>{consulta.observacoes}</p>}
          </div>
          <SeletorStatusConsulta consulta={consulta} aoAtualizar={aoAtualizar} />
        </li>
      ))}
    </ul>
  )
}

function formatarDataHora(valor: string) {
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return 'Data inválida'
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(data)
}
