import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { Aplicacao } from './Aplicacao'

describe('Layout inicial', () => {
  it.each([
    ['/', 'Pacientes'],
    ['/pacientes', 'Pacientes'],
    ['/agenda', 'Agenda'],
    ['/prontuario', 'Prontuário'],
    ['/inexistente', 'Página não encontrada'],
  ])('mostra aviso persistente ao abrir %s diretamente', (rota, titulo) => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    render(<MemoryRouter initialEntries={[rota]}><Aplicacao /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: titulo })).toBeVisible()
    expect(screen.getByRole('complementary', { name: 'Aviso de dados fictícios' }))
      .toHaveTextContent('Não insira dados reais de pacientes neste MVP.')
    expect(screen.getByRole('main')).toBeVisible()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('navega entre placeholders sem remover o aviso e indica a rota ativa', async () => {
    const usuario = userEvent.setup()
    render(<MemoryRouter><Aplicacao /></MemoryRouter>)
    const aviso = screen.getByRole('complementary')
    for (const titulo of ['Agenda', 'Prontuário', 'Pacientes']) {
      const link = screen.getByRole('link', { name: titulo })
      await usuario.click(link)
      expect(link).toHaveAttribute('aria-current', 'page')
      expect(screen.getByRole('heading', { level: 1, name: titulo })).toBeVisible()
      expect(screen.getByRole('complementary')).toBe(aviso)
      expect(aviso).toBeVisible()
      expect(screen.getByText('Área em preparação')).toBeVisible()
    }
  })

  it('permite retornar de uma rota desconhecida', async () => {
    const usuario = userEvent.setup()
    render(<MemoryRouter initialEntries={['/inexistente']}><Aplicacao /></MemoryRouter>)
    await usuario.click(screen.getByRole('link', { name: 'Ir para pacientes' }))
    expect(screen.getByRole('heading', { name: 'Pacientes' })).toBeVisible()
  })
})
