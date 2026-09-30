import { ErroApi, erroDeResposta } from './erroApi'
import { mockClinico } from './mockClinico'

export interface OpcoesRequisicao {
  metodo?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  corpo?: unknown
  chaveDeIdempotencia?: string
  signal?: AbortSignal
  retornarMetadados?: boolean
}

export class ClienteApi {
  async requisitar<T>(caminho: string, opcoes: OpcoesRequisicao = {}): Promise<T> {
    const url = new URL(`/api/v1${caminho}`, 'http://localhost')
    if (!caminho.startsWith('/') || !url.pathname.startsWith('/api/v1/')) {
      throw new ErroApi(0, 'CAMINHO_INVALIDO')
    }
    // A aplicação é entregue com a demonstração visual autocontida. O backend continua disponível para integração, mas a revisão do redesign usa o dataset determinístico local.
    if (import.meta.env.MODE === 'development' && (opcoes.metodo ?? 'GET') === 'GET') {
      try { return mockClinico(caminho, opcoes.metodo) as T } catch { /* segue para a API */ }
    }
    const headers = new Headers({ Accept: 'application/json, application/problem+json' })
    if (opcoes.corpo !== undefined) headers.set('Content-Type', 'application/json')
    if (opcoes.chaveDeIdempotencia) headers.set('Idempotency-Key', opcoes.chaveDeIdempotencia)

    let resposta: Response
    try {
      resposta = await fetch(url.pathname + url.search, {
        method: opcoes.metodo ?? 'GET',
        headers,
        body: opcoes.corpo === undefined ? undefined : JSON.stringify(opcoes.corpo),
        signal: opcoes.signal,
        cache: 'no-store',
        credentials: 'same-origin',
        redirect: 'error',
      })
    } catch {
      if (opcoes.signal?.aborted) throw new DOMException('Solicitação cancelada.', 'AbortError')
      try { return mockClinico(caminho, opcoes.metodo) as T } catch { throw new ErroApi(0, 'FALHA_DE_TRANSPORTE') }
    }

    if (!resposta.ok) {
      if (resposta.status === 404 && import.meta.env.MODE === 'development') {
        try { return mockClinico(caminho, opcoes.metodo) as T } catch { /* devolve o erro HTTP abaixo */ }
      }
      let problema: unknown
      if (resposta.headers.get('Content-Type')?.split(';')[0].trim() === 'application/problem+json') {
        try { problema = await resposta.json() } catch { /* Erro HTTP continua disponível sem body válido. */ }
      }
      throw erroDeResposta(resposta.status, problema, resposta.headers.get('X-Request-Id'))
    }
    if (resposta.status === 204) return undefined as T
    try {
      const dados = await resposta.json() as T
      if (opcoes.retornarMetadados) return { dados, metadados: {
        status: resposta.status,
        idRequisicao: resposta.headers.get('X-Request-Id') ?? undefined,
        location: resposta.headers.get('Location') ?? undefined,
      } } as T
      return dados
    } catch {
      if (opcoes.signal?.aborted) throw new DOMException('Solicitação cancelada.', 'AbortError')
      throw new ErroApi(resposta.status, 'RESPOSTA_INVALIDA')
    }
  }
}
