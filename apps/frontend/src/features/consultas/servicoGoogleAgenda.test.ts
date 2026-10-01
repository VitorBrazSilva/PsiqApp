import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { servicoGoogleAgenda } from './servicoGoogleAgenda'

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => vi.stubGlobal('fetch', fetchMock))
afterEach(() => vi.unstubAllGlobals())

describe('servicoGoogleAgenda', () => {
  it('consulta somente o estado seguro da conexão', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ estado: 'CONECTADA' }))

    await expect(servicoGoogleAgenda.obterEstado()).resolves.toEqual({ estado: 'CONECTADA' })
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/integracoes/google-agenda', expect.objectContaining({ method: 'GET' }))
  })

  it('envia a data candidata e recebe somente o estado de disponibilidade', async () => {
    const instante = '2026-05-01T15:00:00.000Z'
    const resposta = { estado: 'DISPONIVEL', fusoHorario: 'America/Sao_Paulo', verificadoEm: instante }
    fetchMock.mockResolvedValueOnce(Response.json(resposta))

    await expect(servicoGoogleAgenda.verificarDisponibilidade(instante)).resolves.toEqual(resposta)
    expect(fetchMock.mock.calls[0][0]).toBe(`/api/v1/consultas/disponibilidade?agendadaPara=${encodeURIComponent(instante)}`)
  })

  it('desconecta por DELETE sem enviar ou receber credenciais', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))

    await expect(servicoGoogleAgenda.desconectar()).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/integracoes/google-agenda/conexao', expect.objectContaining({ method: 'DELETE' }))
  })

  it('solicita nova tentativa da consulta sem dados adicionais', async () => {
    const consulta = { id: 'consulta-ficticia', sincronizacaoGoogleAgenda: { estado: 'PENDENTE', ultimaTentativa: null } }
    fetchMock.mockResolvedValueOnce(Response.json(consulta, { status: 202 }))

    await expect(servicoGoogleAgenda.tentarSincronizarNovamente('consulta-ficticia')).resolves.toEqual(consulta)
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/consultas/consulta-ficticia/sincronizacao-google/tentar-novamente', expect.objectContaining({ method: 'POST', body: undefined }))
  })
})
