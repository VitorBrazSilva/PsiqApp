import { expect, test, type Page } from '@playwright/test'
import { disponibilidadeTeste } from '../src/test/disponibilidadeTeste'
import { criarPaciente } from './fixtures'

const paciente = { id: '11111111-1111-4111-8111-111111111111', nome: 'Paciente Agenda Fictício', cpf: '***.***.***-25', dataNascimento: '1990-01-01', telefone: '+5511999999999', email: 'ficticio@example.test', queixaInicial: null }

async function prepararFake(page: Page) {
  let falha: number | null = null
  let perderResposta = false
  const consultas: Record<string, unknown>[] = []
  const envios: { corpo: string | null, chave: string }[] = []
  await page.route('**/api/v1/**', async route => {
    const req = route.request()
    const url = new URL(req.url())
    const caminho = url.pathname
    const json = (dados: unknown) => route.fulfill({ contentType: 'application/json', body: JSON.stringify(dados) })
    if (caminho === '/api/v1/integracoes/google-agenda') return json({ estado: 'NAO_CONFIGURADA' })
    if (caminho.includes('/disponibilidade/mensal')) return json(disponibilidadeTeste)
    if (caminho.includes('/disponibilidade')) return json({ estado: 'DISPONIVEL' })
    if (req.method() === 'POST' && caminho.endsWith('/consultas')) {
      envios.push({ corpo: req.postData(), chave: req.headers()['idempotency-key'] })
      if (falha) {
        const status = falha
        falha = null
        return route.fulfill({ status, contentType: 'application/problem+json', body: JSON.stringify({ codigo: status === 503 ? 'GOOGLE_DISPONIBILIDADE_INDISPONIVEL' : 'CONFLITO' }) })
      }
      const corpo = req.postDataJSON() as { agendadaPara: string, observacoes: string | null }
      const existente = consultas.find(item => item.chave === req.headers()['idempotency-key'])
      const consulta = existente ?? { id: `consulta-${consultas.length}`, pacienteId: paciente.id, ...corpo, status: 'AGENDADA', criadaEm: disponibilidadeTeste.verificadoEm, statusAlteradoEm: null, chave: req.headers()['idempotency-key'], sincronizacaoGoogleAgenda: { estado: 'AGUARDANDO_CONEXAO', ultimaTentativa: null } }
      if (!existente) consultas.push(consulta)
      if (perderResposta) { perderResposta = false; return route.abort('failed') }
      return json(consulta)
    }
    if (caminho === '/api/v1/pacientes') return json({ itens: [paciente], pagina: 0, tamanho: 100, total: 1 })
    if (caminho === `/api/v1/pacientes/${paciente.id}`) return json(paciente)
    if (caminho.endsWith('/estado-analise')) return json({ analiseAtual: null, geracaoAtiva: null, ultimaGeracao: null, podeRegenerar: false })
    if (caminho === '/api/v1/agenda/consultas') {
      const anterior = (item: Record<string, unknown>) => String(item.agendadaPara) < disponibilidadeTeste.verificadoEm
      const grupo = url.searchParams.get('grupo') ?? 'PROXIMAS'
      const itens = consultas.filter(item => grupo === (anterior(item) ? 'AGENDADAS_ANTERIORES' : 'PROXIMAS'))
      return json({ itens, pagina: 0, tamanho: 50, total: itens.length, contagens: { PROXIMAS: consultas.filter(item => !anterior(item)).length, AGENDADAS_ANTERIORES: consultas.filter(anterior).length, REALIZADAS: 0, CANCELADAS: 0, FALTAS: 0 } })
    }
    return json({ itens: [], pagina: 0, tamanho: 50, total: 0 })
  })
  return { envios, consultas, falhar: (status: number) => { falha = status }, perder: () => { perderResposta = true } }
}

async function selecionar(page: Page) {
  const dia = page.getByRole('button', { name: /3 de outubro.*horários disponíveis/ })
  await dia.focus()
  await page.keyboard.press('Enter')
  const horario = page.getByRole('radio', { name: '09:00' })
  await horario.focus()
  await page.keyboard.press('Space')
  await expect(horario).toBeChecked()
  await expect(page.getByRole('region', { name: 'Revisão do agendamento' })).toContainText('sábado, 3 de outubro de 2026')
}

