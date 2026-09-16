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
  status: 'AGENDADA',
  observacoes: null,
  criadaEm: '2026-01-01T12:00:00Z',
  statusAlteradoEm: null,
}
const paginaVazia = { items: [], page: 0, size: 25, total: 0 }

beforeEach(() => vi.stubGlobal('fetch', fetchMock))
afterEach(() => vi.unstubAllGlobals())

describe('PaginaAgenda', () => {
  it('cria consulta retroativa ou futura consumindo API real de agenda', async () => {
    fetchMock.mockImplementation(async (url, opcoes) => {
      if (url === '/api/v1/appointments?page=0&size=50') return Response.json(paginaVazia)
      if (url === '/api/v1/patients?page=0&size=25') return Response.json({ ...paginaVazia, items: [paciente] })
      if (opcoes?.method === 'POST' && url === `/api/v1/patients/${paciente.id}/appointments`) {
        return Response.json(consulta, { status: 201 })
      }
      return Response.json(paginaVazia)
    })
    const usuario = userEvent.setup()
    render(<MemoryRouter><PaginaAgenda /></MemoryRouter>)
    expect(await screen.findByText('Nenhuma consulta encontrada para o periodo.')).toBeVisible()

    await usuario.selectOptions(screen.getByLabelText('Paciente'), paciente.id)
    await usuario.type(screen.getByLabelText('Data e hora'), '2026-05-01T12:00')
    await usuario.click(screen.getByRole('button', { name: 'Criar consulta' }))

    expect(await screen.findByText('Status: Agendada')).toBeVisible()
    expect(screen.getByText('Paciente: Paciente Ficticia')).toBeVisible()
    const chamadaCriacao = fetchMock.mock.calls.find(([url]) => url === `/api/v1/patients/${paciente.id}/appointments`)
    expect(chamadaCriacao).toBeDefined()
    expect(new Headers(chamadaCriacao?.[1]?.headers).get('Idempotency-Key')).toMatch(/[0-9a-f-]{36}/)
  })

  it('atualiza status final e bloqueia novas transicoes na interface', async () => {
    fetchMock.mockImplementation(async (url, opcoes) => {
      if (url === '/api/v1/appointments?page=0&size=50') return Response.json({ ...paginaVazia, items: [consulta] })
      if (url === '/api/v1/patients?page=0&size=25') return Response.json({ ...paginaVazia, items: [paciente] })
      if (opcoes?.method === 'POST' && url === `/api/v1/appointments/${consulta.id}/status`) {
        return Response.json({ ...consulta, status: 'REALIZADA', statusAlteradoEm: '2026-05-01T16:00:00Z' })
      }
      return Response.json(paginaVazia)
    })
    const usuario = userEvent.setup()
    render(<MemoryRouter><PaginaAgenda /></MemoryRouter>)

    await usuario.click(await screen.findByRole('button', { name: 'Realizada' }))
    await waitFor(() => expect(screen.getByText('Status: Realizada')).toBeVisible())
    expect(screen.getByText('Paciente: Paciente Ficticia')).toBeVisible()
    expect(screen.getByText('Estado final')).toBeVisible()
    expect(fetchMock).toHaveBeenCalledWith(`/api/v1/appointments/${consulta.id}/status`, expect.any(Object))
  })

  it('mantem identificador do paciente quando o nome nao veio na pagina carregada', async () => {
    fetchMock.mockImplementation(async (url) => {
      if (url === '/api/v1/appointments?page=0&size=50') return Response.json({ ...paginaVazia, items: [consulta] })
      if (url === '/api/v1/patients?page=0&size=25') return Response.json(paginaVazia)
      return Response.json(paginaVazia)
    })
    render(<MemoryRouter><PaginaAgenda /></MemoryRouter>)

    expect(await screen.findByText(`Paciente: ${paciente.id}`)).toBeVisible()
    expect(screen.getByText('Status: Agendada')).toBeVisible()
  })
})
