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
          <span className="consulta-calendario" aria-label={formatarDataCompleta(consulta.agendadaPara)}>
            <small>{formatarMes(consulta.agendadaPara)}</small>
            <strong>{formatarDia(consulta.agendadaPara)}</strong>
          </span>
          <div className="consulta-detalhes">
            <strong>{formatarDataCompleta(consulta.agendadaPara)}</strong>
            <span>{formatarHora(consulta.agendadaPara)}{nomesPacientes ? ` · ${nomesPacientes[consulta.pacienteId] ?? consulta.pacienteId}` : ''}</span>
            {consulta.observacoes && <p>{consulta.observacoes}</p>}
          </div>
          <div className="consulta-acoes">
            <span className={`consulta-status status-${consulta.status.toLowerCase()}`}>{rotuloStatus(consulta.status)}</span>
            <SeletorStatusConsulta consulta={consulta} aoAtualizar={aoAtualizar} />
          </div>
        </li>
      ))}
    </ul>
  )
}

function obterData(valor: string) {
  const data = new Date(valor)
  return Number.isNaN(data.getTime()) ? null : data
}

const opcoesFuso = { timeZone: 'America/Sao_Paulo' }

function formatarDia(valor: string) {
  const data = obterData(valor)
  return data ? new Intl.DateTimeFormat('pt-BR', { ...opcoesFuso, day: '2-digit' }).format(data) : '—'
}

function formatarMes(valor: string) {
  const data = obterData(valor)
  return data ? new Intl.DateTimeFormat('pt-BR', { ...opcoesFuso, month: 'short' }).format(data).replace('.', '') : '—'
}

function formatarDataCompleta(valor: string) {
  const data = obterData(valor)
  return data ? new Intl.DateTimeFormat('pt-BR', { ...opcoesFuso, weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(data) : 'Data inválida'
}

function formatarHora(valor: string) {
  const data = obterData(valor)
  return data ? new Intl.DateTimeFormat('pt-BR', { ...opcoesFuso, hour: '2-digit', minute: '2-digit' }).format(data) : ''
}
