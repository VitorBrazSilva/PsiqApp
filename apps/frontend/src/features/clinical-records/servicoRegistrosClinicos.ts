import { ClienteApi } from '../../shared/api/clienteApi'
import { chaveDeIdempotencia } from '../../shared/idempotencia/chaveDeIdempotencia'
import type { Pagina } from '../patients/servicoPacientes'
import type { GeracaoAnalise } from '../analyses/servicoAnalises'

const api = new ClienteApi()

export type TipoRegistroClinico = 'ORIGINAL' | 'COMPLEMENTO' | 'COMPLEMENT'

export interface RegistroClinico {
  id: string
  pacienteId: string
  tipo: TipoRegistroClinico
  parecerOriginalId: string | null
  consultaId: string | null
  dataHoraClinica: string
  criadoEm: string
  texto: string
  humor: string | null
  medicamentos: string | null
  revisao: number
}

export interface CriarRegistroClinico {
  texto: string
  humor: string | null
  medicamentos: string | null
  dataHoraClinica: string
  consultaId: string | null
}

export interface CriarRegistroClinicoResposta {
  registro: RegistroClinico
  generationId: string
  geracao: GeracaoAnalise
}

export function ehComplemento(registro: Pick<RegistroClinico, 'tipo'>) {
  return registro.tipo === 'COMPLEMENTO' || registro.tipo === 'COMPLEMENT'
}

export const servicoRegistrosClinicos = {
  listar(pacienteId: string, signal?: AbortSignal) {
    return api.requisitar<Pagina<RegistroClinico>>(`/patients/${pacienteId}/clinical-records?page=0&size=100`, { signal })
  },

  obter(pacienteId: string, registroId: string, signal?: AbortSignal) {
    return api.requisitar<RegistroClinico>(`/patients/${pacienteId}/clinical-records/${registroId}`, { signal })
  },

  criarParecer(pacienteId: string, dados: CriarRegistroClinico) {
    return api.requisitar<CriarRegistroClinicoResposta>(`/patients/${pacienteId}/clinical-records`, {
      metodo: 'POST',
      corpo: dados,
      chaveDeIdempotencia: chaveDeIdempotencia(),
    })
  },

  criarComplemento(pacienteId: string, originalId: string, dados: CriarRegistroClinico) {
    return api.requisitar<CriarRegistroClinicoResposta>(`/patients/${pacienteId}/clinical-records/${originalId}/complements`, {
      metodo: 'POST',
      corpo: dados,
      chaveDeIdempotencia: chaveDeIdempotencia(),
    })
  },
}
