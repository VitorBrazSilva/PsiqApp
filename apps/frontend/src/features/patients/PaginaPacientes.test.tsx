import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PaginaPacientes } from './PaginaPacientes'

const fetchMock = vi.fn<typeof fetch>()
const paginaVazia = { items: [], page: 0, size: 25, total: 0 }
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

beforeEach(() => vi.stubGlobal('fetch', fetchMock))
afterEach(() => vi.unstubAllGlobals())

describe('PaginaPacientes', () => {
  it('busca pacientes, exibe vazio e permite abrir prontuario', async () => {
    fetchMock
      .mockResolvedValueOnce(Response.json(paginaVazia))
      .mockResolvedValueOnce(Response.json({ ...paginaVazia, items: [paciente], total: 1 }))
    const usuario = userEvent.setup()
    render(<MemoryRouter><PaginaPacientes /></MemoryRouter>)

    expect(await screen.findByText('Nenhum paciente encontrado para esta busca.')).toBeVisible()
    await usuario.type(screen.getByLabelText('Buscar por nome'), 'Ficticia')

    expect(await screen.findByText('Paciente Ficticia')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Abrir prontuário' })).toHaveAttribute('href', `/prontuario/${paciente.id}`)
    expect(fetchMock).toHaveBeenLastCalledWith('/api/v1/patients?page=0&size=25&q=Ficticia', expect.any(Object))
  })

  it('valida campos do cadastro no cliente antes de chamar a API', async () => {
    fetchMock.mockResolvedValueOnce(Response.json(paginaVazia))
    const usuario = userEvent.setup()
    render(<MemoryRouter><PaginaPacientes /></MemoryRouter>)
    await screen.findByText('Nenhum paciente encontrado para esta busca.')
    await usuario.click(screen.getByRole('button', { name: 'Salvar paciente' }))

    expect(screen.getByText('Informe o nome.')).toBeVisible()
    expect(screen.getByText('Informe um CPF valido.')).toBeVisible()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('cria paciente com Idempotency-Key e trata Problem Details de campo', async () => {
    fetchMock
      .mockResolvedValueOnce(Response.json(paginaVazia))
      .mockResolvedValueOnce(Response.json({
        code: 'CPF_DUPLICADO',
        requestId: 'd6b462cb-fbd3-444f-b3e1-fc30d40b0b24',
        fieldErrors: [{ field: 'cpf', message: 'valor sensivel' }],
      }, { status: 409, headers: { 'Content-Type': 'application/problem+json' } }))
    const usuario = userEvent.setup()
    render(<MemoryRouter><PaginaPacientes /></MemoryRouter>)
    await screen.findByText('Nenhum paciente encontrado para esta busca.')

    await usuario.type(screen.getByLabelText('Nome'), paciente.nome)
    await usuario.type(screen.getByLabelText('CPF'), '529.982.247-25')
    await usuario.type(screen.getByLabelText('Nascimento'), '1990-01-01')
    await usuario.type(screen.getByLabelText('Telefone'), '11999999999')
    await usuario.type(screen.getByLabelText('E-mail'), paciente.email)
    await usuario.click(screen.getByRole('button', { name: 'Salvar paciente' }))

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('conflito'))
    const [, opcoes] = fetchMock.mock.calls[1]
    expect(fetchMock.mock.calls[1][0]).toBe('/api/v1/patients')
    expect(new Headers(opcoes?.headers).get('Idempotency-Key')).toMatch(/[0-9a-f-]{36}/)
    expect(screen.getByText('Valor inválido.')).toBeVisible()
  })
})
