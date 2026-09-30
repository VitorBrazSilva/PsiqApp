import { test, expect } from '@playwright/test'

test('mostra paciente e registros do prontuario demonstrativo', async ({ page }) => {
  await page.goto('/prontuario/2d82ef3b-2a09-47c9-81e4-7e1150e826fb')
  await expect(page.locator('.patient-heading h1')).toHaveText('Alex Exemplo FICTICIO')
  await expect(page.locator('.timeline-clinica')).toBeVisible()
})

test('mantem limites da analise demonstrativa depois de recarregar', async ({ page }) => {
  await page.goto('/prontuario/2d82ef3b-2a09-47c9-81e4-7e1150e826fb?secao=historico')
  await page.locator('.patient-tabs').getByRole('button', { name: /Análise de IA/ }).click()
  await expect(page.locator('.analysis-section-button')).toHaveCount(3)
  await page.reload()
  await expect(page.locator('.analysis-section-button')).toHaveCount(3)
})
