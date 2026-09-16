import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PaginaProntuario } from './PaginaProntuario'

const fetchMock = vi.fn<typeof fetch>()

const pacienteA = {
  id: '11111111-1111-4111-8111-111111111111',
  nome: 'Paciente Atual A',
  cpf: '***.***.***-09',
  dataNascimento: '1990-01-01',
  telefone: '+5511999999999',
  email: 'a@example.test',
  queixaInicial: null,
  criadoEm: '2026-01-01T12:00:00Z',
}

const pacienteB = { ...pacienteA, id: '22222222-2222-4222-8222-222222222222', nome: 'Paciente Atual B', email: 'b@example.test' }
const paginaVazia = { items: [], page: 0, size: 25, total: 0 }

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockImplementation(async (url, opcoes) => {
    if (url === `/api/v1/patients/${pacienteA.id}`) return Response.json(pacienteA)
    if (url === `/api/v1/patients/${pacienteB.id}`) return Response.json(pacienteB)
    if (url === `/api/v1/appointments?page=0&size=50&patientId=${pacienteA.id}`) return Response.json(paginaVazia)
    if (url === `/api/v1/appointments?page=0&size=50&patientId=${pacienteB.id}`) return Response.json(paginaVazia)
    if (opcoes?.method === 'POST' && url === `/api/v1/patients/${pacienteB.id}/appointments`) {
      return Response.json({
        id: '33333333-3333-4333-8333-333333333333',
        pacienteId: pacienteB.id,
        agendadaPara: '2026-06-01T15:00:00Z',
        status: 'AGENDADA',
        observacoes: null,
        criadaEm: '2026-01-01T12:00:00Z',
        statusAlteradoEm: null,
      }, { status: 201 })
    }
    return Response.json(paginaVazia)
  })
})

afterEach(() => vi.unstubAllGlobals())

describe('PaginaProntuario', () => {
  it('cria consulta usando o paciente atual apos navegar entre prontuarios', async () => {
    const usuario = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[`/prontuario/${pacienteA.id}`]}>
        <Routes>
          <Route path="/prontuario/:pacienteId" element={<PaginaProntuario />} />
          <Route path="/trocar" element={<PaginaProntuario />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Paciente Atual A')).toBeVisible()
    window.history.pushState({}, '', `/prontuario/${pacienteB.id}`)
    render(
      <MemoryRouter initialEntries={[`/prontuario/${pacienteB.id}`]}>
        <Routes><Route path="/prontuario/:pacienteId" element={<PaginaProntuario />} /></Routes>
      </MemoryRouter>,
    )
    expect(await screen.findByText('Paciente Atual B')).toBeVisible()

    await usuario.type(screen.getAllByLabelText('Data e hora').at(-1)!, '2026-06-01T12:00')
    await usuario.click(screen.getAllByRole('button', { name: 'Criar consulta' }).at(-1)!)

    expect(await screen.findByText('Paciente: Paciente Atual B')).toBeVisible()
    expect(fetchMock).toHaveBeenCalledWith(`/api/v1/patients/${pacienteB.id}/appointments`, expect.any(Object))
    expect(fetchMock).not.toHaveBeenCalledWith(`/api/v1/patients/${pacienteA.id}/appointments`, expect.any(Object))
  })
})
