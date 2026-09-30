import { test, expect } from '@playwright/test'
import { aguardarGeracaoConcluida, abrirProntuario, criarPaciente, criarParecer } from './fixtures'

test('nao mistura pacientes ao abrir prontuarios independentes', async ({ page, request }) => {
  const pacienteA = await criarPaciente(request)
  const pacienteB = await criarPaciente(request)
  await criarParecer(request, pacienteA.id, 'Registro ficticio exclusivo A.')
  await criarParecer(request, pacienteB.id, 'Registro ficticio exclusivo B.')
  await abrirProntuario(page, pacienteA.id)
  await expect(page.locator('.patient-heading h1')).toHaveText(pacienteA.nome)
  await expect(page.getByText('Registro ficticio exclusivo A.', { exact: true })).toBeVisible()
  await expect(page.getByText('Registro ficticio exclusivo B.', { exact: true })).toHaveCount(0)
  await expect(page.locator('.timeline-clinica')).toBeVisible()
})

test('preserva limitacoes da analise sem historico suficiente depois de recarregar', async ({ page, request }) => {
  const paciente = await criarPaciente(request)
  await criarParecer(request, paciente.id, 'Registro ficticio preservado durante IA.')
  await aguardarGeracaoConcluida(request, paciente.id)
  const estado = await request.get(`/api/v1/pacientes/${paciente.id}/estado-analise`)
  expect(estado.ok()).toBeTruthy()
  const analise = (await estado.json() as { analiseAtual?: { limitacoes?: string[] } | null }).analiseAtual
  expect(analise?.limitacoes?.join(' ')).toMatch(/insuficiente/i)

  await abrirProntuario(page, paciente.id)
  await expect(page.getByText('Registro ficticio preservado durante IA.', { exact: true })).toBeVisible()
  await page.reload({ waitUntil: 'networkidle' })
  await expect(page.getByText('Registro ficticio preservado durante IA.', { exact: true })).toBeVisible()

  const estadoDepoisDoReload = await request.get(`/api/v1/pacientes/${paciente.id}/estado-analise`)
  expect(estadoDepoisDoReload.ok()).toBeTruthy()
  const analisePersistida = (await estadoDepoisDoReload.json() as { analiseAtual?: { limitacoes?: string[] } | null }).analiseAtual
  expect(analisePersistida?.limitacoes?.join(' ')).toMatch(/insuficiente/i)
})
