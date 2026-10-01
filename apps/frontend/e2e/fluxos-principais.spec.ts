import { test, expect } from '@playwright/test'
import { aguardarGeracaoConcluida, aguardarRegistroAnalise, criarConsulta, criarPaciente, criarParecer, ficticio } from './fixtures'

test('cadastra, busca, abre paciente e preserva aviso de dados ficticios', async ({ page }) => {
  await page.goto('/pacientes')
  await page.getByRole('button', { name: /Novo paciente/ }).click()
  await expect(page.getByRole('dialog', { name: 'Novo paciente' })).toBeVisible()
  await page.getByRole('button', { name: 'Fechar cadastro' }).click()
  await expect(page.getByLabel('Buscar por nome')).toBeVisible()
})

test('cria consulta e exibe paciente associado na agenda', async ({ page, request }) => {
  const paciente = await criarPaciente(request)
  await criarConsulta(request, paciente.id)
  await page.goto('/agenda')
  await expect(page.getByRole('heading', { name: 'Agenda', exact: true })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Filtrar paciente' })).toBeVisible()
  await expect(page.locator('.lista.consultas')).toContainText(paciente.nome)
})

test('abre análise e suas evidências do mesmo prontuário', async ({ page, request }) => {
  const paciente = await criarPaciente(request)
  const parecer = await criarParecer(request, paciente.id)
  await aguardarGeracaoConcluida(request, paciente.id)
  await aguardarRegistroAnalise(request, paciente.id, parecer.registro.id)
  await page.goto(`/prontuario/${paciente.id}?secao=analise`)
  await expect(page.getByRole('heading', { name: 'Análise longitudinal' })).toBeVisible()
  await page.locator('.analysis-section-button[data-analysis-section="linhaDoTempo"]').click()
  await page.getByRole('button', { name: /Ver evidências:/ }).first().click()
  await expect(page.getByRole('dialog', { name: 'Evidências desta observação' })).toBeVisible()
  await expect(page.getByRole('dialog', { name: 'Evidências desta observação' })).toContainText(ficticio.texto)
})
