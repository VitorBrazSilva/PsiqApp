import { expect, test } from '@playwright/test'

const pacienteId = 'a1111111-1111-4111-8111-111111111111'
const registroId = 'b2222222-2222-4222-8222-222222222222'
const geracaoAtualId = 'c3333333-3333-4333-8333-333333333333'
const geracaoAnteriorId = 'd4444444-4444-4444-8444-444444444444'
const analiseAtualId = 'e5555555-5555-4555-8555-555555555555'
const analiseAnteriorId = 'f6666666-6666-4666-8666-666666666666'
const referenceUrl = new URL('../../../docs/redesign/index.html?direcao=foco&tela=prontuario&secao=analise&paciente=helena-demo', import.meta.url).href

const registro = { id: registroId, pacienteId, tipo: 'ORIGINAL', parecerOriginalId: null, consultaId: null, dataHoraClinica: '2026-09-10T12:00:00Z', criadoEm: '2026-09-10T12:01:00Z', texto: 'Relato ficticio de teste sobre sono e rotina.', humor: 'Ansioso, colaborativo', medicamentos: null, revisao: 1 }
const itemAtual = { texto: 'O sono apresenta melhora gradual com oscilacoes em semanas de maior demanda.', natureza: 'INTERPRETACAO', evidencias: [{ apelidoRegistro: 'R1', registroId, campo: 'TEXTO', citacao: 'melhora gradual com oscilacoes em semanas de maior demanda' }] }
const analiseAtual = { id: analiseAtualId, geracaoId: geracaoAtualId, pacienteId, geradaEm: '2026-09-10T15:10:00Z', modo: 'LONGITUDINAL', linhaDoTempo: [{ ...itemAtual, natureza: 'RELATO' }], padroes: [itemAtual], pontosDeAtencao: [{ ...itemAtual, texto: 'Persistem preocupacoes situacionais.' }], limitacoes: ['Historico breve, interpretado com cautela.'] }
const analiseAnterior = { ...analiseAtual, id: analiseAnteriorId, geracaoId: geracaoAnteriorId, geradaEm: '2026-08-13T15:14:00Z', linhaDoTempo: [{ ...itemAtual, texto: 'Versao anterior preservada.' }] }
const geracaoAtual = { id: geracaoAtualId, pacienteId, estado: 'CONCLUIDA', revisaoSnapshot: 2, sequenciaRequisicao: 2, solicitadaEm: '2026-09-10T15:10:00Z', totalRegistros: 1, totalOriginais: 1, totalComplementos: 0, ultimoRegistroClinicoId: registroId, modo: 'LONGITUDINAL', analiseId: analiseAtualId }
const geracaoAnterior = { ...geracaoAtual, id: geracaoAnteriorId, revisaoSnapshot: 1, sequenciaRequisicao: 1, solicitadaEm: '2026-08-13T15:14:00Z', analiseId: analiseAnteriorId }

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/**', async route => {
    const url = new URL(route.request().url())
    const path = url.pathname
    let data: unknown = { itens: [], pagina: 0, tamanho: 25, total: 0 }
    if (path === `/api/v1/pacientes/${pacienteId}`) data = { id: pacienteId, nome: 'Helena Martins', cpf: '***.***.***-09', dataNascimento: '1989-04-12', telefone: '+5511999999999', email: 'helena@example.test', queixaInicial: null, criadoEm: '2026-01-01T12:00:00Z' }
    else if (path.startsWith('/api/v1/pacientes?')) data = { itens: [], pagina: 0, tamanho: 100, total: 0 }
    else if (path === `/api/v1/pacientes/${pacienteId}/registros-clinicos?pagina=0&tamanho=100`) data = { itens: [registro], pagina: 0, tamanho: 100, total: 1 }
    else if (path === `/api/v1/pacientes/${pacienteId}/registros-clinicos/${registroId}`) data = registro
    else if (path.startsWith('/api/v1/consultas')) data = { itens: [], pagina: 0, tamanho: 50, total: 0 }
    else if (path === `/api/v1/pacientes/${pacienteId}/estado-analise`) data = { analiseAtual, ultimaGeracao: geracaoAtual, geracaoAtiva: null, podeRegenerar: true, motivo: null }
    else if (path.startsWith(`/api/v1/pacientes/${pacienteId}/geracoes-analise`)) data = { itens: [geracaoAtual, geracaoAnterior], pagina: 0, tamanho: 25, total: 2 }
    else if (path === `/api/v1/pacientes/${pacienteId}/analises/${analiseAnteriorId}`) data = analiseAnterior
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) })
  })
})

test('analysis view matches reference position, typography, and responsive layout', async ({ page }) => {
  const comparisons: Array<{ width: number; referencePanel: number; appPanel: number; referenceLeft: number; appLeft: number; referenceFonts: Record<string, string>; appFonts: Record<string, string>; horizontalOverflow: boolean }> = []
  for (const width of [768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto(referenceUrl)
    await page.locator('.ai-full .insights').waitFor()
    const referenceScreenshot = await page.screenshot({ path: `test-results/analysis-comparison/reference-${width}.png`, fullPage: true })
    await test.info().attach(`reference-${width}.png`, { body: referenceScreenshot, contentType: 'image/png' })
    const referenceMetrics = await page.locator('.ai-full .insights').evaluate(node => {
      const font = (selector: string) => { const element = node.querySelector(selector); return element ? getComputedStyle(element).fontSize : '' }
      return { width: node.getBoundingClientRect().width, left: node.getBoundingClientRect().left, fonts: {
        title: font('.insight-title h2'), metadata: font('.insight-meta'), section: font('.analysis-group summary'),
        observation: font('.analysis-observation p'), nature: font('.observation-nature'), evidence: font('.analysis-observation .evidence-link'),
        count: font('.analysis-count'), limits: font('.ai-disclaimer'),
      } }
    })
    await page.goto(`/prontuario/${pacienteId}?secao=analise`)
    await expect(page.getByRole('heading', { name: 'Análise longitudinal' })).toBeVisible()
    await expect(page.locator('.analysis-section-button')).toHaveCount(3)
    const metrics = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, panel: document.querySelector('.ai-full')?.getBoundingClientRect().width ?? 0 }))
    const appMetrics = await page.locator('.ai-full').evaluate(node => {
      const font = (selector: string) => { const element = node.querySelector(selector); return element ? getComputedStyle(element).fontSize : '' }
      return { left: node.getBoundingClientRect().left, fonts: {
        title: font('.analysis-view-heading h2'), metadata: font('.analysis-summary'), section: font('.analysis-section-button'),
        observation: font('.analysis-entry p'), nature: font('.observation-nature'), evidence: font('.analysis-entry .evidence-link'),
        count: font('.analysis-count'), limits: font('.analysis-limits'),
      } }
    })
    expect(metrics.document, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(width)
    expect(metrics.panel).toBeLessThanOrEqual(width)
    expect(referenceMetrics.width).toBeGreaterThan(0)
    expect(appMetrics.left).toBeGreaterThanOrEqual(0)
    comparisons.push({ width, referencePanel: referenceMetrics.width, appPanel: metrics.panel, referenceLeft: referenceMetrics.left, appLeft: appMetrics.left, referenceFonts: referenceMetrics.fonts, appFonts: appMetrics.fonts, horizontalOverflow: metrics.document > width })
    const appScreenshot = await page.screenshot({ path: `test-results/analysis-comparison/automated-${width}.png`, fullPage: true })
    await test.info().attach(`app-${width}.png`, { body: appScreenshot, contentType: 'image/png' })
  }
  await test.info().attach('analysis-layout-comparison.json', { body: JSON.stringify(comparisons, null, 2), contentType: 'application/json' })
})

test('history dialog supports keyboard, preserved versions, and evidence navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(`/prontuario/${pacienteId}?secao=historico`)
  await page.locator('.patient-tabs').getByRole('button', { name: /Análise de IA/ }).click()
  const historyButton = page.getByRole('button', { name: 'Histórico de análises' })
  await historyButton.focus()
  await page.keyboard.press('Enter')
  const historyDialog = page.getByRole('dialog', { name: 'Histórico de análises' })
  await expect(historyDialog).toBeVisible()
  await expect(historyDialog).toHaveAttribute('aria-labelledby', 'titulo-historico-analise')
  await page.keyboard.press('Escape')
  await expect(historyDialog).not.toBeVisible()
  await expect(historyButton).toBeFocused()

  await historyButton.click()
  await page.getByRole('button', { name: 'Abrir versão' }).click()
  await expect(page.getByText('Versao anterior preservada.')).toBeVisible()
  await page.getByRole('button', { name: /Voltar/ }).click()
  await expect(page.getByText(itemAtual.texto).first()).toBeVisible()
  const regeneration = page.waitForRequest(request => request.method() === 'POST' && request.url().endsWith('/geracoes-analise'))
  await page.getByRole('button', { name: /Atualizar análise/ }).click()
  await regeneration

  await page.getByRole('button', { name: /Histórico clínico/ }).click()
  await expect(page).toHaveURL(/secao=historico/)
  await page.goBack()
  await expect(page).toHaveURL(/secao=analise/)
  await page.goForward()
  await expect(page).toHaveURL(/secao=historico/)
  await page.goto(`/prontuario/${pacienteId}?secao=analise`)

  const evidenceButton = page.locator('.ai-full .evidence-link').first()
  await evidenceButton.click()
  await expect(page.getByRole('dialog', { name: 'Evidências desta observação' })).toBeVisible()
  await expect(page.getByRole('dialog', { name: 'Evidências desta observação' }).locator('blockquote')).toContainText(itemAtual.evidencias[0].citacao)
  await page.getByRole('button', { name: /Abrir registro completo/ }).click()
  await expect(page.getByRole('dialog', { name: 'Registro de origem' })).toBeVisible()
})
