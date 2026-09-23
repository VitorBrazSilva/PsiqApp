import { ClienteApi } from '../../shared/api/clienteApi'
import { chaveDeIdempotencia } from '../../shared/idempotencia/chaveDeIdempotencia'
import type { Pagina } from '../pacientes/servicoPacientes'

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
  analiseAtual: AnaliseClinica | null
  ultimaGeracao: GeracaoAnalise | null
  geracaoAtiva: GeracaoAnalise | null
  podeRegenerar: boolean
  motivo: string | null
}

export const servicoAnalises = {
  obterEstado(pacienteId: string, signal?: AbortSignal) {
    return api.requisitar<EstadoAnalise>(`/pacientes/${pacienteId}/estado-analise`, { signal })
  },

  listarGeracoes(pacienteId: string, signal?: AbortSignal, pagina = 0, tamanho = 25) {
    return api.requisitar<Pagina<GeracaoAnalise>>(`/pacientes/${pacienteId}/geracoes-analise?pagina=${pagina}&tamanho=${tamanho}`, { signal })
  },

  obterHistorica(pacienteId: string, analiseId: string, signal?: AbortSignal) {
    return api.requisitar<AnaliseClinica>(`/pacientes/${pacienteId}/analises/${analiseId}`, { signal })
  },

  regenerar(pacienteId: string) {
    return api.requisitar<GeracaoAnalise>(`/pacientes/${pacienteId}/geracoes-analise`, {
      metodo: 'POST',
      chaveDeIdempotencia: chaveDeIdempotencia(),
    })
  },
}
