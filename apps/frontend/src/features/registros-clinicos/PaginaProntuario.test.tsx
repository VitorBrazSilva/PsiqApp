import { disponibilidadeTeste } from '../../test/disponibilidadeTeste'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router'
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
      <Routes><Route path="/prontuario/:pacienteId" element={<><PaginaProntuario /><NavegacaoProntuarioTeste /></>} /></Routes>
    </MemoryRouter>,
  )
}

function NavegacaoProntuarioTeste() {
  const navegar = useNavigate()
  return <button type="button" onClick={() => navegar(`/prontuario/${pacienteB.id}?secao=consultas`)}>Trocar paciente teste</button>
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockImplementation(async (url, opcoes) => {
    if (String(url).startsWith('/api/v1/consultas/disponibilidade/mensal')) return json(disponibilidadeTeste)
    if (url === '/api/v1/integracoes/google-agenda') return json({ estado: 'NAO_CONFIGURADA' })
    if (url === `/api/v1/pacientes/${pacienteA.id}`) return json(pacienteA)
    if (url === `/api/v1/pacientes/${pacienteB.id}`) return json(pacienteB)
    if (url === `/api/v1/consultas?pagina=0&tamanho=50&pacienteId=${pacienteA.id}`) return json(paginaVazia)
    if (url === `/api/v1/consultas?pagina=0&tamanho=50&pacienteId=${pacienteB.id}`) return json(paginaVazia)
    if (url.toString().startsWith('/api/v1/agenda/consultas?')) {
      const consultasMock = url.toString().includes(`pacienteId=${pacienteB.id}`) ? [{ id: '77777777-7777-4777-8777-777777777777', pacienteId: pacienteB.id, agendadaPara: '2026-06-01T15:00:00Z', status: 'AGENDADA', observacoes: null, criadaEm: '2026-01-01T12:00:00Z', statusAlteradoEm: null }] : []
      return json({ ...paginaVazia, itens: consultasMock, total: consultasMock.length, contagens: { PROXIMAS: consultasMock.length, AGENDADAS_ANTERIORES: 0, REALIZADAS: 0, CANCELADAS: 0, FALTAS: 0 } })
    }
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
  it('compartilha próxima consulta com histórico e mantém resumo completo após filtros e atualização de status', async () => {
    const padrao = fetchMock.getMockImplementation()!
    const proxima = { id: 'consulta-proxima-ficticia', pacienteId: pacienteA.id, agendadaPara: '2099-09-24T17:30:00Z',
      status: 'AGENDADA', observacoes: 'Sessão de acompanhamento fictícia.', criadaEm: '2026-09-01T12:00:00Z', statusAlteradoEm: null }
    const anterior = { ...proxima, id: 'consulta-anterior-ficticia', status: 'REALIZADA', agendadaPara: '2026-09-10T17:30:00Z' }
    let realizada = false
    fetchMock.mockImplementation(async (url, opcoes) => {
      if (String(url).startsWith('/api/v1/agenda/consultas?')) {
        const parametros = new URL(String(url), 'http://localhost').searchParams
        const tamanho = Number(parametros.get('tamanho'))
        const itens = parametros.get('grupo') === 'REALIZADAS'
          ? (realizada ? [{ ...proxima, status: 'REALIZADA' }, anterior] : [anterior])
          : (realizada ? [] : [proxima])
        return json({ ...paginaVazia, tamanho, itens: itens.slice(0, tamanho), total: itens.length,
          contagens: { PROXIMAS: realizada ? 0 : 1, AGENDADAS_ANTERIORES: 0, REALIZADAS: realizada ? 2 : 1, CANCELADAS: 0, FALTAS: 0 } })
      }
      if (url === `/api/v1/consultas/${proxima.id}/status` && opcoes?.method === 'POST') {
        realizada = true
        return json({ ...proxima, status: 'REALIZADA' })
      }
      return padrao(url, opcoes)
    })
    const usuario = userEvent.setup()
    renderProntuario()
    const contextoHistorico = await screen.findByRole('region', { name: 'Próxima consulta' })
    const dataHora = contextoHistorico.querySelector('time')!.textContent
    await usuario.click(within(contextoHistorico).getByRole('link', { name: /Ver consultas/ }))
    expect(screen.getByRole('region', { name: 'Próxima consulta' }).querySelector('time')).toHaveTextContent(dataHora!)
    const resumo = screen.getByRole('complementary', { name: 'Resumo das consultas' })
    expect(resumo.querySelector('data')).toHaveTextContent('2')
    expect(resumo).toHaveTextContent('10 de set. de 2026 às 14:30')
    await usuario.click(screen.getByRole('button', { name: /^Realizadas/ }))
    await waitFor(() => expect(screen.getByRole('region', { name: 'Consultas de Paciente' }).querySelector('.lista.consultas time')).toHaveTextContent('10 de set. de 2026 às 14:30'))
    expect(resumo.querySelector('data')).toHaveTextContent('2')
    expect(resumo).toHaveTextContent(dataHora!)
    await usuario.click(screen.getByRole('button', { name: /^Próximas/ }))
    await usuario.click(await screen.findByRole('button', { name: 'Realizada' }))
    await waitFor(() => expect(resumo).toHaveTextContent('Nenhuma consulta agendada.'))
    expect(resumo.querySelector('data')).toHaveTextContent('2')
    expect(resumo.querySelector('time')).toHaveTextContent(dataHora!)
    expect(screen.queryByRole('region', { name: 'Próxima consulta' })).not.toBeInTheDocument()
  })
  it('renova o resumo de consultas do paciente ao retornar à janela e remove o listener ao desmontar', async () => {
    const { unmount } = renderProntuario()
    await screen.findByText(pacienteA.nome, { selector: 'h1' })
    const leiturasResumo = () => fetchMock.mock.calls.filter(([url]) => String(url).startsWith('/api/v1/agenda/consultas?') && String(url).includes('tamanho=1')).length
    await waitFor(() => expect(leiturasResumo()).toBeGreaterThan(0))
    const antes = leiturasResumo()
    fireEvent.focus(window)
    await waitFor(() => expect(leiturasResumo()).toBeGreaterThan(antes))
    unmount()
    const depois = leiturasResumo()
    fireEvent.focus(window)
    expect(leiturasResumo()).toBe(depois)
  })
  it('fecha agendamento e descarta disponibilidade de A atrasada ao navegar para B', async () => {
    const padrao = fetchMock.getMockImplementation()!
    let concluirA: ((resposta: Response) => void) | undefined
    let numero = 0
    fetchMock.mockImplementation((url, opcoes) => {
      if (String(url).includes('/disponibilidade/mensal') && numero++ === 0) return new Promise(resolve => { concluirA = resolve })
      return padrao(url, opcoes)
    })
    const usuario = userEvent.setup()
    renderProntuario()
    await usuario.click(await screen.findByRole('button', { name: 'Agendar consulta' }))
    await waitFor(() => expect(concluirA).toBeDefined())
    await usuario.click(screen.getByRole('button', { name: 'Trocar paciente teste' }))
    expect(await screen.findByRole('heading', { name: 'Paciente Atual B' })).toBeVisible()
    expect(screen.queryByRole('dialog', { name: 'Agendar consulta' })).not.toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Agendar consulta' }))
    await screen.findByRole('button', { name: /3 de outubro.*dispon/ })
    concluirA?.(json({ ...disponibilidadeTeste, dias: [] }))
    expect(screen.getByRole('button', { name: /3 de outubro.*dispon/ })).toBeEnabled()
    const dialogo = screen.getByRole('dialog', { name: 'Agendar consulta' })
    expect(dialogo).toHaveTextContent('Paciente Atual B')
    expect(dialogo).toHaveTextContent('b@example.test')
    expect(dialogo).not.toHaveTextContent('Paciente Atual A')
    expect(dialogo).not.toHaveTextContent(pacienteA.email)
  })

  it('não aplica criação de A concluída depois da troca de rota para B', async () => {
    const padrao = fetchMock.getMockImplementation()!
    let concluir: ((resposta: Response) => void) | undefined
    fetchMock.mockImplementation((url, opcoes) => {
      if (opcoes?.method === 'POST' && String(url) === `/api/v1/pacientes/${pacienteA.id}/consultas`) return new Promise(resolve => { concluir = resolve })
      return padrao(url, opcoes)
    })
    const usuario = userEvent.setup()
    renderProntuario()
    await usuario.click(await screen.findByRole('button', { name: 'Agendar consulta' }))
    await usuario.click(await screen.findByRole('button', { name: /3 de outubro.*dispon/ }))
    await usuario.click(screen.getByRole('radio', { name: '09:00' }))
    await usuario.click(screen.getByRole('button', { name: 'Confirmar agendamento' }))
    await usuario.click(screen.getByRole('button', { name: 'Trocar paciente teste' }))
    await screen.findByRole('heading', { name: 'Paciente Atual B' })
    const chamada = fetchMock.mock.calls.find(([url, opcoes]) => opcoes?.method === 'POST' && String(url).includes('/consultas'))!
    expect(chamada[1]?.signal?.aborted).toBe(true)
    concluir?.(json({ pacienteId: pacienteA.id, id: 'consulta-a-tardia' }))
    await waitFor(() => expect(screen.queryByText('consulta-a-tardia')).not.toBeInTheDocument())
    expect(screen.queryByRole('dialog', { name: 'Agendar consulta' })).not.toBeInTheDocument()
  })

  it('descarta resposta atrasada de consultas ao trocar de paciente', async () => {
    let resolverAgendaA: ((resposta: Response) => void) | undefined
    fetchMock.mockImplementation(async url => {
      if (url === `/api/v1/pacientes/${pacienteA.id}`) return json(pacienteA)
      if (url === `/api/v1/pacientes/${pacienteB.id}`) return json(pacienteB)
      if (url.toString().startsWith('/api/v1/agenda/consultas?') && url.toString().includes(`pacienteId=${pacienteA.id}`)) {
        return new Promise<Response>(resolve => { resolverAgendaA = resolve })
      }
      if (url.toString().startsWith('/api/v1/agenda/consultas?')) return json({ ...paginaVazia, contagens: { PROXIMAS: 0, AGENDADAS_ANTERIORES: 0, REALIZADAS: 0, CANCELADAS: 0, FALTAS: 0 } })
      if (url === `/api/v1/pacientes/${pacienteA.id}/registros-clinicos?pagina=0&tamanho=100`) return json({ ...paginaVazia, itens: [registroOriginal], total: 1 })
      if (url === `/api/v1/pacientes/${pacienteB.id}/registros-clinicos?pagina=0&tamanho=100`) return json(paginaVazia)
      if (url === `/api/v1/pacientes/${pacienteA.id}/estado-analise`) return json({ analiseAtual: null, ultimaGeracao: null, geracaoAtiva: null, podeRegenerar: false, motivo: null })
      if (url === `/api/v1/pacientes/${pacienteB.id}/estado-analise`) return json({ analiseAtual: null, ultimaGeracao: null, geracaoAtiva: null, podeRegenerar: false, motivo: null })
      if (url.toString().includes('/geracoes-analise')) return json(paginaVazia)
      return json(paginaVazia)
    })
    const usuario = userEvent.setup()
    renderProntuario()
    expect(await screen.findByText('Paciente fictício relata melhora do sono.')).toBeVisible()
    await usuario.click(screen.getByRole('button', { name: 'Trocar paciente teste' }))
    expect(await screen.findByRole('heading', { name: 'Paciente Atual B' })).toBeVisible()
    resolverAgendaA?.(json({ ...paginaVazia, itens: [{ id: 'consulta-paciente-a', pacienteId: pacienteA.id, agendadaPara: '2026-06-01T15:00:00Z', status: 'AGENDADA', observacoes: null, criadaEm: '2026-01-01T12:00:00Z', statusAlteradoEm: null }], contagens: { PROXIMAS: 1, AGENDADAS_ANTERIORES: 0, REALIZADAS: 0, CANCELADAS: 0, FALTAS: 0 } }))
    expect(await screen.findByText('Nenhuma consulta encontrada para o periodo.')).toBeVisible()
    expect(screen.queryByText('Paciente Atual A')).not.toBeInTheDocument()
  })

  it('mantém dados clínicos carregados e identifica falha ao buscar consultas', async () => {
    const respostaPadrao = fetchMock.getMockImplementation()
    fetchMock.mockImplementation(async (url, opcoes) => {
      if (url.toString().startsWith('/api/v1/agenda/consultas?')) return json({ title: 'Erro fictício' }, { status: 503 })
      return respostaPadrao!(url, opcoes)
    })
    renderProntuario()
    expect(await screen.findByText('Paciente fictício relata melhora do sono.')).toBeVisible()
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar as consultas deste paciente.')
  })

  it('cria consulta usando o paciente atual apos navegar entre prontuarios', async () => {
    const usuario = userEvent.setup()
    renderProntuario(pacienteB.id)
    expect(await screen.findByText('Paciente Atual B')).toBeVisible()
    await usuario.click(screen.getByRole('button', { name: 'Agendar consulta' }))
    expect(screen.queryByLabelText('Paciente')).not.toBeInTheDocument()
    await usuario.click(await screen.findByRole('button', { name: /3 de outubro.*dispon/ }))
    await usuario.click(screen.getByRole('radio', { name: '09:00' }))
    await usuario.click(screen.getByRole('button', { name: 'Confirmar agendamento' }))
    await usuario.click(screen.getByRole('button', { name: /Consultas/ }))
    await waitFor(() => expect(screen.getByRole('region', { name: 'Consultas de Paciente' }).querySelector('.lista.consultas time')).toHaveTextContent('1 de jun. de 2026 às 12:00'))
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
    await usuario.click(await screen.findByRole('button', { name: 'Análise de IA' }))
    await usuario.click(await screen.findByRole('button', { name: 'Histórico de análises' }))
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
