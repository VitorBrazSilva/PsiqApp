import { test, expect } from '@playwright/test'
import { abrirProntuario, criarPaciente, criarParecer, ficticio } from './fixtures'

test('cadastra, busca, abre paciente e preserva aviso de dados ficticios', async ({ page }) => {
  await page.goto('/pacientes')
  await expect(page.getByText('Use somente dados fictícios.')).toBeVisible()
  await page.getByLabel('Nome', { exact: true }).fill(ficticio.nome)
  await page.getByLabel('CPF').fill(ficticio.cpf)
  await page.getByLabel('Nascimento').fill(ficticio.dataNascimento)
  await page.getByLabel('Telefone').fill(ficticio.telefone)
  await page.getByLabel('E-mail').fill(ficticio.email)
  await page.getByRole('button', { name: 'Salvar paciente' }).click()
  await expect(page.getByText(ficticio.nome)).toBeVisible()
  await page.getByLabel('Buscar por nome').fill(ficticio.nome)
  await expect(page.getByText(ficticio.nome)).toBeVisible()
})

test('exibe parecer, complemento e evidencia do mesmo prontuario', async ({ page, request }) => {
  const paciente = await criarPaciente(request)
  const parecer = await criarParecer(request, paciente.id)
  await abrirProntuario(page, paciente.id)
  await expect(page.getByText(ficticio.texto)).toBeVisible()
  await page.getByRole('button', { name: 'Complementar' }).click()
  await page.getByLabel('Texto do complemento').fill(ficticio.complemento)
  await page.getByRole('button', { name: 'Salvar complemento' }).click()
  await expect(page.getByText(ficticio.complemento)).toBeVisible()
  await page.getByRole('button', { name: /Abrir fonte/ }).first().click()
  await expect(page.getByLabel('Fonte da evidência')).toContainText(ficticio.texto)
  expect(parecer.registro.pacienteId).toBe(paciente.id)
})
