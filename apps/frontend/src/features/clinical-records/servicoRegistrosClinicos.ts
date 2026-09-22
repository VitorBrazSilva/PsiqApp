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
  geracaoId: string
  geracao: GeracaoAnalise
}

export function ehComplemento(registro: Pick<RegistroClinico, 'tipo'>) {
  return registro.tipo === 'COMPLEMENTO' || registro.tipo === 'COMPLEMENT'
}

export const servicoRegistrosClinicos = {
  listar(pacienteId: string, signal?: AbortSignal) {
    return api.requisitar<Pagina<RegistroClinico>>(`/pacientes/${pacienteId}/registros-clinicos?pagina=0&tamanho=100`, { signal })
  },

  obter(pacienteId: string, registroId: string, signal?: AbortSignal) {
    return api.requisitar<RegistroClinico>(`/pacientes/${pacienteId}/registros-clinicos/${registroId}`, { signal })
  },

  criarParecer(pacienteId: string, dados: CriarRegistroClinico) {
    return api.requisitar<CriarRegistroClinicoResposta>(`/pacientes/${pacienteId}/registros-clinicos`, {
      metodo: 'POST',
      corpo: dados,
      chaveDeIdempotencia: chaveDeIdempotencia(),
    })
  },

  criarComplemento(pacienteId: string, originalId: string, dados: CriarRegistroClinico) {
    return api.requisitar<CriarRegistroClinicoResposta>(`/pacientes/${pacienteId}/registros-clinicos/${originalId}/complementos`, {
      metodo: 'POST',
      corpo: dados,
      chaveDeIdempotencia: chaveDeIdempotencia(),
    })
  },
}
