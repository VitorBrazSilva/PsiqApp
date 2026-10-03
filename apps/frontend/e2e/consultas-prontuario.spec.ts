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
    if (largura === 1440) {
      const acaoStatus = painel.locator('.consulta-status-botao').first()
      await acaoStatus.hover()
      const coresStatus = await acaoStatus.evaluate(elemento => {
        const estilo = getComputedStyle(elemento)
        return { fundo: estilo.backgroundColor, borda: estilo.borderColor, texto: estilo.color }
      })
      for (const grupo of await painel.getByRole('navigation', { name: 'Grupos de consultas' }).getByRole('button').all()) {
        await grupo.hover()
        expect(await grupo.evaluate(elemento => {
          const estilo = getComputedStyle(elemento)
          return { fundo: estilo.backgroundColor, borda: estilo.borderColor, texto: estilo.color }
        })).toEqual(coresStatus)
      }
    }
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
  await expect(dialogo.locator('.agendamento-paciente')).toContainText(paciente.nome)
  await expect(dialogo.locator('.agendamento-paciente')).toContainText(paciente.email)
  await expect(dialogo.getByLabel('Paciente', { exact: true })).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(dialogo).toHaveCount(0)
  await expect(acionador).toBeFocused()
  await acionador.click()
  await dialogo.getByRole('button', { name: 'Voltar' }).click()
  await expect(dialogo).toHaveCount(0)
  await expect(acionador).toBeFocused()
})

test('agendamento segue a referência com revisão, conectores, ícones e ações responsivas', async ({ page }) => {
  await page.route('**/api/v1/consultas/disponibilidade/mensal*', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({
    mes: '2026-09', hoje: '2026-09-15', fusoHorario: 'America/Sao_Paulo', verificadoEm: '2026-09-15T12:00:00Z', fonteDisponibilidade: 'LOCAL',
    dias: [16, 17, 21, 22, 23, 24, 28, 29, 30].map(dia => ({ data: `2026-09-${dia}`, horarios: dia === 23 ? ['2026-09-23T03:00:00Z']
      : ['09:00', '10:00', '10:30', '14:00', '14:30', '15:00', '15:30', '16:00', '18:00', '18:30', '19:00'].map(hora => `2026-09-${dia}T${hora}:00-03:00`) })),
  }) }))
  for (const largura of [1440, 1024, 768, 360]) {
    await page.setViewportSize({ width: largura, height: 1080 })
    await page.goto(`/prontuario/${pacienteId}?secao=consultas`)
    await page.getByRole('button', { name: 'Agendar consulta para Helena Duarte' }).click()
    const dialogo = page.getByRole('dialog', { name: 'Agendar consulta' })
    await expect(dialogo.getByRole('button', { name: /23 de setembro.*sem horários/ })).toBeDisabled()
    await dialogo.getByRole('button', { name: /24 de setembro.*horários disponíveis/ }).click()
    await dialogo.getByRole('radio', { name: '14:30' }).check()
    await expect(dialogo.getByRole('radio', { name: '14:30' })).toBeChecked()
    await expect(dialogo.getByRole('group', { name: 'Madrugada' })).toHaveCount(0)
    await expect(dialogo.getByText('Apenas dias e horários com disponibilidade são exibidos.')).toBeVisible()
    const etapas = dialogo.getByRole('list', { name: 'Etapas do agendamento' })
    await expect(etapas.locator('[aria-current="step"]')).toContainText('Confirmação')
    expect(await etapas.locator('li').first().evaluate(elemento => parseFloat(getComputedStyle(elemento, '::after').width))).toBeGreaterThan(0)
    const revisao = dialogo.getByRole('region', { name: 'Revisão do agendamento' })
    await expect(revisao).toContainText('24 de set. de 2026')
    await expect(revisao).toContainText('14:30')
    await expect(revisao).toContainText(paciente.email)
    expect(await dialogo.evaluate(elemento => elemento.scrollWidth)).toBeLessThanOrEqual(await dialogo.evaluate(elemento => elemento.clientWidth))
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(largura)
    await dialogo.evaluate(elemento => { elemento.scrollTop = 0 })
    await page.screenshot({ path: `test-results/consultas-prontuario/agendamento-${largura}.png` })
    await dialogo.getByRole('button', { name: 'Confirmar agendamento' }).scrollIntoViewIfNeeded()
    await expect(dialogo.getByRole('button', { name: 'Voltar' })).toBeInViewport()
    await expect(dialogo.getByRole('button', { name: 'Confirmar agendamento' })).toBeInViewport()
    const voltar = (await dialogo.getByRole('button', { name: 'Voltar' }).boundingBox())!
    const confirmar = (await dialogo.getByRole('button', { name: 'Confirmar agendamento' }).boundingBox())!
    expect(voltar.x + voltar.width).toBeLessThan(confirmar.x)
    expect(Math.abs(voltar.y - confirmar.y)).toBeLessThan(2)
    expect(voltar.height).toBeGreaterThanOrEqual(44)
    expect(confirmar.height).toBeGreaterThanOrEqual(44)
    await page.screenshot({ path: `test-results/consultas-prontuario/agendamento-rodape-${largura}.png` })
    await page.keyboard.press('Escape')
  }
})
