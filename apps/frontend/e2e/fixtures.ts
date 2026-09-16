import { expect, type APIRequestContext, type Page } from '@playwright/test'
import { randomUUID } from 'node:crypto'

export const ficticio = {
  nome: `Paciente E2E ${randomUUID().slice(0, 8)}`,
  cpf: '529.982.247-25',
  dataNascimento: '1990-01-01',
  telefone: '(11) 98765-4321',
  email: 'e2e.ficticio@example.test',
  texto: 'Registro clinico ficticio de validacao E2E.',
  complemento: 'Complemento clinico ficticio de validacao E2E.',
}

export async function criarPaciente(api: APIRequestContext) {
  const response = await api.post('/api/v1/patients', {
    headers: { 'Idempotency-Key': randomUUID() },
    data: ficticio,
  })
  expect(response.status()).toBe(201)
  return response.json() as Promise<{ id: string; nome: string }>
}

export async function criarParecer(api: APIRequestContext, pacienteId: string, texto = ficticio.texto) {
  const response = await api.post(`/api/v1/patients/${pacienteId}/clinical-records`, {
    headers: { 'Idempotency-Key': randomUUID() },
    data: { texto, dataHoraClinica: '2026-09-10T12:00:00Z' },
  })
  expect(response.status()).toBe(201)
  return response.json()
}

export async function abrirProntuario(page: Page, pacienteId: string) {
  await page.goto(`/prontuario/${pacienteId}`)
  await expect(page.getByRole('heading', { name: 'Prontuário' })).toBeVisible()
  await expect(page.getByText('Dados do paciente')).toBeVisible()
}
