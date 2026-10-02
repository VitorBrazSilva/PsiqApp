import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PaginaAgenda } from './PaginaAgenda'

const fetchMock = vi.fn<typeof fetch>()
const paciente = {
  id: '11111111-1111-4111-8111-111111111111',
  nome: 'Paciente Ficticia',
  cpf: '***.***.***-09',
  dataNascimento: '1990-01-01',
  telefone: '+5511999999999',
  email: 'paciente.ficticia@example.test',
  queixaInicial: null,
  criadoEm: '2026-01-01T12:00:00Z',
}
const consulta = {
  id: '22222222-2222-4222-8222-222222222222',
  pacienteId: paciente.id,
  agendadaPara: '2026-05-01T15:00:00Z',
  status: 'AGENDADA' as 'AGENDADA' | 'REALIZADA' | 'CANCELADA' | 'FALTA',
  observacoes: null,
  criadaEm: '2026-01-01T12:00:00Z',
  statusAlteradoEm: null as string | null,
  sincronizacaoGoogleAgenda: { estado: 'NAO_APLICAVEL', ultimaTentativa: null },
}
const paginaVazia = { itens: [], pagina: 0, tamanho: 50, total: 0 }

function configurarApi(opcoes: {
  estados?: string[]
  disponibilidade?: string
  consultas?: typeof consulta[]
} = {}) {
  let leituraEstado = 0
  let consultasAtuais = [...(opcoes.consultas ?? [])]
  fetchMock.mockImplementation(async (url, requisicao) => {
    const caminho = String(url)
    const metodo = requisicao?.method ?? 'GET'
    if (caminho === '/api/v1/integracoes/google-agenda') {
      const estados = opcoes.estados ?? ['NAO_CONFIGURADA']
      const estado = estados[Math.min(leituraEstado, estados.length - 1)]
      leituraEstado += 1
      return Response.json({ estado })
    }
    if (caminho.startsWith('/api/v1/consultas/disponibilidade?')) {
      return Response.json({ estado: opcoes.disponibilidade ?? 'DISPONIVEL', fusoHorario: 'America/Sao_Paulo', verificadoEm: '2026-05-01T14:00:00Z' })
    }
    if (caminho === '/api/v1/pacientes?pagina=0&tamanho=100') {
      return Response.json({ ...paginaVazia, itens: [paciente], total: 1 })
    }
    if (caminho.startsWith('/api/v1/agenda/consultas?')) {
      const contagens = { PROXIMAS: 0, AGENDADAS_ANTERIORES: 0, REALIZADAS: 0, CANCELADAS: 0, FALTAS: 0 }
      consultasAtuais.forEach(item => { contagens[item.status === 'AGENDADA' ? 'PROXIMAS' : item.status === 'REALIZADA' ? 'REALIZADAS' : item.status === 'CANCELADA' ? 'CANCELADAS' : 'FALTAS'] += 1 })
      return Response.json({ ...paginaVazia, itens: consultasAtuais, total: consultasAtuais.length, contagens })
    }
    if (caminho === '/api/v1/consultas?pagina=0&tamanho=50') {
      return Response.json({ ...paginaVazia, itens: opcoes.consultas ?? [] })
    }
    if (metodo === 'DELETE' && caminho === '/api/v1/integracoes/google-agenda/conexao') {
      return new Response(null, { status: 204 })
    }
    if (metodo === 'POST' && caminho.includes('/sincronizacao-google/tentar-novamente')) {
      const atualizada = { ...consulta, sincronizacaoGoogleAgenda: { estado: 'PENDENTE', ultimaTentativa: null } }
      consultasAtuais = consultasAtuais.map(item => item.id === consulta.id ? atualizada : item)
      return Response.json(atualizada, { status: 202 })
    }
    if (metodo === 'POST' && caminho === `/api/v1/consultas/${consulta.id}/status`) {
      const status = JSON.parse(String(requisicao?.body)) as { status: string }
      const atualizada = { ...consulta, status: status.status as typeof consulta.status, statusAlteradoEm: '2026-05-01T16:00:00Z', sincronizacaoGoogleAgenda: { estado: 'PENDENTE' as const, ultimaTentativa: null } }
      consultasAtuais = consultasAtuais.map(item => item.id === consulta.id ? atualizada : item)
      return Response.json(atualizada)
    }
    if (metodo === 'POST' && caminho === `/api/v1/pacientes/${paciente.id}/consultas`) {
      const criada = { ...consulta, sincronizacaoGoogleAgenda: { estado: 'AGUARDANDO_CONEXAO' as const, ultimaTentativa: null } }
      consultasAtuais = [criada, ...consultasAtuais]
      return Response.json(criada, { status: 201 })
    }
    return Response.json(paginaVazia)
  })
}

