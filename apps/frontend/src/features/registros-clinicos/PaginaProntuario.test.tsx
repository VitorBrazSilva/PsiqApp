import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PaginaProntuario } from './PaginaProntuario'

const fetchMock = vi.fn<typeof fetch>()
const pacienteA = { id: '11111111-1111-4111-8111-111111111111', nome: 'Paciente Atual A', cpf: '***.***.***-09', dataNascimento: '1990-01-01', telefone: '+5511999999999', email: 'a@example.test', queixaInicial: null, criadoEm: '2026-01-01T12:00:00Z' }
const pacienteB = { ...pacienteA, id: '22222222-2222-4222-8222-222222222222', nome: 'Paciente Atual B', email: 'b@example.test' }
const paginaVazia = { itens: [], pagina: 0, tamanho: 25, total: 0 }
const registroOriginal = { id: '33333333-3333-4333-8333-333333333333', pacienteId: pacienteA.id, tipo: 'ORIGINAL', parecerOriginalId: null, consultaId: null, dataHoraClinica: '2026-06-01T15:00:00Z', criadoEm: '2026-06-01T15:01:00Z', texto: 'Paciente fictício relata melhora do sono.', humor: 'estável', medicamentos: 'medicação fictícia mantida', revisao: 1 }
const novoParecer = { ...registroOriginal, id: '34343434-3434-4434-8434-343434343434', texto: 'Novo parecer fictício.', revisao: 3 }
const complemento = { ...registroOriginal, id: '44444444-4444-4444-8444-444444444444', tipo: 'COMPLEMENTO', parecerOriginalId: registroOriginal.id, dataHoraClinica: '2026-06-02T15:00:00Z', criadoEm: '2026-06-02T15:01:00Z', texto: 'Complemento fictício informa contexto adicional.', revisao: 2 }
const geracao = { id: '55555555-5555-4555-8555-555555555555', pacienteId: pacienteA.id, estado: 'ENFILEIRADA', revisaoSnapshot: 1, sequenciaRequisicao: 1, solicitadaEm: '2026-06-01T15:02:00Z', totalRegistros: 1, totalOriginais: 1, totalComplementos: 0, ultimoRegistroClinicoId: registroOriginal.id, modo: 'RESUMO' }
const analiseSummary = {
  id: '66666666-6666-4666-8666-666666666666', geracaoId: geracao.id, pacienteId: pacienteA.id, geradaEm: '2026-06-01T15:03:00Z', modo: 'RESUMO',
  linhaDoTempo: [{ texto: 'Resumo validado sem tendência.', natureza: 'RELATO', evidencias: [{ apelidoRegistro: 'R1', registroId: registroOriginal.id, campo: 'TEXTO', citacao: 'melhora do sono' }] }],
  padroes: [], pontosDeAtencao: [], limitacoes: ['Histórico insuficiente para tendência longitudinal.'],
}
const analiseLongitudinal = { ...analiseSummary, modo: 'LONGITUDINAL', padroes: [{ texto: 'Padrão observado com evidência fictícia.', natureza: 'INTERPRETACAO', evidencias: [{ apelidoRegistro: 'R1', registroId: registroOriginal.id, campo: 'HUMOR', citacao: 'estável' }] }] }

function json(body: unknown, init?: ResponseInit) {
  return Response.json(body, init)
}

