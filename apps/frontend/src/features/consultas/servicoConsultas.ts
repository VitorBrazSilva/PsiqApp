import { ClienteApi } from '../../shared/api/clienteApi'
import { chaveDeIdempotencia } from '../../shared/idempotencia/chaveDeIdempotencia'
import type { Pagina } from '../pacientes/servicoPacientes'
import type { EstadoSincronizacaoGoogleAgenda } from './servicoGoogleAgenda'

const api = new ClienteApi()

export type StatusConsulta = 'AGENDADA' | 'REALIZADA' | 'CANCELADA' | 'FALTA'

export interface SincronizacaoGoogleAgenda {
  estado: EstadoSincronizacaoGoogleAgenda
  ultimaTentativa: string | null
}

export interface Consulta {
  id: string
  pacienteId: string
  agendadaPara: string
  status: StatusConsulta
  observacoes: string | null
  criadaEm: string
  statusAlteradoEm: string | null
  sincronizacaoGoogleAgenda?: SincronizacaoGoogleAgenda | null
}

export type GrupoAgendaConsulta = 'PROXIMAS' | 'AGENDADAS_ANTERIORES' | 'REALIZADAS' | 'CANCELADAS' | 'FALTAS'
export interface PaginaAgendaConsultas extends Pagina<Consulta> {
  contagens: Record<GrupoAgendaConsulta, number>
}

export interface CriarConsulta {
  pacienteId: string
  agendadaPara: string
  observacoes: string | null
}

export function rotuloStatus(status: StatusConsulta) {
  return {
    AGENDADA: 'Agendada',
    REALIZADA: 'Realizada',
    CANCELADA: 'Cancelada',
    FALTA: 'Falta',
  }[status]
}

export const servicoConsultas = {
  listarAgenda(filtros: { grupo?: GrupoAgendaConsulta, pacienteId?: string, dataInicial?: string, dataFinal?: string, pagina?: number, tamanho?: number } = {}, signal?: AbortSignal) {
    const params = new URLSearchParams({ grupo: filtros.grupo ?? 'PROXIMAS', pagina: String(filtros.pagina ?? 0), tamanho: String(filtros.tamanho ?? 50) })
    if (filtros.pacienteId) params.set('pacienteId', filtros.pacienteId)
    if (filtros.dataInicial) params.set('dataInicial', filtros.dataInicial)
    if (filtros.dataFinal) params.set('dataFinal', filtros.dataFinal)
    return api.requisitar<PaginaAgendaConsultas>(`/agenda/consultas?${params}`, { signal, usarApiReal: true })
  },

  listar(filtros: { pacienteId?: string, de?: string, ate?: string, pagina?: number, tamanho?: number } = {}, signal?: AbortSignal, opcoes: { usarApiReal?: boolean } = {}) {
    const params = new URLSearchParams({ pagina: String(filtros.pagina ?? 0), tamanho: String(filtros.tamanho ?? 50) })
    if (filtros.pacienteId) params.set('pacienteId', filtros.pacienteId)
    if (filtros.de) params.set('de', filtros.de)
    if (filtros.ate) params.set('ate', filtros.ate)
    return api.requisitar<Pagina<Consulta>>(`/consultas?${params}`, { signal, usarApiReal: opcoes.usarApiReal })
  },

  criar(dados: CriarConsulta, opcoes: { usarApiReal?: boolean } = {}) {
    return api.requisitar<Consulta>(`/pacientes/${dados.pacienteId}/consultas`, {
      metodo: 'POST',
      corpo: { agendadaPara: dados.agendadaPara, observacoes: dados.observacoes },
      chaveDeIdempotencia: chaveDeIdempotencia(),
      usarApiReal: opcoes.usarApiReal,
    })
  },

  atualizarStatus(id: string, status: Exclude<StatusConsulta, 'AGENDADA'>, opcoes: { usarApiReal?: boolean } = {}) {
    return api.requisitar<Consulta>(`/consultas/${id}/status`, {
      metodo: 'POST',
      corpo: { status },
      chaveDeIdempotencia: chaveDeIdempotencia(),
      usarApiReal: opcoes.usarApiReal,
    })
  },
}