beforeEach(() => vi.stubGlobal('fetch', fetchMock))
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('PaginaAgenda', () => {
  it('cria consulta somente após verificar disponibilidade da data e hora atual', async () => {
    configurarApi()
    const usuario = userEvent.setup()
    render(<MemoryRouter><PaginaAgenda /></MemoryRouter>)
    expect(await screen.findByText('Nenhuma consulta encontrada para o periodo.')).toBeVisible()

    await usuario.selectOptions(screen.getByLabelText('Paciente'), paciente.id)
    await usuario.type(screen.getByLabelText('Data e hora'), '2026-05-01T12:00')
    const criar = screen.getByRole('button', { name: 'Criar consulta' })
    expect(criar).toBeDisabled()
    await usuario.click(screen.getByRole('button', { name: 'Verificar disponibilidade' }))
    expect(await screen.findByText('Este horário está disponível para agendamento.')).toBeVisible()
    expect(criar).toBeEnabled()
    await usuario.click(criar)

    expect(await screen.findByText('Agendada')).toBeVisible()
    expect(screen.getByText(/12:00.*Paciente Ficticia/)).toBeVisible()
    expect(screen.getByText('Aguardando conexão com Google Agenda')).toBeVisible()
    const chamadaCriacao = fetchMock.mock.calls.find(([url]) => String(url) === `/api/v1/pacientes/${paciente.id}/consultas`)
    expect(chamadaCriacao).toBeDefined()
    expect(new Headers(chamadaCriacao?.[1]?.headers).get('Idempotency-Key')).toMatch(/[0-9a-f-]{36}/)
  })

  it('protege os campos enquanto aguarda a criação da consulta', async () => {
    configurarApi()
    const respostaPadrao = fetchMock.getMockImplementation()
    let concluirCriacao: ((resposta: Response) => void) | undefined
    fetchMock.mockImplementation((url, requisicao) => {
      if (String(url) === `/api/v1/pacientes/${paciente.id}/consultas`) {
        return new Promise<Response>(resolve => { concluirCriacao = resolve })
      }
      return respostaPadrao!(url, requisicao)
    })
    const usuario = userEvent.setup()
    render(<MemoryRouter><PaginaAgenda /></MemoryRouter>)
    await screen.findByText('Nenhuma consulta encontrada para o periodo.')
    await usuario.selectOptions(screen.getByLabelText('Paciente'), paciente.id)
    await usuario.type(screen.getByLabelText('Data e hora'), '2026-05-01T12:00')
    await usuario.click(screen.getByRole('button', { name: 'Verificar disponibilidade' }))
    await screen.findByText('Este horário está disponível para agendamento.')
    await usuario.click(screen.getByRole('button', { name: 'Criar consulta' }))

    expect(screen.getByRole('button', { name: 'Salvando...' })).toBeDisabled()
    expect(screen.getByLabelText('Data e hora')).toBeDisabled()
    expect(screen.getByLabelText('Observações')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Verificar disponibilidade' })).toBeDisabled()

    concluirCriacao?.(Response.json({ ...consulta, sincronizacaoGoogleAgenda: { estado: 'AGUARDANDO_CONEXAO', ultimaTentativa: null } }, { status: 201 }))
    expect(await screen.findByText('Nenhuma consulta encontrada para o periodo.')).toBeVisible()
  })

  it('invalida a disponibilidade quando a data ou a hora muda', async () => {
    configurarApi()
    const usuario = userEvent.setup()
    render(<MemoryRouter><PaginaAgenda /></MemoryRouter>)
    await screen.findByText('Nenhuma consulta encontrada para o periodo.')
    const campoDataHora = screen.getByLabelText('Data e hora')
    await usuario.type(campoDataHora, '2026-05-01T12:00')
    await usuario.click(screen.getByRole('button', { name: 'Verificar disponibilidade' }))
    expect(await screen.findByText('Este horário está disponível para agendamento.')).toBeVisible()
    await usuario.clear(campoDataHora)
    await usuario.type(campoDataHora, '2026-05-02T12:00')

    expect(screen.getByText('Verifique a disponibilidade antes de criar a consulta.')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Criar consulta' })).toBeDisabled()
  })

  it('associa o erro de paciente ao controle correspondente', async () => {
    configurarApi()
    const usuario = userEvent.setup()
    render(<MemoryRouter><PaginaAgenda /></MemoryRouter>)
    await screen.findByText('Nenhuma consulta encontrada para o periodo.')
    await usuario.type(screen.getByLabelText('Data e hora'), '2026-05-01T12:00')
    await usuario.click(screen.getByRole('button', { name: 'Verificar disponibilidade' }))
    await screen.findByText('Este horário está disponível para agendamento.')
    await usuario.click(screen.getByRole('button', { name: 'Criar consulta' }))

    expect(screen.getByLabelText('Paciente')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Paciente')).toHaveAttribute('aria-describedby', 'agenda-paciente-erro')
    expect(screen.getByRole('alert')).toHaveTextContent('Selecione um paciente.')
  })

  it.each([
    ['OCUPADO', 'Este horário já está ocupado. Escolha outra data ou horário e verifique novamente.'],
    ['INDISPONIVEL', 'Não foi possível verificar a agenda. Tente novamente; a consulta não pode ser criada enquanto a verificação estiver indisponível.'],
  ])('distingue o resultado %s de uma falha de disponibilidade', async (disponibilidade, mensagem) => {
    configurarApi({ disponibilidade })
    const usuario = userEvent.setup()
    render(<MemoryRouter><PaginaAgenda /></MemoryRouter>)
    await screen.findByText('Nenhuma consulta encontrada para o periodo.')
    await usuario.type(screen.getByLabelText('Data e hora'), '2026-05-01T12:00')
    await usuario.click(screen.getByRole('button', { name: 'Verificar disponibilidade' }))

    expect(await screen.findByText(mensagem)).toBeVisible()
    expect(screen.getByRole('button', { name: 'Criar consulta' })).toBeDisabled()
    expect(fetchMock.mock.calls.some(([url, requisicao]) => requisicao?.method === 'POST' && String(url).includes('/consultas'))).toBe(false)
  })

  it('mostra que a configuração ausente permite a agenda local e não oferece conexão impossível', async () => {
    configurarApi()
    render(<MemoryRouter><PaginaAgenda /></MemoryRouter>)

    expect(await screen.findByText(/A integração não está configurada neste ambiente/)).toBeVisible()
    expect(screen.getByText(/disponibilidade local do PsiqApp/)).toBeVisible()
    expect(screen.queryByRole('link', { name: /Conectar conta Google/ })).not.toBeInTheDocument()
  })

  it('permite reconectar quando a conexão Google está indisponível', async () => {
    configurarApi({ estados: ['INDISPONIVEL'] })
    render(<MemoryRouter><PaginaAgenda /></MemoryRouter>)

    expect(await screen.findByText(/Google Agenda: Indisponível/)).toBeVisible()
    expect(screen.getByRole('link', { name: 'Reconectar conta Google' }))
      .toHaveAttribute('href', '/api/v1/integracoes/google-agenda/conectar')
  })

  it('explica os dados e confirma a desconexão sem remover eventos existentes', async () => {
    configurarApi({ estados: ['CONECTADA', 'DESCONECTADA'] })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const usuario = userEvent.setup()
    render(<MemoryRouter><PaginaAgenda /></MemoryRouter>)
    expect(await screen.findByRole('button', { name: 'Desconectar Google Agenda' })).toBeVisible()
    expect(screen.getByText(/nome, o e-mail e o horário da consulta\. Quando marcada como realizada ou falta/)).toBeVisible()
    await usuario.type(screen.getByLabelText('Data e hora'), '2026-05-01T12:00')
    await usuario.click(screen.getByRole('button', { name: 'Verificar disponibilidade' }))
    expect(await screen.findByText('Este horário está disponível para agendamento.')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Criar consulta' })).toBeEnabled()
    await usuario.click(screen.getByRole('button', { name: 'Desconectar Google Agenda' }))

    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('Os eventos já criados permanecerão no Google'))
    expect(await screen.findByText('Google Agenda: Desconectada. A agenda continua disponível no PsiqApp. Eventos Google já criados permanecem no calendário sem novas atualizações do PsiqApp.')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Conectar novamente' })).toHaveAttribute('href', '/api/v1/integracoes/google-agenda/conectar')
    expect(screen.getByText('Verifique a disponibilidade antes de criar a consulta.')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Criar consulta' })).toBeDisabled()
  })

  it('permite solicitar nova tentativa e identifica consultas sem evento', async () => {
    const pendente = { ...consulta, sincronizacaoGoogleAgenda: { estado: 'PENDENTE', ultimaTentativa: null } }
    const legada = { ...consulta, id: 'consulta-legada', sincronizacaoGoogleAgenda: { estado: 'NAO_APLICAVEL', ultimaTentativa: null } }
    configurarApi({ consultas: [pendente, legada] })
    const usuario = userEvent.setup()
    render(<MemoryRouter><PaginaAgenda /></MemoryRouter>)
    expect(await screen.findByText('Aguardando sincronização com Google Agenda')).toBeVisible()
    expect(screen.getByText('Sem evento Google associado')).toBeVisible()
    const leiturasAntesDoRetry = fetchMock.mock.calls.filter(([url]) => String(url).startsWith('/api/v1/agenda/consultas?')).length
    const regiaoAnuncios = document.querySelector('.google-agenda-sincronizacao [role="status"]')
    expect(regiaoAnuncios).toHaveAttribute('aria-live', 'polite')
    await usuario.click(screen.getByRole('button', { name: 'Tentar sincronizar novamente' }))

    expect(await screen.findByText('Nova tentativa de sincronização solicitada.')).toBeInTheDocument()
    expect(regiaoAnuncios).toHaveTextContent('Nova tentativa de sincronização solicitada.')
    expect(fetchMock.mock.calls.some(([url, opcoes]) => String(url).includes('/sincronizacao-google/tentar-novamente') && opcoes?.method === 'POST')).toBe(true)
    await waitFor(() => expect(fetchMock.mock.calls.filter(([url]) => String(url).startsWith('/api/v1/agenda/consultas?')).length).toBeGreaterThan(leiturasAntesDoRetry))
  })

  it('mostra erro seguro quando a solicitação de nova tentativa falha', async () => {
    const falha = { ...consulta, sincronizacaoGoogleAgenda: { estado: 'FALHA', ultimaTentativa: null } }
    configurarApi({ consultas: [falha] })
    const respostaPadrao = fetchMock.getMockImplementation()
    fetchMock.mockImplementation((url, requisicao) => {
      if (String(url).includes('/sincronizacao-google/tentar-novamente')) {
        return Promise.resolve(Response.json({ detail: 'detalhe externo fictício' }, {
          status: 503,
          headers: { 'Content-Type': 'application/problem+json' },
        }))
      }
      return respostaPadrao!(url, requisicao)
    })
    const usuario = userEvent.setup()
    render(<MemoryRouter><PaginaAgenda /></MemoryRouter>)
    await screen.findByText('Falha ao sincronizar com Google Agenda')
    await usuario.click(screen.getByRole('button', { name: 'Tentar sincronizar novamente' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível solicitar a sincronização. Tente novamente.')
    expect(screen.getByRole('alert')).not.toHaveTextContent('detalhe externo fictício')
  })

  it.each([
    ['REALIZADA', 'Realizada'], ['FALTA', 'Falta'], ['CANCELADA', 'Cancelada'],
  ])('atualiza o status %s, mantém a data e marca a sincronização pendente', async (_status, rotulo) => {
    configurarApi({ consultas: [consulta] })
    const usuario = userEvent.setup()
    render(<MemoryRouter><PaginaAgenda /></MemoryRouter>)
    await usuario.click(await screen.findByRole('button', { name: rotulo }))
    expect(await screen.findByText('Aguardando sincronização com Google Agenda')).toBeVisible()
    expect(screen.getByText(rotulo, { selector: '.consulta-status' })).toBeVisible()
    expect(screen.getByText(/12:00.*Paciente Ficticia/)).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Realizada' })).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(`/api/v1/consultas/${consulta.id}/status`, expect.any(Object))
  })

  it('mantém o identificador do paciente quando o nome não veio na página carregada', async () => {
    fetchMock.mockImplementation(async url => {
      if (String(url) === '/api/v1/integracoes/google-agenda') return Response.json({ estado: 'NAO_CONFIGURADA' })
      if (String(url) === '/api/v1/consultas?pagina=0&tamanho=50') return Response.json({ ...paginaVazia, itens: [consulta] })
      if (String(url) === '/api/v1/pacientes?pagina=0&tamanho=100') return Response.json(paginaVazia)
      if (String(url).startsWith('/api/v1/agenda/consultas?')) return Response.json({ ...paginaVazia, itens: [consulta], total: 1, contagens: { PROXIMAS: 1, AGENDADAS_ANTERIORES: 0, REALIZADAS: 0, CANCELADAS: 0, FALTAS: 0 } })
      return Response.json(paginaVazia)
    })
    render(<MemoryRouter><PaginaAgenda /></MemoryRouter>)
    expect(await screen.findByText(new RegExp(`12:00.*${paciente.id}`))).toBeVisible()
    expect(screen.getByText('Agendada')).toBeVisible()
  })
})
