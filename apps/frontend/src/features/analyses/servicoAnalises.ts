import { ClienteApi } from '../../shared/api/clienteApi'
import { chaveDeIdempotencia } from '../../shared/idempotencia/chaveDeIdempotencia'
import type { Pagina } from '../patients/servicoPacientes'

const api = new ClienteApi()

export type EstadoGeracao = 'ENFILEIRADA' | 'EM_EXECUCAO' | 'AGUARDANDO_RETENTATIVA' | 'CONCLUIDA' | 'FALHA'
export type ModoAnalise = 'RESUMO' | 'LONGITUDINAL'

export interface EvidenciaAnalise {
  apelidoRegistro: string
  registroId: string
  campo: 'TEXTO' | 'HUMOR' | 'MEDICAMENTOS'
  citacao: string
}

export interface ItemAnalise {
  texto: string
  natureza: 'RELATO' | 'INTERPRETACAO'
  evidencias: EvidenciaAnalise[]
}

export interface AnaliseClinica {
  id: string
  geracaoId: string
  pacienteId: string
  geradaEm: string
  modo: ModoAnalise
  linhaDoTempo: ItemAnalise[]
  padroes: ItemAnalise[]
  pontosDeAtencao: ItemAnalise[]
  limitacoes: string[]
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