for (const timezoneId of ['UTC', 'Pacific/Honolulu']) {
  test.describe(`agendamento em ${timezoneId}`, () => {
    test.use({ timezoneId })
    test('busca, revisa e confirma nas duas origens com teclado e layout 360px/desktop', async ({ page }) => {
      const fake = await prepararFake(page)
      await page.goto('/agenda')
      await selecionar(page)
      await page.getByRole('button', { name: 'Confirmar agendamento' }).click()
      await expect(page.getByLabel('Paciente', { exact: true })).toHaveAttribute('aria-invalid', 'true')
      expect(fake.envios).toHaveLength(0)
      await page.getByLabel('Paciente', { exact: true }).selectOption(paciente.id)
      await selecionar(page)
      for (const largura of [360, 1280]) {
        await page.setViewportSize({ width: largura, height: 900 })
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
        await page.screenshot({ path: `test-results/agendamento-${timezoneId.replace('/', '-')}-${largura}.png`, fullPage: true })
      }
      await page.getByRole('button', { name: 'Confirmar agendamento' }).click()
      await expect(page.locator('.lista.consultas')).toContainText('Aguardando conexão com Google Agenda')
      expect(JSON.parse(fake.envios[0].corpo!).agendadaPara).toBe('2026-10-03T12:00:00Z')
      await page.goto(`/prontuario/${paciente.id}?secao=consultas`)
      const acionador = page.getByRole('button', { name: 'Agendar consulta', exact: true })
      await acionador.click()
      const dialogo = page.getByRole('dialog', { name: 'Agendar consulta' })
      await expect(dialogo).toBeVisible()
      await expect(page.getByRole('button', { name: 'Fechar agendamento' })).toBeFocused()
      await expect(dialogo.getByLabel('Paciente', { exact: true })).toHaveCount(0)
      await selecionar(page)
      await page.getByRole('button', { name: 'Confirmar agendamento' }).focus()
      await page.keyboard.press('Tab')
      // O dialog nativo pode passar pelo chrome do navegador antes de voltar ao início.
      expect(await dialogo.evaluate(elemento => document.activeElement === document.body || elemento.contains(document.activeElement))).toBe(true)
      if (await page.evaluate(() => document.activeElement === document.body)) await page.keyboard.press('Tab')
      expect(await dialogo.evaluate(elemento => elemento.contains(document.activeElement))).toBe(true)
      await selecionar(page)
      await page.setViewportSize({ width: 360, height: 800 })
      expect(await dialogo.evaluate(elemento => elemento.scrollWidth <= elemento.clientWidth)).toBe(true)
      await page.screenshot({ path: `test-results/dialogo-agendamento-${timezoneId.replace('/', '-')}-360.png` })
      await page.keyboard.press('Escape')
      await expect(dialogo).toHaveCount(0)
      await expect(acionador).toBeFocused()
      await acionador.click()
      await selecionar(page)
      await page.getByRole('button', { name: 'Confirmar agendamento' }).click()
      await expect(dialogo).toHaveCount(0)
      await expect(acionador).toBeFocused()
      expect(fake.envios).toHaveLength(2)
      expect(fake.consultas.every(item => item.pacienteId === paciente.id)).toBe(true)
    })
  })
}

test('recupera conflito, falha Google, resposta perdida e cadastro retroativo', async ({ page }) => {
  const fake = await prepararFake(page)
  await page.goto('/agenda')
  await page.getByLabel('Paciente', { exact: true }).selectOption(paciente.id)
  await selecionar(page)
  fake.falhar(409)
  await page.getByRole('button', { name: 'Confirmar agendamento' }).click()
  await expect(page.getByText(/Este horário deixou de estar disponível/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Confirmar agendamento' })).toBeDisabled()
  await selecionar(page)
  fake.falhar(503)
  await page.getByRole('button', { name: 'Confirmar agendamento' }).click()
  await expect(page.getByRole('button', { name: 'Buscar novamente' })).toBeVisible()
  await expect(page.getByRole('radio')).toHaveCount(0)
  await page.getByRole('button', { name: 'Buscar novamente' }).click()
  await selecionar(page)
  fake.perder()
  await page.getByRole('button', { name: 'Confirmar agendamento' }).click()
  await page.getByRole('button', { name: 'Repetir confirmação' }).click()
  expect(fake.envios[2]).toEqual(fake.envios[3])
  expect(fake.consultas).toHaveLength(1)
  await page.getByRole('button', { name: 'Informar data e hora' }).click()
  await page.getByLabel('Data e hora').fill('2020-01-01T09:00')
  await page.getByRole('button', { name: 'Verificar disponibilidade' }).click()
  await page.getByRole('button', { name: 'Criar consulta' }).click()
  await page.getByRole('button', { name: /Agendadas anteriores/ }).click()
  await expect(page.locator('.lista.consultas')).toContainText('2020')
})

test('confirma horário do contrato mensal com backend real e PostgreSQL', async ({ page, request }) => {
  const pacienteReal = await criarPaciente(request)
  await page.goto(`/prontuario/${pacienteReal.id}?secao=consultas`)
  await page.getByRole('button', { name: 'Agendar consulta', exact: true }).click()
  const data = page.getByRole('button', { name: /horários disponíveis/ }).last()
  await data.click()
  const horario = page.getByRole('radio').last()
  const instante = await horario.getAttribute('value')
  await horario.check()
  await page.getByRole('button', { name: 'Confirmar agendamento' }).click()
  await expect(page.getByRole('dialog', { name: 'Agendar consulta' })).toHaveCount(0)
  await expect(page.locator('.lista.consultas li')).toHaveCount(1)
  const resposta = await request.get(`/api/v1/agenda/consultas?pacienteId=${pacienteReal.id}`)
  const dados = await resposta.json()
  expect(dados.itens[0].agendadaPara).toBe(instante)
  expect(dados.contagens.PROXIMAS).toBe(1)
})
