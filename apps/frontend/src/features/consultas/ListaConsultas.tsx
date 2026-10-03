import { useState } from 'react'
import { EstadoVazio } from '../../shared/componentes/EstadoVazio'
import { SeletorStatusConsulta } from './SeletorStatusConsulta'
import { rotuloStatus, type Consulta } from './servicoConsultas'
import { servicoGoogleAgenda, type EstadoSincronizacaoGoogleAgenda } from './servicoGoogleAgenda'
import { formatarDataHoraConsulta } from './formatacaoConsulta'

export function ListaConsultas({ consultas, carregando, aoAtualizar, nomesPacientes, usarApiReal = false, visaoProntuario = false }: {
  consultas: Consulta[]
  carregando: boolean
  aoAtualizar: (consulta: Consulta) => void
  nomesPacientes?: Record<string, string>
  usarApiReal?: boolean
  visaoProntuario?: boolean
}) {
  if (carregando) return <p className="estado" role="status">Carregando agenda...</p>
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
            {visaoProntuario ? <strong><time dateTime={consulta.agendadaPara}>{formatarDataHoraConsulta(consulta.agendadaPara)}</time></strong> : <>
              <strong><svg className="appointment-clock" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></svg>{formatarDataCompleta(consulta.agendadaPara)}</strong>
              <span><svg className="appointment-clock" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>{formatarHora(consulta.agendadaPara)}{nomesPacientes ? ` · ${nomesPacientes[consulta.pacienteId] ?? consulta.pacienteId}` : ''}</span>
            </>}
            {consulta.observacoes && <p>{consulta.observacoes}</p>}
            <EstadoSincronizacao consulta={consulta} aoAtualizar={aoAtualizar} />
          </div>
          <div className="consulta-acoes">
            <span className={`consulta-status status-${consulta.status.toLowerCase()}`}>{rotuloStatus(consulta.status)}</span>
            <SeletorStatusConsulta consulta={consulta} aoAtualizar={aoAtualizar} usarApiReal={usarApiReal} />
          </div>
        </li>
      ))}
    </ul>
  )
}

const rotulosSincronizacao: Record<EstadoSincronizacaoGoogleAgenda, string> = {
  SINCRONIZADA: 'Sincronizada com Google Agenda',
  AGUARDANDO_CONEXAO: 'Aguardando conexão com Google Agenda',
  PENDENTE: 'Aguardando sincronização com Google Agenda',
  FALHA: 'Falha ao sincronizar com Google Agenda',
  NAO_APLICAVEL: 'Sem evento Google associado',
}

function EstadoSincronizacao({ consulta, aoAtualizar }: {
  consulta: Consulta
  aoAtualizar: (consulta: Consulta) => void
}) {
  const [tentando, setTentando] = useState(false)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const estado = consulta.sincronizacaoGoogleAgenda?.estado ?? 'NAO_APLICAVEL'

  async function tentarNovamente() {
    setTentando(true)
    setErro('')
    setMensagem('')
    try {
      const atualizada = await servicoGoogleAgenda.tentarSincronizarNovamente(consulta.id)
      aoAtualizar(atualizada)
      setMensagem('Nova tentativa de sincronização solicitada.')
    } catch {
      setErro('Não foi possível solicitar a sincronização. Tente novamente.')
    } finally {
      setTentando(false)
    }
  }

  return (
    <div className="google-agenda-sincronizacao" aria-busy={tentando}>
      <span className={`google-agenda-selo-sincronizacao sync-${estado.toLowerCase()}`}>
        {rotulosSincronizacao[estado]}
      </span>
      {(estado === 'PENDENTE' || estado === 'FALHA') && (
        <button className="google-agenda-tentar" type="button" onClick={() => void tentarNovamente()} disabled={tentando}>
          {tentando ? 'Solicitando...' : 'Tentar sincronizar novamente'}
        </button>
      )}
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{mensagem}</span>
      {erro && <span className="google-agenda-erro-tentativa" role="alert">{erro}</span>}
    </div>
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
