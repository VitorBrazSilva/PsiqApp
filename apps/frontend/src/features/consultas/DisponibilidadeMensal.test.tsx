import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { disponibilidadeTeste } from '../../test/disponibilidadeTeste'
import { FormularioConsulta } from './FormularioConsulta'
import { HorariosDisponiveis } from './HorariosDisponiveis'
import { servicoConsultas } from './servicoConsultas'
import { useDisponibilidadeMensal } from './useDisponibilidadeMensal'
import { dataCivil, proximaViradaCivil } from './tempoAgenda'

const fetchMock = vi.fn<typeof fetch>()
const paciente = { id: 'paciente-a', nome: 'Paciente Fictício A' }
const consulta = { id: 'consulta-a', pacienteId: paciente.id, agendadaPara: '2026-10-03T12:00:00Z', status: 'AGENDADA' }
beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockImplementation(async (url, opcoes) => {
    if (String(url).includes('/disponibilidade/mensal')) return Response.json(disponibilidadeTeste)
    if (String(url).includes('/disponibilidade?')) return Response.json({ estado: 'DISPONIVEL' })
    if (opcoes?.method === 'POST') return Response.json(consulta, { status: 201 })
    return Response.json({ itens: [paciente, { id: 'paciente-b', nome: 'Paciente Fictício B' }] })
  })
})
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); fetchMock.mockReset() })

async function escolherHorario() {
  const usuario = userEvent.setup()
  await usuario.click(await screen.findByRole('button', { name: /3 de outubro.*horários disponíveis/ }))
  await usuario.click(screen.getByRole('radio', { name: '09:00' }))
  return usuario
}

