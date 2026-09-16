import { ClienteApi } from '../../shared/api/clienteApi'
import { chaveDeIdempotencia } from '../../shared/idempotencia/chaveDeIdempotencia'
import type { Pagina } from '../patients/servicoPacientes'

const api = new ClienteApi()

export type StatusConsulta = 'AGENDADA' | 'REALIZADA' | 'CANCELADA' | 'FALTA'

export interface Consulta {
  id: string
  pacienteId: string
  agendadaPara: string
  status: StatusConsulta
  observacoes: string | null
  criadaEm: string
  statusAlteradoEm: string | null
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
  listar(filtros: { pacienteId?: string, from?: string, to?: string } = {}, signal?: AbortSignal) {
    const params = new URLSearchParams({ page: '0', size: '50' })
    if (filtros.pacienteId) params.set('patientId', filtros.pacienteId)
    if (filtros.from) params.set('from', filtros.from)
    if (filtros.to) params.set('to', filtros.to)
    return api.requisitar<Pagina<Consulta>>(`/appointments?${params}`, { signal })
  },

  criar(dados: CriarConsulta) {
    return api.requisitar<Consulta>(`/patients/${dados.pacienteId}/appointments`, {
      metodo: 'POST',
      corpo: { agendadaPara: dados.agendadaPara, observacoes: dados.observacoes },
      chaveDeIdempotencia: chaveDeIdempotencia(),
    })
  },

  atualizarStatus(id: string, status: Exclude<StatusConsulta, 'AGENDADA'>) {
    return api.requisitar<Consulta>(`/appointments/${id}/status`, {
      metodo: 'POST',
      corpo: { status },
    })
  },
}
