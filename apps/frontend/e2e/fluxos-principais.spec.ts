import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
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

test('filtra grupos e período civil na Agenda e isola a lista do prontuário', async ({ page, request }) => {
  const pacienteA = await criarPaciente(request)
  const pacienteB = await criarPaciente(request)
  const hoje = new Date()
  const deslocamentoDias = Number.parseInt(randomUUID().slice(0, 8), 16) % 300 + 20
  const dataPassada = new Date(hoje.getTime() - deslocamentoDias * 86_400_000)
  const dataFutura = new Date(hoje.getTime() + deslocamentoDias * 86_400_000)
  const horario = (data: Date, hora: number) => {
    const local = new Date(data)
    local.setUTCHours(hora + 3, 0, 0, 0)
    return local.toISOString()
  }
  const horarioProximaPacienteA = horario(dataFutura, 15)
  await criarConsulta(request, pacienteA.id, horario(dataPassada, 9))
  await criarConsulta(request, pacienteA.id, horarioProximaPacienteA)
  const consultaPacienteB = await criarConsulta(request, pacienteB.id, horario(dataFutura, 21))
  await request.post(`/api/v1/consultas/${consultaPacienteB.id}/status`, { data: { status: 'REALIZADA' } })

  await page.goto('/agenda')
  await page.getByRole('button', { name: /Agendadas anteriores/ }).click()
  await expect(page.locator('.lista.consultas')).toContainText(pacienteA.nome)
  await expect(page.getByRole('button', { name: /Agendadas anteriores/ }).locator('.count')).toHaveText(/[1-9]\d*/)
  await page.getByLabel('Data inicial').fill(dataPassada.toISOString().slice(0, 10))
  await page.getByLabel('Data final').fill(dataPassada.toISOString().slice(0, 10))
  await page.getByRole('button', { name: 'Aplicar período' }).click()
  await expect(page.locator('.lista.consultas')).toContainText(pacienteA.nome)
  await expect(page.getByRole('button', { name: /Agendadas anteriores/ }).locator('.count')).toHaveText(/[1-9]\d*/)
  const grupoAnterior = page.getByRole('button', { name: /Agendadas anteriores/ })
  await grupoAnterior.focus()
  await page.keyboard.press('Enter')
  await expect(grupoAnterior).toHaveAttribute('aria-pressed', 'true')
  await page.setViewportSize({ width: 360, height: 800 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await expect(page.getByLabel('Data inicial')).toBeVisible()
  await page.screenshot({ path: 'test-results/agenda-360.png', fullPage: true })
  await page.setViewportSize({ width: 1280, height: 800 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: 'test-results/agenda-desktop.png', fullPage: true })

  await page.goto(`/prontuario/${pacienteA.id}?secao=consultas`)
  await expect(page.locator('.patient-heading h1')).toContainText(pacienteA.nome)
  const painelConsultas = page.getByRole('region', { name: /^Consultas de / })
  const listaConsultas = painelConsultas.locator('.lista.consultas')
  await expect(listaConsultas.locator('li')).toHaveCount(1)
  await expect(listaConsultas.locator('time')).toHaveAttribute('datetime')
  expect(await listaConsultas.locator('time').evaluate(elemento => Date.parse(elemento.getAttribute('datetime')!)))
    .toBe(Date.parse(horarioProximaPacienteA))
  // A consulta realizada de B não pode aparecer ao abrir esse grupo no prontuário de A.
  await painelConsultas.getByRole('button', { name: /^Realizadas/ }).click()
  await expect(painelConsultas.getByText('Nenhuma consulta encontrada para o periodo.', { exact: true })).toBeVisible()
  await expect(listaConsultas).toHaveCount(0)
})

test('pagina a lista de consultas sem perder o paciente selecionado', async ({ page, request }) => {
  const paciente = await criarPaciente(request)
  const deslocamentoDias = Number.parseInt(randomUUID().slice(0, 8), 16) % 3000 + 1000
  const inicio = new Date(Date.now() + deslocamentoDias * 86_400_000)
  inicio.setUTCHours(12, 0, 0, 0)
  for (let indice = 0; indice < 51; indice += 1) {
    await criarConsulta(request, paciente.id, new Date(inicio.getTime() + indice * 3_600_000).toISOString())
  }

  await page.goto('/agenda')
  await page.getByLabel('Filtrar paciente').selectOption(paciente.id)
  await expect(page.locator('.lista.consultas li')).toHaveCount(50)
  const paginacao = page.getByRole('navigation', { name: 'Paginação' })
  await expect(paginacao).toContainText('Página 1 de 2')
  await paginacao.getByRole('button', { name: 'Próxima' }).click()
  await expect(paginacao).toContainText('Página 2 de 2')
  await expect(page.locator('.lista.consultas li')).toHaveCount(1)
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
