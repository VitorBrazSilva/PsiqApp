import { expect, test } from '@playwright/test'
import type { Consulta } from '../src/features/consultas/servicoConsultas'

const pacienteId = 'a1111111-1111-4111-8111-111111111111'
const paciente = { id: pacienteId, nome: 'Helena Duarte', cpf: '***.***.***-09', dataNascimento: '1992-04-12',
  telefone: '+5511999999999', email: 'helena.ficticia@example.test', queixaInicial: null, criadoEm: '2026-01-01T12:00:00Z' }
const consultas: Consulta[] = [
  { id: 'consulta-1', pacienteId, agendadaPara: '2026-09-24T17:30:00Z', status: 'AGENDADA', observacoes: 'Sessão de acompanhamento', criadaEm: '2026-09-01T12:00:00Z', statusAlteradoEm: null },
  { id: 'consulta-2', pacienteId, agendadaPara: '2026-09-10T17:30:00Z', status: 'REALIZADA', observacoes: 'Sessão realizada', criadaEm: '2026-09-01T12:00:00Z', statusAlteradoEm: null },
  { id: 'consulta-3', pacienteId, agendadaPara: '2026-08-13T17:30:00Z', status: 'REALIZADA', observacoes: 'Retorno clínico', criadaEm: '2026-08-01T12:00:00Z', statusAlteradoEm: null },
  { id: 'consulta-4', pacienteId, agendadaPara: '2026-07-16T17:30:00Z', status: 'REALIZADA', observacoes: 'Primeiro atendimento', criadaEm: '2026-07-01T12:00:00Z', statusAlteradoEm: null },
]

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-09-15T12:00:00Z'))
  await page.route('**/api/v1/**', async route => {
    const url = new URL(route.request().url())
    let dados: unknown = { itens: [], pagina: 0, tamanho: 100, total: 0 }
    if (url.pathname === `/api/v1/pacientes/${pacienteId}`) dados = paciente
    else if (url.pathname === '/api/v1/agenda/consultas') {
      const grupo = url.searchParams.get('grupo')
      const tamanho = Number(url.searchParams.get('tamanho') ?? 50)
      const itens = consultas.filter(consulta => consulta.status === (grupo === 'REALIZADAS' ? 'REALIZADA' : grupo === 'PROXIMAS' ? 'AGENDADA' : 'CANCELADA'))
      dados = { itens: itens.slice(0, tamanho), pagina: 0, tamanho, total: itens.length,
        contagens: { PROXIMAS: 1, AGENDADAS_ANTERIORES: 0, REALIZADAS: 3, CANCELADAS: 0, FALTAS: 0 } }
    } else if (url.pathname.endsWith('/estado-analise')) dados = { analiseAtual: null, ultimaGeracao: null, geracaoAtiva: null, podeRegenerar: false }
    else if (url.pathname === '/api/v1/integracoes/google-agenda') dados = { estado: 'NAO_CONFIGURADA' }
    else if (url.pathname.endsWith('/disponibilidade/mensal')) dados = { mes: '2026-09', hoje: '2026-09-15', fusoHorario: 'America/Sao_Paulo', verificadoEm: '2026-09-15T12:00:00Z', fonteDisponibilidade: 'LOCAL', dias: [] }
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(dados) })
  })
})

test('painel branco e resumo do paciente mantêm posição e não transbordam em desktop/mobile', async ({ page }) => {
  for (const largura of [1440, 1024, 768, 360]) {
    await page.setViewportSize({ width: largura, height: 1000 })
    await page.goto(`/prontuario/${pacienteId}?secao=consultas`)
    const painel = page.getByRole('region', { name: 'Consultas de Helena' })
    const resumo = page.getByRole('complementary', { name: 'Resumo das consultas' })
    await expect(painel).toBeVisible()
    await expect(resumo.locator('data')).toHaveText('4')
    await expect(resumo).toContainText('10 de set. de 2026 às 14:30')
    await expect(page.getByRole('region', { name: 'Próxima consulta' })).toContainText('24 de set. de 2026 às 14:30')
    expect(await painel.evaluate(elemento => getComputedStyle(elemento).backgroundColor)).toBe('rgb(255, 255, 255)')
    const caixaAcao = (await painel.getByRole('button', { name: 'Agendar consulta para Helena Duarte' }).boundingBox())!
    expect(caixaAcao.height).toBeGreaterThanOrEqual(44)
    expect(caixaAcao.height).toBeLessThanOrEqual(56)
    const caixaLista = (await painel.boundingBox())!
    const caixaResumo = (await resumo.boundingBox())!
    if (largura > 740) {
      expect(caixaResumo.x).toBeGreaterThan(caixaLista.x + caixaLista.width)
      expect(Math.abs(caixaResumo.y - caixaLista.y)).toBeLessThan(2)
    } else {
      expect(caixaResumo.y).toBeGreaterThan(caixaLista.y + caixaLista.height)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(largura)
    await page.screenshot({ path: `test-results/consultas-prontuario/consultas-${largura}.png`, fullPage: true })
    await painel.getByRole('button', { name: /^Realizadas/ }).click()
    await expect(painel.locator('.lista.consultas > li')).toHaveCount(3)
    await expect(resumo.locator('data')).toHaveText('4')
    await page.screenshot({ path: `test-results/consultas-prontuario/realizadas-${largura}.png`, fullPage: true })
  }
})

test('a ação do painel abre agendamento para o paciente atual com teclado e retorna foco', async ({ page }) => {
  await page.goto(`/prontuario/${pacienteId}?secao=consultas`)
  const acionador = page.getByRole('region', { name: 'Consultas de Helena' }).getByRole('button', { name: 'Agendar consulta para Helena Duarte' })
  await acionador.focus()
  await page.keyboard.press('Enter')
  const dialogo = page.getByRole('dialog', { name: 'Agendar consulta' })
  await expect(dialogo).toBeVisible()
  await expect(dialogo).toContainText('Helena Duarte / Paciente fictício')
  await expect(dialogo.getByLabel('Paciente', { exact: true })).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(dialogo).toHaveCount(0)
  await expect(acionador).toBeFocused()
})
