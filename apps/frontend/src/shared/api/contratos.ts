export interface Pagina<T> {
  itens: T[]
  pagina: number
  tamanho: number
  total: number
  [campo: string]: unknown
}

export interface MetadadosResposta {
  status: number
  idRequisicao?: string
  location?: string
}

export interface RespostaApi<T> {
  dados: T
  metadados: MetadadosResposta
}

/** Copia o envelope sem reduzir campos adicionados pelo backend. */
export function normalizarPagina<T>(valor: unknown): Pagina<T> {
  if (!valor || typeof valor !== 'object') return { itens: [], pagina: 0, tamanho: 0, total: 0 }
  const origem = valor as Record<string, unknown>
  const itens = Array.isArray(origem.itens) ? origem.itens as T[] : []
  return { ...origem, itens, pagina: numero(origem.pagina), tamanho: numero(origem.tamanho), total: numero(origem.total) }
}

export function normalizarSequencia(valor: Record<string, unknown>): Record<string, unknown> {
  if (valor.sequenciaRequest !== undefined) return valor
  if (valor.sequenciaRequisicao !== undefined) return { ...valor, sequenciaRequest: valor.sequenciaRequisicao }
  return valor
}

function numero(valor: unknown) { return typeof valor === 'number' && Number.isFinite(valor) ? valor : 0 }
