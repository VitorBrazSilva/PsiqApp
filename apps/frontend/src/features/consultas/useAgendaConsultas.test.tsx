import { act, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { servicoConsultas, type PaginaAgendaConsultas } from './servicoConsultas'
import { useAgendaConsultas } from './useAgendaConsultas'

afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers() })

it('renova itens e contagens quando a próxima consulta passa para anteriores e limpa o timer', async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-02T18:00:00Z'))
  const pagina: PaginaAgendaConsultas = {
    itens: [{ id: 'consulta-ficticia', pacienteId: 'paciente-ficticio', status: 'AGENDADA',
      agendadaPara: '2026-10-02T18:00:01Z', observacoes: null, criadaEm: '2026-10-01T18:00:00Z', statusAlteradoEm: null }],
    pagina: 0, tamanho: 50, total: 1,
    contagens: { PROXIMAS: 1, AGENDADAS_ANTERIORES: 0, REALIZADAS: 0, CANCELADAS: 0, FALTAS: 0 },
  }
  const listar = vi.spyOn(servicoConsultas, 'listarAgenda').mockResolvedValueOnce(pagina)
    .mockResolvedValue({ ...pagina, itens: [], total: 0, contagens: { ...pagina.contagens, PROXIMAS: 0, AGENDADAS_ANTERIORES: 1 } })
  const { result, unmount } = renderHook(() => useAgendaConsultas('paciente-ficticio'))
  await act(async () => { await vi.advanceTimersByTimeAsync(0) })
  expect(result.current.resultado?.contagens.PROXIMAS).toBe(1)
  await act(async () => { await vi.advanceTimersByTimeAsync(1000) })
  expect(listar).toHaveBeenCalledTimes(1)
  await act(async () => { await vi.advanceTimersByTimeAsync(1) })
  expect(listar).toHaveBeenCalledTimes(2)
  expect(result.current.resultado?.itens).toEqual([])
  expect(result.current.resultado?.contagens.AGENDADAS_ANTERIORES).toBe(1)
  unmount()
  expect(vi.getTimerCount()).toBe(0)
})
