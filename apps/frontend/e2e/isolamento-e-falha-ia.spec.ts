import { test, expect } from '@playwright/test'
import { aguardarGeracaoConcluida, abrirProntuario, criarPaciente, criarParecer } from './fixtures'

test('nao mistura pacientes ao abrir prontuarios', async ({ page, request }) => {
  const pacienteA = await criarPaciente(request)
  const pacienteB = await criarPaciente(request)
  await criarParecer(request, pacienteA.id, 'Registro ficticio exclusivo A.')
  await criarParecer(request, pacienteB.id, 'Registro ficticio exclusivo B.')
  await abrirProntuario(page, pacienteA.id)
  await expect(page.getByText('Registro ficticio exclusivo A.', { exact: true })).toBeVisible()
  await expect(page.getByText('Registro ficticio exclusivo B.', { exact: true })).toHaveCount(0)
})

test('mantem limites seguros quando a geracao e concluida com historico insuficiente', async ({ page, request }) => {
  const paciente = await criarPaciente(request)
  await criarParecer(request, paciente.id, 'Registro ficticio preservado durante IA.')
  await aguardarGeracaoConcluida(request, paciente.id)
  await abrirProntuario(page, paciente.id)
  await expect(page.getByText('Registro ficticio preservado durante IA.', { exact: true })).toBeVisible()
  await page.reload({ waitUntil: 'networkidle' })
  await expect(page.getByText(/insuficiente/i).last()).toBeVisible({ timeout: 30_000 })
})