const analiseAnteriorId = '88888888-8888-4888-8888-888888888888'
const geracaoAnterior = { ...geracao, id: '99999999-9999-4999-8999-999999999999', analiseId: analiseAnteriorId, solicitadaEm: '2026-05-01T15:02:00Z', estado: 'CONCLUIDA' }
const analiseAnterior = { ...analiseSummary, id: analiseAnteriorId, geracaoId: geracaoAnterior.id, geradaEm: '2026-05-01T15:03:00Z', linhaDoTempo: [{ ...analiseSummary.linhaDoTempo[0], texto: 'Versao historica preservada.' }] }

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
    if (url === `/api/v1/pacientes/${pacienteA.id}`) return json(pacienteA)
    if (url === `/api/v1/pacientes/${pacienteB.id}`) return json(pacienteB)
    if (url === `/api/v1/consultas?pagina=0&tamanho=50&pacienteId=${pacienteA.id}`) return json(paginaVazia)
    if (url === `/api/v1/consultas?pagina=0&tamanho=50&pacienteId=${pacienteB.id}`) return json(paginaVazia)
    if (url === `/api/v1/pacientes/${pacienteA.id}/registros-clinicos?pagina=0&tamanho=100`) return json({ ...paginaVazia, itens: [registroOriginal], total: 1 })
    if (url === `/api/v1/pacientes/${pacienteB.id}/registros-clinicos?pagina=0&tamanho=100`) return json(paginaVazia)
    if (url === `/api/v1/pacientes/${pacienteA.id}/estado-analise`) return json({ analiseAtual: analiseSummary, ultimaGeracao: { ...geracao, estado: 'CONCLUIDA' }, geracaoAtiva: null, podeRegenerar: true, motivo: null })
    if (url === `/api/v1/pacientes/${pacienteB.id}/estado-analise`) return json({ analiseAtual: null, ultimaGeracao: null, geracaoAtiva: null, podeRegenerar: false, motivo: 'Sem parecer original.' })
    if (url === `/api/v1/pacientes/${pacienteA.id}/geracoes-analise?pagina=0&tamanho=25`) return json({ ...paginaVazia, itens: [{ ...geracao, estado: 'CONCLUIDA' }], total: 1 })
    if (url === `/api/v1/pacientes/${pacienteB.id}/geracoes-analise?pagina=0&tamanho=25`) return json(paginaVazia)
    if (url === `/api/v1/pacientes/${pacienteA.id}/registros-clinicos/${registroOriginal.id}`) return json(registroOriginal)
    if (opcoes?.method === 'POST' && url === `/api/v1/pacientes/${pacienteB.id}/consultas`) return json({ id: '77777777-7777-4777-8777-777777777777', pacienteId: pacienteB.id, agendadaPara: '2026-06-01T15:00:00Z', status: 'AGENDADA', observacoes: null, criadaEm: '2026-01-01T12:00:00Z', statusAlteradoEm: null }, { status: 201 })
    if (opcoes?.method === 'POST' && url === `/api/v1/pacientes/${pacienteA.id}/registros-clinicos`) return json({ registro: novoParecer, geracaoId: geracao.id, geracao }, { status: 201 })
    if (opcoes?.method === 'POST' && url === `/api/v1/pacientes/${pacienteA.id}/registros-clinicos/${registroOriginal.id}/complementos`) return json({ registro: complemento, geracaoId: geracao.id, geracao }, { status: 201 })
    if (opcoes?.method === 'POST' && url === `/api/v1/pacientes/${pacienteA.id}/geracoes-analise`) return json(geracao, { status: 202 })
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
    expect(fetchMock).toHaveBeenCalledWith(`/api/v1/pacientes/${pacienteB.id}/consultas`, expect.any(Object))
    expect(fetchMock).not.toHaveBeenCalledWith(`/api/v1/pacientes/${pacienteA.id}/consultas`, expect.any(Object))
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
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(`/api/v1/pacientes/${pacienteA.id}/registros-clinicos`, expect.objectContaining({ method: 'POST', headers: expect.any(Headers) })))
    const abrirComplemento = screen.getAllByRole('button', { name: 'Adicionar complemento' }).at(-1)!
    await usuario.click(abrirComplemento)
    const dialogoComplemento = screen.getByRole('dialog', { name: 'Adicionar complemento' })
    expect(dialogoComplemento).toBeVisible()
    expect(dialogoComplemento).toHaveTextContent('Complemento do parecer de 1 de jun. de 2026. O original será preservado.')
    await usuario.click(screen.getByRole('button', { name: 'Salvar complemento' }))
    expect(await screen.findByText('Informe o texto do complemento.')).toBeVisible()
    await usuario.type(screen.getByRole('textbox', { name: /Texto do complemento/ }), 'Complemento com dado fictício.')
    await usuario.keyboard('{Escape}')
    await waitFor(() => expect((dialogoComplemento as HTMLDialogElement).open).toBe(false))
    expect(abrirComplemento).toHaveFocus()
    await usuario.click(abrirComplemento)
    expect(dialogoComplemento).toBeVisible()
    expect(screen.getByRole('textbox', { name: /Texto do complemento/ })).toHaveValue('Complemento com dado fictício.')
    await usuario.click(screen.getByRole('button', { name: 'Salvar complemento' }))
    expect(await screen.findByText('Complemento fictício informa contexto adicional.')).toBeVisible()
  }, 10000)

  it('exibe SUMMARY_ONLY sem tendencia falsa, evidencias e fonte do registro', async () => {
    const usuario = userEvent.setup()
    renderProntuario()
    expect(await screen.findByText('Histórico insuficiente para tendência longitudinal.')).toBeVisible()
    expect(screen.getByText('Sem padrões validados para exibição.')).toBeVisible()
    expect(screen.queryByText('Padrão observado com evidência fictícia.')).not.toBeInTheDocument()
    const abrirEvidencias = screen.getByRole('button', { name: /evidência desta observação/ })
    await usuario.click(abrirEvidencias)
    const dialogoEvidencias = await screen.findByRole('dialog', { name: 'Evidências desta observação' })
    expect(dialogoEvidencias).toBeVisible()
    expect(await screen.findByRole('heading', { name: 'Parecer de 01/06/2026, 12:00' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'R1' })).not.toBeInTheDocument()
    expect(dialogoEvidencias.querySelector('.observation-context')).toHaveClass('observation-context')
    expect(dialogoEvidencias.querySelector('.source-excerpt')).toHaveClass('source-excerpt')
    expect(screen.getByRole('button', { name: 'Fechar evidências' })).toHaveFocus()
    await usuario.keyboard('{Escape}')
    await waitFor(() => expect((dialogoEvidencias as HTMLDialogElement).open).toBe(false))
    expect(abrirEvidencias).toHaveFocus()
    await usuario.click(abrirEvidencias)
    await usuario.click(screen.getByRole('button', { name: /Abrir registro completo/ }))
    const fonte = await screen.findByRole('dialog', { name: 'Registro de origem' })
    expect(fonte).toHaveTextContent('Paciente Atual A / Parecer de 1 de jun. de 2026')
    expect(fonte).toHaveTextContent('Texto original do médico')
    expect(fonte.querySelector('.source-full-text')).toHaveTextContent('Paciente fictício relata melhora do sono.')
    expect(fonte.querySelector('mark')).toHaveTextContent('melhora do sono')
    await usuario.click(screen.getByRole('button', { name: 'Voltar às evidências desta observação' }))
    expect(await screen.findByRole('dialog', { name: 'Evidências desta observação' })).toBeVisible()
    await usuario.click(screen.getByRole('button', { name: /Abrir registro completo/ }))
    await screen.findByRole('dialog', { name: 'Registro de origem' })
    await usuario.click(screen.getByRole('button', { name: /Abrir no histórico/ }))
    expect(await screen.findByRole('button', { name: /Histórico clínico/ })).toHaveAttribute('aria-current', 'page')
    expect(document.getElementById(`registro-${registroOriginal.id}`)).toHaveClass('is-destaque')
  })

  it('exibe LONGITUDINAL com evidencias quando a API retorna padroes validados', async () => {
    const usuario = userEvent.setup()
    fetchMock.mockImplementation(async url => {
      if (url === `/api/v1/pacientes/${pacienteA.id}`) return json(pacienteA)
      if (url === `/api/v1/consultas?pagina=0&tamanho=50&pacienteId=${pacienteA.id}`) return json(paginaVazia)
      if (url === `/api/v1/pacientes/${pacienteA.id}/registros-clinicos?pagina=0&tamanho=100`) return json({ ...paginaVazia, itens: [registroOriginal, complemento], total: 2 })
      if (url === `/api/v1/pacientes/${pacienteA.id}/registros-clinicos/${registroOriginal.id}`) return json(registroOriginal)
      if (url === `/api/v1/pacientes/${pacienteA.id}/estado-analise`) return json({ analiseAtual: analiseLongitudinal, ultimaGeracao: { ...geracao, estado: 'CONCLUIDA', modo: 'LONGITUDINAL', totalOriginais: 2 }, geracaoAtiva: null, podeRegenerar: true, motivo: null })
      if (url === `/api/v1/pacientes/${pacienteA.id}/geracoes-analise?pagina=0&tamanho=25`) return json({ ...paginaVazia, itens: [{ ...geracao, estado: 'CONCLUIDA' }], total: 1 })
      return json(paginaVazia)
    })
    renderProntuario()
    expect(await screen.findByText('Padrão observado com evidência fictícia.')).toBeVisible()
    await usuario.click(screen.getAllByRole('button', { name: /evidência desta observação/ }).at(-1)!)
    await usuario.click(screen.getByRole('button', { name: /Abrir registro completo/ }))
    const fonte = await screen.findByRole('dialog', { name: 'Registro de origem' })
    expect(fonte).toHaveTextContent('Estado/humor')
    expect(fonte.querySelector('mark')).toHaveTextContent('estável')
  })

  it('mostra ícones nas seções e abre a aba de análise pelo link do painel', async () => {
    const usuario = userEvent.setup()
    renderProntuario()
    expect(await screen.findByText('Análise longitudinal')).toBeVisible()
    const grupos = document.querySelectorAll<HTMLDetailsElement>('.analise-secao .analysis-group')
    expect(grupos).toHaveLength(3)
    expect(document.querySelectorAll('.analysis-group summary .analysis-icon[aria-hidden="true"]')).toHaveLength(3)

    await usuario.click(screen.getByRole('button', { name: /Abrir análise e histórico/ }))
    expect(screen.getByRole('button', { name: 'Análise de IA' })).toHaveAttribute('aria-current', 'page')
    expect([...grupos].every(grupo => grupo.open)).toBe(true)
    expect(screen.queryByRole('button', { name: /Abrir análise e histórico/ })).not.toBeInTheDocument()
  })

  it('mantem analise valida anterior em falha e nao sobrescreve formulario em edicao', async () => {
    const usuario = userEvent.setup()
    fetchMock.mockImplementation(async url => {
      if (url === `/api/v1/pacientes/${pacienteA.id}`) return json(pacienteA)
      if (url === `/api/v1/consultas?pagina=0&tamanho=50&pacienteId=${pacienteA.id}`) return json(paginaVazia)
      if (url === `/api/v1/pacientes/${pacienteA.id}/registros-clinicos?pagina=0&tamanho=100`) return json({ ...paginaVazia, itens: [registroOriginal], total: 1 })
      if (url === `/api/v1/pacientes/${pacienteA.id}/estado-analise`) return json({ analiseAtual: analiseSummary, ultimaGeracao: { ...geracao, estado: 'FALHA' }, geracaoAtiva: null, podeRegenerar: true, motivo: null })
      if (url === `/api/v1/pacientes/${pacienteA.id}/geracoes-analise?pagina=0&tamanho=25`) return json({ ...paginaVazia, itens: [{ ...geracao, estado: 'FALHA' }], total: 1 })
      return json(paginaVazia)
    })
    renderProntuario()
    await usuario.type(await screen.findByLabelText('Texto do parecer'), 'rascunho preservado')
    expect(await screen.findByText('A última geração falhou. A análise válida anterior permanece exibida quando existe.')).toBeVisible()
    await usuario.click(screen.getByText('Linha do tempo resumida'))
    expect(screen.getByText('Resumo validado sem tendência.')).toBeVisible()
    expect(screen.getByLabelText('Texto do parecer')).toHaveValue('rascunho preservado')
  })

  it('opens preserved AI analysis versions and returns to current version', async () => {
    const usuario = userEvent.setup()
    fetchMock.mockImplementation(async url => {
      if (url === `/api/v1/pacientes/${pacienteA.id}`) return json(pacienteA)
      if (url === `/api/v1/consultas?pagina=0&tamanho=50&pacienteId=${pacienteA.id}`) return json(paginaVazia)
      if (url === `/api/v1/pacientes/${pacienteA.id}/registros-clinicos?pagina=0&tamanho=100`) return json({ ...paginaVazia, itens: [registroOriginal], total: 1 })
      if (url === `/api/v1/pacientes/${pacienteA.id}/estado-analise`) return json({ analiseAtual: analiseSummary, ultimaGeracao: { ...geracao, estado: 'CONCLUIDA', analiseId: analiseSummary.id }, geracaoAtiva: null, podeRegenerar: true, motivo: null })
      if (url === `/api/v1/pacientes/${pacienteA.id}/geracoes-analise?pagina=0&tamanho=25`) return json({ ...paginaVazia, itens: [{ ...geracao, estado: 'CONCLUIDA', analiseId: analiseSummary.id }, geracaoAnterior], total: 2 })
      if (url === `/api/v1/pacientes/${pacienteA.id}/analises/${analiseAnteriorId}`) return json(analiseAnterior)
      return json(paginaVazia)
    })
    render(<MemoryRouter initialEntries={[`/prontuario/${pacienteA.id}?secao=analise`]}><Routes><Route path="/prontuario/:pacienteId" element={<PaginaProntuario />} /></Routes></MemoryRouter>)
    await usuario.click(await screen.findByRole('button', { name: /Ver hist/ }))
    expect(await screen.findByRole('dialog', { name: /Hist/ })).toBeVisible()
    await usuario.click(screen.getByRole('button', { name: /Abrir vers/ }))
    expect(await screen.findByText('Versao historica preservada.')).toBeVisible()
    expect(fetchMock).toHaveBeenCalledWith(`/api/v1/pacientes/${pacienteA.id}/analises/${analiseAnteriorId}`, expect.any(Object))
    await usuario.click(screen.getByRole('button', { name: /Voltar/ }))
    expect(await screen.findByText(/Resumo validado sem tend/)).toBeVisible()
  })

  it('faz polling somente com geracao ativa e pausa com aba oculta', async () => {
    fetchMock.mockImplementation(async url => {
      if (url === `/api/v1/pacientes/${pacienteA.id}`) return json(pacienteA)
      if (url === `/api/v1/consultas?pagina=0&tamanho=50&pacienteId=${pacienteA.id}`) return json(paginaVazia)
      if (url === `/api/v1/pacientes/${pacienteA.id}/registros-clinicos?pagina=0&tamanho=100`) return json({ ...paginaVazia, itens: [registroOriginal], total: 1 })
      if (url === `/api/v1/pacientes/${pacienteA.id}/estado-analise`) return json({ analiseAtual: analiseSummary, ultimaGeracao: geracao, geracaoAtiva: geracao, podeRegenerar: false, motivo: 'Geração em andamento.' })
      if (url === `/api/v1/pacientes/${pacienteA.id}/geracoes-analise?pagina=0&tamanho=25`) return json({ ...paginaVazia, itens: [geracao], total: 1 })
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
