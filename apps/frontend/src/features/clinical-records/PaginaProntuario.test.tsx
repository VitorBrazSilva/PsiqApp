import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PaginaProntuario } from './PaginaProntuario'

const fetchMock = vi.fn<typeof fetch>()
const pacienteA = { id: '11111111-1111-4111-8111-111111111111', nome: 'Paciente Atual A', cpf: '***.***.***-09', dataNascimento: '1990-01-01', telefone: '+5511999999999', email: 'a@example.test', queixaInicial: null, criadoEm: '2026-01-01T12:00:00Z' }
const pacienteB = { ...pacienteA, id: '22222222-2222-4222-8222-222222222222', nome: 'Paciente Atual B', email: 'b@example.test' }
const paginaVazia = { items: [], page: 0, size: 25, total: 0 }
const registroOriginal = { id: '33333333-3333-4333-8333-333333333333', pacienteId: pacienteA.id, tipo: 'ORIGINAL', parecerOriginalId: null, consultaId: null, dataHoraClinica: '2026-06-01T15:00:00Z', criadoEm: '2026-06-01T15:01:00Z', texto: 'Paciente fictício relata melhora do sono.', humor: 'estável', medicamentos: 'medicação fictícia mantida', revisao: 1 }
const novoParecer = { ...registroOriginal, id: '34343434-3434-4434-8434-343434343434', texto: 'Novo parecer fictício.', revisao: 3 }
const complemento = { ...registroOriginal, id: '44444444-4444-4444-8444-444444444444', tipo: 'COMPLEMENTO', parecerOriginalId: registroOriginal.id, dataHoraClinica: '2026-06-02T15:00:00Z', criadoEm: '2026-06-02T15:01:00Z', texto: 'Complemento fictício informa contexto adicional.', revisao: 2 }
const geracao = { id: '55555555-5555-4555-8555-555555555555', pacienteId: pacienteA.id, estado: 'QUEUED', revisaoSnapshot: 1, sequenciaRequisicao: 1, solicitadaEm: '2026-06-01T15:02:00Z', totalRegistros: 1, totalOriginais: 1, totalComplementos: 0, ultimoRegistroClinicoId: registroOriginal.id, modo: 'SUMMARY_ONLY' }
const analiseSummary = {
  id: '66666666-6666-4666-8666-666666666666', geracaoId: geracao.id, pacienteId: pacienteA.id, geradaEm: '2026-06-01T15:03:00Z', modo: 'SUMMARY_ONLY',
  timeline: [{ text: 'Resumo validado sem tendência.', nature: 'REPORTED', evidence: [{ recordAlias: 'R1', registroId: registroOriginal.id, field: 'text', quote: 'melhora do sono' }] }],
  patterns: [], attentionPoints: [], limitations: ['Histórico insuficiente para tendência longitudinal.'],
}
const analiseLongitudinal = { ...analiseSummary, modo: 'LONGITUDINAL', patterns: [{ text: 'Padrão observado com evidência fictícia.', nature: 'INTERPRETATION', evidence: [{ recordAlias: 'R1', registroId: registroOriginal.id, field: 'mood', quote: 'estável' }] }] }

function json(body: unknown, init?: ResponseInit) {
  return Response.json(body, init)
}

