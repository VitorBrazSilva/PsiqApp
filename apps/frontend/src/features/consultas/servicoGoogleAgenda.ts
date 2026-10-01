import { ClienteApi } from '../../shared/api/clienteApi'
import type { Consulta } from './servicoConsultas'

const api = new ClienteApi()

export type EstadoConexaoGoogleAgenda =
  | 'NAO_CONFIGURADA'
  | 'NAO_CONECTADA'
  | 'DESCONECTADA'
  | 'CONECTADA'
  | 'INDISPONIVEL'

export type EstadoSincronizacaoGoogleAgenda =
  | 'SINCRONIZADA'
  | 'AGUARDANDO_CONEXAO'
  | 'PENDENTE'
  | 'FALHA'
  | 'NAO_APLICAVEL'

export type EstadoDisponibilidadeGoogleAgenda = 'DISPONIVEL' | 'OCUPADO' | 'INDISPONIVEL'

export interface RespostaEstadoGoogleAgenda {
  estado: EstadoConexaoGoogleAgenda
}

export interface RespostaDisponibilidadeGoogleAgenda {
  estado: EstadoDisponibilidadeGoogleAgenda
  fusoHorario: string
  verificadoEm: string
}

const apiReal = { usarApiReal: true }

export const servicoGoogleAgenda = {
  obterEstado(signal?: AbortSignal) {
    return api.requisitar<RespostaEstadoGoogleAgenda>('/integracoes/google-agenda', { signal, ...apiReal })
  },

  verificarDisponibilidade(agendadaPara: string, signal?: AbortSignal) {
    const parametros = new URLSearchParams({ agendadaPara })
    return api.requisitar<RespostaDisponibilidadeGoogleAgenda>(`/consultas/disponibilidade?${parametros}`, {
      signal,
      ...apiReal,
    })
  },

  desconectar() {
    return api.requisitar<void>('/integracoes/google-agenda/conexao', { metodo: 'DELETE', ...apiReal })
  },

  tentarSincronizarNovamente(consultaId: string) {
    return api.requisitar<Consulta>(`/consultas/${consultaId}/sincronizacao-google/tentar-novamente`, {
      metodo: 'POST',
      ...apiReal,
    })
  },
}

export const URL_CONECTAR_GOOGLE_AGENDA = '/api/v1/integracoes/google-agenda/conectar'
