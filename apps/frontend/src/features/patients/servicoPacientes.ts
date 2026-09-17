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
  items: T[]
  page: number
  size: number
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
    const params = new URLSearchParams({ page: '0', size: String(size) })
    if (q.trim()) params.set('q', q.trim())
    return api.requisitar<Pagina<Paciente>>(`/patients?${params}`, { signal })
  },

  obter(id: string, signal?: AbortSignal) {
    return api.requisitar<Paciente>(`/patients/${id}`, { signal })
  },

  criar(corpo: CriarPaciente) {
    return api.requisitar<Paciente>('/patients', {
      metodo: 'POST',
      corpo,
      chaveDeIdempotencia: chaveDeIdempotencia(),
    })
  },
}