describe('busca mensal e confirmação', () => {
  it('usa mês do servidor, oculta madrugada, agrupa manhã/tarde/noite e confirma o instante recebido', async () => {
    const aoCriar = vi.fn()
    render(<FormularioConsulta aoCriar={aoCriar} estadoIntegracao="NAO_CONFIGURADA" />)
    const usuario = await escolherHorario()
    expect(screen.getByRole('button', { name: 'Mês anterior' })).toBeDisabled()
    expect(screen.getByRole('button', { name: /1 de outubro.*data passada/ })).toBeDisabled()
    for (const grupo of ['Manhã', 'Tarde', 'Noite']) expect(screen.getByRole('group', { name: grupo })).toBeVisible()
    expect(screen.queryByRole('group', { name: 'Madrugada' })).not.toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: '00:00' })).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Revisão do agendamento' }).querySelector('time')).toHaveAttribute('datetime', '2026-10-03')
    await usuario.click(screen.getByRole('button', { name: 'Confirmar agendamento' }))
    expect(screen.getByLabelText('Paciente')).toHaveAttribute('aria-invalid', 'true')
    expect(fetchMock.mock.calls.some(([, opcoes]) => opcoes?.method === 'POST')).toBe(false)
    // Trocar paciente limpa a seleção e inicia outra leitura.
    await usuario.selectOptions(screen.getByLabelText('Paciente'), paciente.id)
    await escolherHorario()
    await usuario.click(screen.getByRole('button', { name: 'Confirmar agendamento' }))
    await waitFor(() => expect(aoCriar).toHaveBeenCalled())
    const chamada = fetchMock.mock.calls.find(([, opcoes]) => opcoes?.method === 'POST')!
    expect(chamada[0]).toBe('/api/v1/pacientes/paciente-a/consultas')
    expect(JSON.parse(String(chamada[1]?.body)).agendadaPara).toBe('2026-10-03T12:00:00Z')
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/disponibilidade?'))).toBe(false)
    expect(fetchMock.mock.calls.find(([url]) => String(url).includes('/mensal'))![0]).toBe('/api/v1/consultas/disponibilidade/mensal')
  })

  it('repete chave e corpo após resposta perdida mesmo depois de o slot vencer', async () => {
    let tentativa = 0
    let agora = 0
    vi.spyOn(performance, 'now').mockImplementation(() => agora)
    const padrao = fetchMock.getMockImplementation()!
    fetchMock.mockImplementation(async (url, opcoes) => {
      if (opcoes?.method === 'POST' && tentativa++ === 0) throw new TypeError('resposta perdida')
      return padrao(url, opcoes)
    })
    const aoCriar = vi.fn()
    render(<FormularioConsulta pacienteFixoId={paciente.id} pacienteNome={paciente.nome} aoCriar={aoCriar} />)
    const usuario = await escolherHorario()
    await usuario.click(screen.getByRole('button', { name: 'Confirmar agendamento' }))
    expect(await screen.findByRole('button', { name: 'Repetir confirmação' })).toBeEnabled()
    agora = 4 * 86_400_000
    await usuario.click(screen.getByRole('button', { name: 'Repetir confirmação' }))
    await waitFor(() => expect(aoCriar).toHaveBeenCalledOnce())
    const chamadas = fetchMock.mock.calls.filter(([, opcoes]) => opcoes?.method === 'POST')
    expect(chamadas).toHaveLength(2)
    expect(chamadas[0][1]?.body).toBe(chamadas[1][1]?.body)
    expect(new Headers(chamadas[0][1]?.headers).get('Idempotency-Key')).toBe(new Headers(chamadas[1][1]?.headers).get('Idempotency-Key'))
  })

  it.each([409, 503])('invalida a seleção após falha %s na confirmação', async status => {
    const padrao = fetchMock.getMockImplementation()!
    fetchMock.mockImplementation(async (url, opcoes) => opcoes?.method === 'POST'
      ? Response.json({ codigo: status === 503 ? 'GOOGLE_DISPONIBILIDADE_INDISPONIVEL' : 'CONFLITO' }, { status, headers: { 'Content-Type': 'application/problem+json' } })
      : padrao(url, opcoes))
    render(<FormularioConsulta pacienteFixoId={paciente.id} aoCriar={vi.fn()} />)
    const usuario = await escolherHorario()
    await usuario.click(screen.getByRole('button', { name: 'Confirmar agendamento' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Confirmar agendamento' })).toBeDisabled())
    expect(screen.queryByRole('region', { name: 'Revisão do agendamento' })).not.toBeInTheDocument()
    if (status === 503) {
      expect(screen.queryByRole('radio')).not.toBeInTheDocument()
      await usuario.click(screen.getByRole('button', { name: 'Buscar novamente' }))
    }
    await escolherHorario()
  })

  it('mantém retroativas no caminho manual e limpa a verificação ao alternar modos', async () => {
    render(<FormularioConsulta pacienteFixoId={paciente.id} aoCriar={vi.fn()} />)
    const usuario = await escolherHorario()
    await usuario.click(screen.getByRole('button', { name: 'Informar data e hora' }))
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Data e hora'), { target: { value: '2020-01-01T09:00' } })
    await usuario.click(screen.getByRole('button', { name: 'Verificar disponibilidade' }))
    await screen.findByText('Este horário está disponível para agendamento.')
    await usuario.click(screen.getByRole('button', { name: 'Criar consulta' }))
    await waitFor(() => expect(fetchMock.mock.calls.some(([, opcoes]) => opcoes?.method === 'POST')).toBe(true))
    const corpo = JSON.parse(String(fetchMock.mock.calls.find(([, opcoes]) => opcoes?.method === 'POST')![1]?.body))
    expect(corpo.agendadaPara.startsWith('2020-01-01')).toBe(true)
    await usuario.click(screen.getByRole('button', { name: 'Buscar horários' }))
    await usuario.click(screen.getByRole('button', { name: 'Informar data e hora' }))
    expect(screen.getByLabelText('Data e hora')).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Criar consulta' })).toBeDisabled()
  })

  it('ordena/deduplica os horários e omite grupos vazios', () => {
    render(<HorariosDisponiveis data="2026-10-03" horarios={['2026-10-03T13:00:00Z', '2026-10-03T12:00:00Z', '2026-10-03T12:00:00Z']} selecionado="" aoSelecionar={vi.fn()} />)
    expect(screen.getAllByRole('radio').map(item => item.getAttribute('value'))).toEqual(['2026-10-03T12:00:00Z', '2026-10-03T13:00:00Z'])
    expect(screen.queryByRole('group', { name: 'Noite' })).not.toBeInTheDocument()
  })

  it('não oferece datas exclusivas de madrugada e mantém o mês navegável quando só há esses horários', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ ...disponibilidadeTeste,
      dias: [{ data: '2026-10-03', horarios: ['2026-10-03T03:00:00Z', '2026-10-03T08:30:00Z'] }] }))
    render(<FormularioConsulta pacienteFixoId={paciente.id} aoCriar={vi.fn()} />)
    expect(await screen.findByText(/Não foram encontrados horários livres neste mês/)).toBeVisible()
    expect(screen.getByRole('button', { name: 'sábado, 3 de outubro de 2026 — sem horários' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: /horários disponíveis/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirmar agendamento' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Próximo mês' }))
    expect(await screen.findByRole('button', { name: /3 de outubro.*horários disponíveis/ })).toBeEnabled()
  })
})

