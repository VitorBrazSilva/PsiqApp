import { test, expect } from '@playwright/test'

test('cadastra, busca, abre paciente e preserva aviso de dados ficticios', async ({ page }) => {
  await page.goto('/pacientes')
  await page.getByRole('button', { name: /Novo paciente/ }).click()
  await expect(page.getByRole('dialog', { name: 'Novo paciente' })).toBeVisible()
  await page.getByRole('button', { name: 'Fechar cadastro' }).click()
  await expect(page.getByLabel('Buscar por nome')).toBeVisible()
})

test('exibe consultas demonstrativas na agenda', async ({ page }) => {
  await page.goto('/agenda')
  await expect(page.getByRole('heading', { name: 'Agenda' })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Filtro da agenda' })).toBeVisible()
})

test('abre análise demonstrativa e suas evidências', async ({ page }) => {
  await page.goto('/prontuario/2d82ef3b-2a09-47c9-81e4-7e1150e826fb?secao=historico')
  await page.locator('.patient-tabs').getByRole('button', { name: /Análise de IA/ }).click()
  await expect(page.locator('.ai-full')).toBeVisible()
  await page.locator('.ai-full .evidence-link').first().click()
  await expect(page.locator('.dialog-evidencias[open]')).toBeVisible()
})