function renderProntuario(id = pacienteA.id) {
  return render(
    <MemoryRouter initialEntries={[`/prontuario/${id}`]}>
      <Routes><Route path="/prontuario/:pacienteId" element={<PaginaProntuario />} /></Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockImplementation(async (url, opcoes) => {
    if (url === `/api/v1/patients/${pacienteA.id}`) return json(pacienteA)
    if (url === `/api/v1/patients/${pacienteB.id}`) return json(pacienteB)
    if (url === `/api/v1/appointments?page=0&size=50&patientId=${pacienteA.id}`) return json(paginaVazia)
    if (url === `/api/v1/appointments?page=0&size=50&patientId=${pacienteB.id}`) return json(paginaVazia)
    if (url === `/api/v1/patients/${pacienteA.id}/clinical-records?page=0&size=100`) return json({ ...paginaVazia, items: [registroOriginal], total: 1 })
    if (url === `/api/v1/patients/${pacienteB.id}/clinical-records?page=0&size=100`) return json(paginaVazia)
    if (url === `/api/v1/patients/${pacienteA.id}/analysis-state`) return json({ currentAnalysis: analiseSummary, latestGeneration: { ...geracao, estado: 'COMPLETED' }, activeGeneration: null, canRegenerate: true, reason: null })
    if (url === `/api/v1/patients/${pacienteB.id}/analysis-state`) return json({ currentAnalysis: null, latestGeneration: null, activeGeneration: null, canRegenerate: false, reason: 'Sem parecer original.' })
    if (url === `/api/v1/patients/${pacienteA.id}/analysis-generations?page=0&size=25`) return json({ ...paginaVazia, items: [{ ...geracao, estado: 'COMPLETED' }], total: 1 })
    if (url === `/api/v1/patients/${pacienteB.id}/analysis-generations?page=0&size=25`) return json(paginaVazia)
    if (url === `/api/v1/patients/${pacienteA.id}/clinical-records/${registroOriginal.id}`) return json(registroOriginal)
    if (opcoes?.method === 'POST' && url === `/api/v1/patients/${pacienteB.id}/appointments`) return json({ id: '77777777-7777-4777-8777-777777777777', pacienteId: pacienteB.id, agendadaPara: '2026-06-01T15:00:00Z', status: 'AGENDADA', observacoes: null, criadaEm: '2026-01-01T12:00:00Z', statusAlteradoEm: null }, { status: 201 })
    if (opcoes?.method === 'POST' && url === `/api/v1/patients/${pacienteA.id}/clinical-records`) return json({ registro: novoParecer, generationId: geracao.id, geracao }, { status: 201 })
    if (opcoes?.method === 'POST' && url === `/api/v1/patients/${pacienteA.id}/clinical-records/${registroOriginal.id}/complements`) return json({ registro: complemento, generationId: geracao.id, geracao }, { status: 201 })
    if (opcoes?.method === 'POST' && url === `/api/v1/patients/${pacienteA.id}/analysis-generations`) return json(geracao, { status: 202 })
    return json(paginaVazia)
  })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('PaginaProntuario', () => {
  it('cria consulta usando o paciente atual apos navegar entre prontuarios', async () => {
    const usuario = userEvent.setup()
    renderProntuario(pacienteB.id)
    expect(await screen.findByText('Paciente Atual B')).toBeVisible()
    await usuario.type(screen.getByLabelText('Data e hora'), '2026-06-01T12:00')
    await usuario.click(screen.getByRole('button', { name: 'Criar consulta' }))
    expect(await screen.findByText('Paciente: Paciente Atual B')).toBeVisible()
    expect(fetchMock).toHaveBeenCalledWith(`/api/v1/patients/${pacienteB.id}/appointments`, expect.any(Object))
    expect(fetchMock).not.toHaveBeenCalledWith(`/api/v1/patients/${pacienteA.id}/appointments`, expect.any(Object))
  })

  it('exibe timeline com original, registra parecer com idempotencia e cria complemento', async () => {
    const usuario = userEvent.setup()
    renderProntuario()
    expect(await screen.findByText('Paciente fictício relata melhora do sono.')).toBeVisible()
    expect(screen.getAllByText('Estado/humor').length).toBeGreaterThan(0)
    await usuario.click(screen.getByRole('button', { name: 'Salvar parecer' }))
    expect(await screen.findByText('Informe o texto do parecer.')).toBeVisible()
    await usuario.type(screen.getByLabelText('Texto do parecer'), 'Novo parecer fictício.')
    await usuario.click(screen.getByRole('button', { name: 'Salvar parecer' }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(`/api/v1/patients/${pacienteA.id}/clinical-records`, expect.objectContaining({ method: 'POST', headers: expect.any(Headers) })))
    await usuario.click(screen.getAllByRole('button', { name: 'Complementar' }).at(-1)!)
    await usuario.click(screen.getByRole('button', { name: 'Salvar complemento' }))
    expect(await screen.findByText('Informe o texto do complemento.')).toBeVisible()
    await usuario.type(screen.getByLabelText('Texto do complemento'), 'Complemento com dado fictício.')
    await usuario.click(screen.getByRole('button', { name: 'Salvar complemento' }))
    expect(await screen.findByText('Complemento fictício informa contexto adicional.')).toBeVisible()
  }, 10000)

  it('exibe SUMMARY_ONLY sem tendencia falsa, evidencias e fonte do registro', async () => {
    const usuario = userEvent.setup()
    renderProntuario()
    expect(await screen.findByText('Histórico insuficiente para tendência longitudinal.')).toBeVisible()
    expect(screen.getByText('Sem padrões validados para exibição.')).toBeVisible()
    expect(screen.queryByText('Padrão observado com evidência fictícia.')).not.toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Abrir fonte' }))
    expect(await screen.findByLabelText('Fonte da evidência')).toHaveTextContent('Paciente fictício relata melhora do sono.')
  })

  it('exibe LONGITUDINAL com evidencias quando a API retorna padroes validados', async () => {
    fetchMock.mockImplementation(async url => {
      if (url === `/api/v1/patients/${pacienteA.id}`) return json(pacienteA)
      if (url === `/api/v1/appointments?page=0&size=50&patientId=${pacienteA.id}`) return json(paginaVazia)
      if (url === `/api/v1/patients/${pacienteA.id}/clinical-records?page=0&size=100`) return json({ ...paginaVazia, items: [registroOriginal, complemento], total: 2 })
      if (url === `/api/v1/patients/${pacienteA.id}/analysis-state`) return json({ currentAnalysis: analiseLongitudinal, latestGeneration: { ...geracao, estado: 'COMPLETED', modo: 'LONGITUDINAL', totalOriginais: 2 }, activeGeneration: null, canRegenerate: true, reason: null })
      if (url === `/api/v1/patients/${pacienteA.id}/analysis-generations?page=0&size=25`) return json({ ...paginaVazia, items: [{ ...geracao, estado: 'COMPLETED' }], total: 1 })
      return json(paginaVazia)
    })
    renderProntuario()
    expect(await screen.findByText('Padrão observado com evidência fictícia.')).toBeVisible()
    expect(screen.getByText(/Estado\/humor: "estável"/)).toBeVisible()
  })

  it('mantem analise valida anterior em falha e nao sobrescreve formulario em edicao', async () => {
    const usuario = userEvent.setup()
    fetchMock.mockImplementation(async url => {
      if (url === `/api/v1/patients/${pacienteA.id}`) return json(pacienteA)
      if (url === `/api/v1/appointments?page=0&size=50&patientId=${pacienteA.id}`) return json(paginaVazia)
      if (url === `/api/v1/patients/${pacienteA.id}/clinical-records?page=0&size=100`) return json({ ...paginaVazia, items: [registroOriginal], total: 1 })
      if (url === `/api/v1/patients/${pacienteA.id}/analysis-state`) return json({ currentAnalysis: analiseSummary, latestGeneration: { ...geracao, estado: 'FAILED' }, activeGeneration: null, canRegenerate: true, reason: null })
      if (url === `/api/v1/patients/${pacienteA.id}/analysis-generations?page=0&size=25`) return json({ ...paginaVazia, items: [{ ...geracao, estado: 'FAILED' }], total: 1 })
      return json(paginaVazia)
    })
    renderProntuario()
    await usuario.type(await screen.findByLabelText('Texto do parecer'), 'rascunho preservado')
    expect(await screen.findByText('A última geração falhou. A análise válida anterior permanece exibida quando existe.')).toBeVisible()
    expect(screen.getByText('Resumo validado sem tendência.')).toBeVisible()
    expect(screen.getByLabelText('Texto do parecer')).toHaveValue('rascunho preservado')
  })

  it('faz polling somente com geracao ativa e pausa com aba oculta', async () => {
    fetchMock.mockImplementation(async url => {
      if (url === `/api/v1/patients/${pacienteA.id}`) return json(pacienteA)
      if (url === `/api/v1/appointments?page=0&size=50&patientId=${pacienteA.id}`) return json(paginaVazia)
      if (url === `/api/v1/patients/${pacienteA.id}/clinical-records?page=0&size=100`) return json({ ...paginaVazia, items: [registroOriginal], total: 1 })
      if (url === `/api/v1/patients/${pacienteA.id}/analysis-state`) return json({ currentAnalysis: analiseSummary, latestGeneration: geracao, activeGeneration: geracao, canRegenerate: false, reason: 'Geração em andamento.' })
      if (url === `/api/v1/patients/${pacienteA.id}/analysis-generations?page=0&size=25`) return json({ ...paginaVazia, items: [geracao], total: 1 })
      return json(paginaVazia)
    })
    renderProntuario()
    await screen.findByText(/Atualização em andamento/)
    const chamadasIniciais = fetchMock.mock.calls.length
    await new Promise(resolve => setTimeout(resolve, 3100))
    expect(fetchMock.mock.calls.length).toBeGreaterThan(chamadasIniciais)
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    const chamadasAntesOculta = fetchMock.mock.calls.length
    await new Promise(resolve => setTimeout(resolve, 3100))
    expect(fetchMock.mock.calls.length).toBe(chamadasAntesOculta)
    Object.defineProperty(document, 'hidden', { configurable: true, value: false })
    document.dispatchEvent(new Event('visibilitychange'))
    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(chamadasAntesOculta))
  }, 10000)
})