describe('ciclo de vida da disponibilidade', () => {
  it('não restaura resultados de um contexto anterior ao voltar A → B → A', async () => {
    const pendentes: ((resposta: Response) => void)[] = []
    fetchMock.mockImplementation(() => new Promise(resolve => pendentes.push(resolve)))
    const { result, rerender } = renderHook(({ paciente }) => useDisponibilidadeMensal(paciente, 'CONECTADA'), { initialProps: { paciente: 'a' } })
    await act(async () => { pendentes[0](Response.json(disponibilidadeTeste)) })
    const primeiraLeitura = result.current.identificador
    rerender({ paciente: 'b' })
    rerender({ paciente: 'a' })
    expect(result.current.dados).toBeNull()
    expect(result.current.estado).toBe('CARREGANDO')
    expect(result.current.identificador).not.toBe(primeiraLeitura)
    await act(async () => { pendentes[1](Response.json(disponibilidadeTeste)) })
    expect(result.current.dados).toBeNull()
  })

  it('mantém calendário navegável no mês vazio e apresenta erro Google sanitizado sem horários anteriores', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ ...disponibilidadeTeste, dias: [] }))
      .mockResolvedValueOnce(Response.json({ codigo: 'GOOGLE_DISPONIBILIDADE_INDISPONIVEL', detail: 'texto externo fictício' }, { status: 503, headers: { 'Content-Type': 'application/problem+json' } }))
    render(<FormularioConsulta pacienteFixoId="a" aoCriar={vi.fn()} />)
    expect(await screen.findByText(/Não foram encontrados horários livres neste mês/)).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Próximo mês' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível consultar o Google Agenda')
    expect(screen.getByRole('alert')).not.toHaveTextContent('texto externo')
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirmar agendamento' })).toBeDisabled()
  })

  it('impede criação se o horário envelheceu para o passado entre seleção e envio', async () => {
    let agora = 0
    vi.spyOn(performance, 'now').mockImplementation(() => agora)
    render(<FormularioConsulta pacienteFixoId={paciente.id} aoCriar={vi.fn()} />)
    const usuario = await escolherHorario()
    agora = 4 * 86_400_000
    await usuario.click(screen.getByRole('button', { name: 'Confirmar agendamento' }))
    expect(await screen.findByText('Este horário já passou. Escolha outro horário disponível.')).toBeVisible()
    expect(fetchMock.mock.calls.some(([, opcoes]) => opcoes?.method === 'POST')).toBe(false)
  })

  it('aborta e descarta leituras antigas por paciente/mês/conexão e renova ao voltar à janela', async () => {
    const resolvers: ((resposta: Response) => void)[] = []
    fetchMock.mockImplementation(() => new Promise(resolve => resolvers.push(resolve)))
    const { result, rerender, unmount } = renderHook(({ paciente, conexao }) => useDisponibilidadeMensal(paciente, conexao), { initialProps: { paciente: 'a', conexao: 'CONECTADA' } })
    rerender({ paciente: 'b', conexao: 'CONECTADA' })
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true)
    await act(async () => { resolvers[1](Response.json(disponibilidadeTeste)) })
    expect(result.current.estado).toBe('PRONTO')
    await act(async () => { resolvers[0](Response.json({ ...disponibilidadeTeste, dias: [] })) })
    expect(result.current.estado).toBe('PRONTO')
    act(() => result.current.mudarMes('2026-11'))
    expect(result.current.dados).toBeNull()
    expect(String(fetchMock.mock.calls.at(-1)![0])).toContain('?mes=2026-11')
    rerender({ paciente: 'b', conexao: 'DESCONECTADA' })
    expect(fetchMock.mock.calls.at(-2)![1]?.signal?.aborted).toBe(true)
    act(() => window.dispatchEvent(new Event('focus')))
    expect(fetchMock).toHaveBeenCalledTimes(5)
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(fetchMock).toHaveBeenCalledTimes(6)
    unmount()
    expect(fetchMock.mock.calls.at(-1)![1]?.signal?.aborted).toBe(true)
    act(() => window.dispatchEvent(new Event('focus')))
    expect(fetchMock).toHaveBeenCalledTimes(6)
  })

  it('distingue mês vazio de falha Google e não usa fallback local', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ ...disponibilidadeTeste, dias: [] })).mockRejectedValueOnce(new TypeError('offline'))
    const { result } = renderHook(() => useDisponibilidadeMensal('a', 'CONECTADA'))
    await waitFor(() => expect(result.current.estado).toBe('SEM_HORARIOS'))
    act(() => result.current.renovar())
    await waitFor(() => expect(result.current.estado).toBe('FALHA'))
    expect(result.current.dados).toBeNull()
  })

  it('usa a referência do servidor e o tempo decorrido, inclusive antes de enviar e na meia-noite', async () => {
    vi.useFakeTimers()
    let agora = 0
    vi.spyOn(performance, 'now').mockImplementation(() => agora)
    const referencia = '2026-10-03T02:59:59Z'
    fetchMock.mockResolvedValueOnce(Response.json({ ...disponibilidadeTeste, verificadoEm: referencia, dias: [{ data: '2026-10-02', horarios: [referencia] }] }))
    const { result } = renderHook(() => useDisponibilidadeMensal('a', null))
    await act(async () => { await Promise.resolve() })
    expect(result.current.dias[0].horarios).toHaveLength(1)
    agora = 500
    expect(result.current.referenciaAtual()).toBe(Date.parse(referencia) + 500)
    await act(async () => { await vi.advanceTimersByTimeAsync(1) })
    expect(result.current.dias[0].horarios).toHaveLength(0)
    agora = 1_001
    await act(async () => { await vi.advanceTimersByTimeAsync(1_000) })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(dataCivil(Date.parse('2026-10-03T02:59:59Z'))).toBe('2026-10-02')
    expect(proximaViradaCivil(Date.parse('2026-10-03T02:59:59Z'))).toBe(Date.parse('2026-10-03T03:00:00Z'))
  })

  it('aceita chave de criação do chamador e sinal de cancelamento', async () => {
    const controle = new AbortController()
    await servicoConsultas.criar({ pacienteId: paciente.id, agendadaPara: consulta.agendadaPara, observacoes: null }, { usarApiReal: true, chaveIdempotencia: 'chave-ficticia', signal: controle.signal })
    expect(new Headers(fetchMock.mock.calls[0][1]?.headers).get('Idempotency-Key')).toBe('chave-ficticia')
    expect(fetchMock.mock.calls[0][1]?.signal).toBe(controle.signal)
  })
})
