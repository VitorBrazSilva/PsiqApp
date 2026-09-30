import { expect, type APIRequestContext, type Page } from '@playwright/test'
import { randomUUID } from 'node:crypto'

function cpfFicticioUnico() {
  const base = Array.from(randomUUID().replaceAll('-', '').slice(0, 9), caractere => Number.parseInt(caractere, 16) % 10)
  const primeiro = base.reduce((soma, digito, indice) => soma + digito * (10 - indice), 0)
  base.push((primeiro * 10) % 11 === 10 ? 0 : (primeiro * 10) % 11)
  const segundo = base.reduce((soma, digito, indice) => soma + digito * (11 - indice), 0)
  base.push((segundo * 10) % 11 === 10 ? 0 : (segundo * 10) % 11)
  return base.join('')
}

export const ficticio = {
  nome: `Paciente E2E ${randomUUID().slice(0, 8)}`,
  cpf: cpfFicticioUnico(),
  dataNascimento: '1990-01-01',
  telefone: '(11) 98765-4321',
  email: 'e2e.ficticio@example.test',
  texto: 'Registro clinico ficticio de validacao E2E.',
  complemento: 'Complemento clinico ficticio de validacao E2E.',
}

export async function criarPaciente(api: APIRequestContext) {
  const response = await api.post('/api/v1/pacientes', {
    headers: { 'Idempotency-Key': randomUUID() },
    data: { ...ficticio, nome: `Paciente E2E ${randomUUID().slice(0, 8)}`, cpf: cpfFicticioUnico() },
  })
  expect(response.status()).toBe(201)
  return response.json() as Promise<{ id: string; nome: string }>
}

export async function criarParecer(api: APIRequestContext, pacienteId: string, texto = ficticio.texto) {
  const response = await api.post(`/api/v1/pacientes/${pacienteId}/registros-clinicos`, {
    headers: { 'Idempotency-Key': randomUUID() },
    data: { texto, dataHoraClinica: '2026-09-10T12:00:00Z' },
  })
  expect(response.status()).toBe(201)
  return response.json()
}

export async function aguardarGeracaoConcluida(api: APIRequestContext, pacienteId: string) {
  await expect.poll(async () => {
  const response = await api.get(`/api/v1/pacientes/${pacienteId}/estado-analise`)
    const corpo = await response.text()
    expect(response.ok()).toBeTruthy()
    const estado = JSON.parse(corpo) as { ultimaGeracao?: { estado?: string } | null }
    return estado.ultimaGeracao?.estado ?? null
  }, { timeout: 30_000, intervals: [500, 1_000, 2_000] }).toBe('CONCLUIDA')
}

export async function abrirProntuario(page: Page, pacienteId: string) {
  await page.goto(`/prontuario/${pacienteId}`)
  await expect(page.locator('.patient-heading h1')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Análise de IA' })).toBeVisible()
}
