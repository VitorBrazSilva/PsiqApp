import { ClienteApi } from '../../shared/api/clienteApi'
import { chaveDeIdempotencia } from '../../shared/idempotencia/chaveDeIdempotencia'

const api = new ClienteApi()

export interface Paciente {
  id: string
  nome: string
  cpf: string
  dataNascimento: string
  telefone: string
  email: string
  queixaInicial: string | null
  criadoEm: string
}

export interface Pagina<T> {
  itens: T[]
  pagina: number
  tamanho: number
  total: number
}

export interface CriarPaciente {
  nome: string
  cpf: string
  dataNascimento: string
  telefone: string
  email: string
  queixaInicial: string | null
}

export const servicoPacientes = {
  buscar(q: string, signal?: AbortSignal, size = 25) {
    const params = new URLSearchParams({ pagina: '0', tamanho: String(size) })
    if (q.trim()) params.set('nome', q.trim())
    return api.requisitar<Pagina<Paciente>>(`/pacientes?${params}`, { signal })
  },

  obter(id: string, signal?: AbortSignal) {
    return api.requisitar<Paciente>(`/pacientes/${id}`, { signal })
  },

  criar(corpo: CriarPaciente) {
    return api.requisitar<Paciente>('/pacientes', {
      metodo: 'POST',
      corpo,
      chaveDeIdempotencia: chaveDeIdempotencia(),
    })
  },
}
