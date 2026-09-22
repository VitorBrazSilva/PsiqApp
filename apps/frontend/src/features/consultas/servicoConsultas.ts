import { ClienteApi } from '../../shared/api/clienteApi'
import { chaveDeIdempotencia } from '../../shared/idempotencia/chaveDeIdempotencia'
import type { Pagina } from '../pacientes/servicoPacientes'

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
  listar(filtros: { pacienteId?: string, de?: string, ate?: string } = {}, signal?: AbortSignal) {
    const params = new URLSearchParams({ pagina: '0', tamanho: '50' })
    if (filtros.pacienteId) params.set('pacienteId', filtros.pacienteId)
    if (filtros.de) params.set('de', filtros.de)
    if (filtros.ate) params.set('ate', filtros.ate)
    return api.requisitar<Pagina<Consulta>>(`/consultas?${params}`, { signal })
  },

  criar(dados: CriarConsulta) {
    return api.requisitar<Consulta>(`/pacientes/${dados.pacienteId}/consultas`, {
      metodo: 'POST',
      corpo: { agendadaPara: dados.agendadaPara, observacoes: dados.observacoes },
      chaveDeIdempotencia: chaveDeIdempotencia(),
    })
  },

  atualizarStatus(id: string, status: Exclude<StatusConsulta, 'AGENDADA'>) {
    return api.requisitar<Consulta>(`/consultas/${id}/status`, {
      metodo: 'POST',
      corpo: { status },
    })
  },
}
