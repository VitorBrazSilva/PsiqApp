import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { servicoConsultas, type Consulta, type PaginaAgendaConsultas } from './servicoConsultas'
import { useResumoConsultas } from './useResumoConsultas'

const consulta: Consulta = { id: 'consulta-ficticia', pacienteId: 'paciente-a', agendadaPara: '2099-09-24T17:30:00Z',
  status: 'AGENDADA', observacoes: null, criadaEm: '2026-09-01T12:00:00Z', statusAlteradoEm: null }
const contagens = { PROXIMAS: 21, AGENDADAS_ANTERIORES: 5, REALIZADAS: 100, CANCELADAS: 3, FALTAS: 11 }

function pagina(itens: Consulta[] = []): PaginaAgendaConsultas {
  return { itens, pagina: 0, tamanho: 1, total: itens.length, contagens }
}

afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers() })

it('obtém total completo, próxima e última realizada sem depender dos itens da página', async () => {
  const realizada: Consulta = { ...consulta, id: 'realizada-ficticia', status: 'REALIZADA', agendadaPara: '2026-09-10T17:30:00Z' }
  const listar = vi.spyOn(servicoConsultas, 'listarAgenda').mockImplementation(async filtros =>
    pagina(filtros?.grupo === 'REALIZADAS' ? [realizada] : [consulta]))
  const { result } = renderHook(() => useResumoConsultas('paciente-a'))
  await waitFor(() => expect(result.current.resumo?.total).toBe(140))
  expect(result.current.resumo?.proxima).toEqual(consulta)
  expect(result.current.resumo?.ultimaRealizada).toEqual(realizada)
  expect(listar).toHaveBeenCalledWith({ pacienteId: 'paciente-a', grupo: 'PROXIMAS', pagina: 0, tamanho: 1 }, expect.any(AbortSignal))
  expect(listar).toHaveBeenCalledWith({ pacienteId: 'paciente-a', grupo: 'REALIZADAS', pagina: 0, tamanho: 1 }, expect.any(AbortSignal))
})

it('aborta a leitura anterior e descarta suas respostas depois de trocar de paciente', async () => {
  const respostasA: Array<(resposta: PaginaAgendaConsultas) => void> = []
  const sinaisA: AbortSignal[] = []
  vi.spyOn(servicoConsultas, 'listarAgenda').mockImplementation((filtros, signal) => {
    if (filtros?.pacienteId === 'paciente-a') {
      sinaisA.push(signal!)
      return new Promise(resolve => respostasA.push(resolve))
    }
    return Promise.resolve(pagina(filtros?.grupo === 'PROXIMAS' ? [{ ...consulta, pacienteId: 'paciente-b' }] : []))
  })
  const { result, rerender } = renderHook(({ id }) => useResumoConsultas(id), { initialProps: { id: 'paciente-a' } })
  rerender({ id: 'paciente-b' })
  expect(result.current.resumo).toBeNull()
  expect(sinaisA.every(signal => signal.aborted)).toBe(true)
  await waitFor(() => expect(result.current.resumo?.proxima?.pacienteId).toBe('paciente-b'))
  await act(async () => { respostasA.forEach(responder => responder(pagina([consulta]))) })
  expect(result.current.resumo?.proxima?.pacienteId).toBe('paciente-b')
})

it('recusa itens de outro paciente e não apresenta zero quando uma leitura falha', async () => {
  const listar = vi.spyOn(servicoConsultas, 'listarAgenda').mockResolvedValue(pagina([{ ...consulta, pacienteId: 'outro-paciente' }]))
  const { result } = renderHook(() => useResumoConsultas('paciente-a'))
  await waitFor(() => expect(result.current.erro).toBe(true))
  expect(result.current.resumo).toBeNull()
  listar.mockRejectedValue(new Error('Falha fictícia de transporte'))
  act(() => result.current.recarregar())
  await waitFor(() => expect(listar).toHaveBeenCalledTimes(4))
  expect(result.current.resumo).toBeNull()
})

it('renova a próxima consulta após seu início e remove timer/listeners ao desmontar', async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-09-24T17:29:59Z'))
  let consultasProximas = 0
  const listar = vi.spyOn(servicoConsultas, 'listarAgenda').mockImplementation(async filtros => {
    if (filtros?.grupo === 'REALIZADAS') return pagina()
    consultasProximas += 1
    return pagina(consultasProximas === 1 ? [{ ...consulta, agendadaPara: '2026-09-24T17:30:00Z' }] : [])
  })
  const { result, unmount } = renderHook(() => useResumoConsultas('paciente-a'))
  await act(async () => { await vi.advanceTimersByTimeAsync(0) })
  expect(result.current.resumo?.proxima).not.toBeNull()
  await act(async () => { await vi.advanceTimersByTimeAsync(1000) })
  expect(listar).toHaveBeenCalledTimes(2)
  await act(async () => { await vi.advanceTimersByTimeAsync(1) })
  expect(listar).toHaveBeenCalledTimes(4)
  expect(result.current.resumo?.proxima).toBeNull()
  unmount()
  expect(vi.getTimerCount()).toBe(0)
  window.dispatchEvent(new Event('focus'))
  expect(listar).toHaveBeenCalledTimes(4)
})

it('rearma o timer para uma consulta além do limite de duração do navegador', async () => {
  vi.useFakeTimers()
  const agora = Date.parse('2026-09-01T12:00:00Z')
  const limiteTimer = 2_147_483_647
  const inicio = agora + limiteTimer + 1000
  vi.setSystemTime(agora)
  const listar = vi.spyOn(servicoConsultas, 'listarAgenda').mockImplementation(async filtros =>
    pagina(filtros?.grupo === 'PROXIMAS' && Date.now() <= inicio ? [{ ...consulta, agendadaPara: new Date(inicio).toISOString() }] : []))
  const { result, unmount } = renderHook(() => useResumoConsultas('paciente-a'))
  await act(async () => { await vi.advanceTimersByTimeAsync(0) })
  await act(async () => { await vi.advanceTimersByTimeAsync(limiteTimer) })
  expect(listar).toHaveBeenCalledTimes(4)
  expect(result.current.resumo?.proxima).not.toBeNull()
  await act(async () => { await vi.advanceTimersByTimeAsync(1001) })
  expect(listar).toHaveBeenCalledTimes(6)
  expect(result.current.resumo?.proxima).toBeNull()
  unmount()
  expect(vi.getTimerCount()).toBe(0)
})
