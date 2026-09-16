import { ClienteApi } from '../../shared/api/clienteApi'
import { chaveDeIdempotencia } from '../../shared/idempotencia/chaveDeIdempotencia'
import type { Pagina } from '../patients/servicoPacientes'

const api = new ClienteApi()

export type EstadoGeracao = 'QUEUED' | 'RUNNING' | 'RETRY_WAIT' | 'COMPLETED' | 'FAILED'
export type ModoAnalise = 'SUMMARY_ONLY' | 'LONGITUDINAL'

export interface EvidenciaAnalise {
  recordAlias: string
  registroId: string
  field: 'text' | 'mood' | 'medications'
  quote: string
}

export interface ItemAnalise {
  text: string
  nature: 'REPORTED' | 'INTERPRETATION'
  evidence: EvidenciaAnalise[]
}

export interface AnaliseClinica {
  id: string
  geracaoId: string
  pacienteId: string
  geradaEm: string
  modo: ModoAnalise
  timeline: ItemAnalise[]
  patterns: ItemAnalise[]
  attentionPoints: ItemAnalise[]
  limitations: string[]
}

export interface GeracaoAnalise {
  id: string
  pacienteId: string
  estado: EstadoGeracao
  revisaoSnapshot: number
  sequenciaRequisicao: number
  solicitadaEm: string
  totalRegistros: number
  totalOriginais: number
  totalComplementos: number
  ultimoRegistroClinicoId: string | null
  modo: ModoAnalise
}

export interface EstadoAnalise {
  currentAnalysis: AnaliseClinica | null
  latestGeneration: GeracaoAnalise | null
  activeGeneration: GeracaoAnalise | null
  canRegenerate: boolean
  reason: string | null
}

export const servicoAnalises = {
  obterEstado(pacienteId: string, signal?: AbortSignal) {
    return api.requisitar<EstadoAnalise>(`/patients/${pacienteId}/analysis-state`, { signal })
  },

  listarGeracoes(pacienteId: string, signal?: AbortSignal) {
    return api.requisitar<Pagina<GeracaoAnalise>>(`/patients/${pacienteId}/analysis-generations?page=0&size=25`, { signal })
  },

  regenerar(pacienteId: string) {
    return api.requisitar<GeracaoAnalise>(`/patients/${pacienteId}/analysis-generations`, {
      metodo: 'POST',
      chaveDeIdempotencia: chaveDeIdempotencia(),
    })
  },
}
