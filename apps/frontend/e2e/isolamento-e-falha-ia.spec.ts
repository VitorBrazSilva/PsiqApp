import { test, expect } from '@playwright/test'
import { abrirProntuario, criarPaciente, criarParecer } from './fixtures'

test('nao mistura pacientes ao abrir prontuarios', async ({ page, request }) => {
  const pacienteA = await criarPaciente(request)
  const pacienteB = await criarPaciente(request)
  await criarParecer(request, pacienteA.id, 'Registro ficticio exclusivo A.')
  await criarParecer(request, pacienteB.id, 'Registro ficticio exclusivo B.')
  await abrirProntuario(page, pacienteA.id)
  await expect(page.getByText('Registro ficticio exclusivo A.')).toBeVisible()
  await expect(page.getByText('Registro ficticio exclusivo B.')).toHaveCount(0)
})

test('mantem aviso clinico e estado seguro quando geracao esta pendente', async ({ page, request }) => {
  const paciente = await criarPaciente(request)
  await criarParecer(request, paciente.id, 'Registro ficticio preservado durante IA.')
  await abrirProntuario(page, paciente.id)
  await expect(page.getByText('Registro ficticio preservado durante IA.')).toBeVisible()
  await expect(page.getByText(/decisão clínica permanece com o médico/i)).toBeVisible()
})
