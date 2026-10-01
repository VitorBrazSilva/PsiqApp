import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ClienteApi } from './clienteApi'
import { ErroApi } from './erroApi'
import { chaveDeIdempotencia } from '../idempotencia/chaveDeIdempotencia'

const fetchMock = vi.fn<typeof fetch>()
const cliente = new ClienteApi()
const requestId = 'd6b462cb-fbd3-444f-b3e1-fc30d40b0b24'

beforeEach(() => vi.stubGlobal('fetch', fetchMock))
afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('ClienteApi', () => {
  it('permite que a Agenda ignore o mock local e consulte a API no modo de desenvolvimento', async () => {
    vi.stubEnv('MODE', 'development')
    fetchMock.mockResolvedValueOnce(Response.json({ itens: [], pagina: 0, tamanho: 50, total: 0 }))

    await expect(cliente.requisitar('/consultas?pagina=0&tamanho=50', { usarApiReal: true }))
      .resolves.toMatchObject({ itens: [], total: 0 })

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/consultas?pagina=0&tamanho=50', expect.objectContaining({ method: 'GET' }))
  })

  it('retorna JSON e centraliza base, headers e opções de privacidade', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ itens: [] }))
    await expect(cliente.requisitar('/pacientes?pagina=0')).resolves.toEqual({ itens: [] })
    const [url, opcoes] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/v1/pacientes?pagina=0')
    expect(opcoes).toMatchObject({ method: 'GET', cache: 'no-store', credentials: 'same-origin', redirect: 'error' })
    expect(new Headers(opcoes?.headers).get('Accept')).toContain('application/json')
    expect(new Headers(opcoes?.headers).has('Idempotency-Key')).toBe(false)
    expect(new Headers(opcoes?.headers).has('Content-Type')).toBe(false)
  })

  it('envia JSON e reutiliza a chave após falha de transporte sem retry automático', async () => {
    const chave = chaveDeIdempotencia()
    expect(chave).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    const opcoes = { metodo: 'POST' as const, corpo: { name: 'Paciente Fictício' }, chaveDeIdempotencia: chave }
    fetchMock.mockRejectedValueOnce(new TypeError('payload-sensivel-ficticio'))
    await expect(cliente.requisitar('/pacientes', opcoes)).rejects.toMatchObject({ codigo: 'FALHA_DE_TRANSPORTE' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    fetchMock.mockResolvedValueOnce(Response.json({ id: 'ficticio' }, { status: 201 }))
    await expect(cliente.requisitar('/pacientes', opcoes)).resolves.toEqual({ id: 'ficticio' })
    for (const [, chamada] of fetchMock.mock.calls) {
      expect(new Headers(chamada?.headers).get('Idempotency-Key')).toBe(chave)
      expect(new Headers(chamada?.headers).get('Content-Type')).toBe('application/json')
      expect(chamada?.body).toBe(JSON.stringify(opcoes.corpo))
    }
    expect(chaveDeIdempotencia()).not.toBe(chave)
  })

  it('trata Problem Details e descarta texto remoto e valores rejeitados', async () => {
    const sensivel = 'payload-sensivel-ficticio'
    fetchMock.mockResolvedValueOnce(Response.json({
      status: 500, codigo: 'ENTRADA_INVALIDA', idRequisicao: requestId,
      title: sensivel, detail: sensivel, instance: sensivel,
      errosDeCampo: [{ campo: 'name', mensagem: sensivel }],
    }, { status: 400, headers: { 'Content-Type': 'application/problem+json; charset=utf-8' } }))
    const erro = await cliente.requisitar('/pacientes').catch((falha: unknown) => falha)
    expect(erro).toBeInstanceOf(ErroApi)
    expect(erro).toMatchObject({ status: 400, codigo: 'ENTRADA_INVALIDA', idRequisicao: requestId,
      message: 'Verifique os campos informados.', errosDeCampo: [{ campo: 'name' }] })
    expect(String(erro) + JSON.stringify(erro)).not.toContain(sensivel)
  })

  it.each([404, 409, 503, 500])('preserva status %s e request ID sem exibir body de erro', async status => {
    fetchMock.mockResolvedValueOnce(new Response('<html>payload-sensivel-ficticio</html>', {
      status, headers: { 'X-Request-Id': requestId, 'Content-Type': 'text/html' },
    }))
    await expect(cliente.requisitar('/pacientes')).rejects.toMatchObject({ status, idRequisicao: requestId, codigo: 'ERRO_HTTP' })
  })

  it.each(['{', 'null', '[]', '{"codigo":123,"errosDeCampo":[null],"idRequisicao":"invalido"}'])(
    'aceita Problem Details malformado como erro HTTP seguro: %s', async body => {
      fetchMock.mockResolvedValueOnce(new Response(body, { status: 400,
        headers: { 'Content-Type': 'application/problem+json' } }))
      await expect(cliente.requisitar('/pacientes')).rejects.toMatchObject({ status: 400, codigo: 'ERRO_HTTP', errosDeCampo: [] })
    },
  )

  it('aceita sucesso sem conteúdo', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))
    await expect(cliente.requisitar<void>('/pacientes')).resolves.toBeUndefined()
  })

  it('transforma resposta de sucesso inválida em erro seguro', async () => {
    fetchMock.mockResolvedValueOnce(new Response('payload-sensivel-ficticio'))
    await expect(cliente.requisitar('/pacientes')).rejects.toMatchObject({ codigo: 'RESPOSTA_INVALIDA' })
  })

  it('encaminha cancelamento sem expor motivo externo', async () => {
    const controlador = new AbortController()
    controlador.abort('payload-sensivel-ficticio')
    fetchMock.mockRejectedValueOnce(controlador.signal.reason)
    await expect(cliente.requisitar('/pacientes', { signal: controlador.signal }))
      .rejects.toMatchObject({ name: 'AbortError', message: 'Solicitação cancelada.' })
    expect(fetchMock.mock.calls[0][1]?.signal).toBe(controlador.signal)
  })

  it.each(['https://externo.invalid', '/../fora'])('rejeita caminho fora da base: %s', async caminho => {
    await expect(cliente.requisitar(caminho)).rejects.toMatchObject({ codigo: 'CAMINHO_INVALIDO' })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
