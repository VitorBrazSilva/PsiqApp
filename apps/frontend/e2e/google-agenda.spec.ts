import { disponibilidadeTeste } from '../src/test/disponibilidadeTeste'
import { expect, test, type Page, type Route } from '@playwright/test'

const paciente = {
  id: '11111111-1111-4111-8111-111111111111',
  nome: 'Paciente E2E Ficticio',
  cpf: '***.***.***-09',
  dataNascimento: '1990-01-01',
  telefone: '+5511999999999',
  email: 'e2e.ficticio@example.test',
  queixaInicial: null,
  criadoEm: '2026-01-01T12:00:00Z',
}

function respostaJson(route: Route, dados: unknown, status = 200) {
  return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(dados) })
}

async function prepararApiFake(page: Page, inicio: { estado?: string, disponibilidade?: string, consultas?: Record<string, unknown>[] } = {}) {
  let estado = inicio.estado ?? 'NAO_CONECTADA'
  let disponibilidade = inicio.disponibilidade ?? 'DISPONIVEL'
  const consultas = [...(inicio.consultas ?? [])]
  const chamadas: { caminho: string, metodo: string }[] = []

  await page.route('**/api/v1/**', async route => {
    const requisicao = route.request()
    const url = new URL(requisicao.url())
    const caminho = url.pathname
    const metodo = requisicao.method()
    chamadas.push({ caminho, metodo })

    if (caminho === '/api/v1/integracoes/google-agenda/conectar' && metodo === 'GET') {
      estado = 'CONECTADA'
      return route.fulfill({ status: 302, headers: { Location: '/agenda?googleAgenda=conectada' } })
    }
    if (caminho === '/api/v1/integracoes/google-agenda' && metodo === 'GET') {
      return respostaJson(route, { estado })
    }
    if (caminho === '/api/v1/integracoes/google-agenda/conexao' && metodo === 'DELETE') {
      estado = 'DESCONECTADA'
      return route.fulfill({ status: 204, body: '' })
    }
    if (caminho === '/api/v1/consultas/disponibilidade' && metodo === 'GET') {
      return respostaJson(route, { estado: disponibilidade, fusoHorario: 'America/Sao_Paulo', verificadoEm: '2026-09-20T12:00:00Z' })
    }
    if (caminho === '/api/v1/pacientes' && metodo === 'GET') {
      return respostaJson(route, { itens: [paciente], pagina: 0, tamanho: 100, total: 1 })
    }
    if (caminho === '/api/v1/consultas/disponibilidade/mensal') return respostaJson(route, disponibilidadeTeste)
    if (caminho === '/api/v1/agenda/consultas') {
      const contagens = { PROXIMAS: 0, AGENDADAS_ANTERIORES: 0, REALIZADAS: 0, CANCELADAS: 0, FALTAS: 0 }
      const grupo = (status: unknown) => status === 'AGENDADA' ? 'PROXIMAS' : status === 'REALIZADA' ? 'REALIZADAS' : status === 'CANCELADA' ? 'CANCELADAS' : 'FALTAS'
      consultas.forEach(item => contagens[grupo(item.status)]++)
      const itens = consultas.filter(item => grupo(item.status) === (url.searchParams.get('grupo') ?? 'PROXIMAS'))
        .sort((a, b) => Date.parse(String(a.agendadaPara)) - Date.parse(String(b.agendadaPara)))
      const tamanho = Number(url.searchParams.get('tamanho') ?? 50)
      return respostaJson(route, { itens: itens.slice(0, tamanho), pagina: 0, tamanho, total: itens.length, contagens })
    }
    if (caminho === '/api/v1/consultas' && metodo === 'GET') {
      return respostaJson(route, { itens: consultas, pagina: 0, tamanho: 50, total: consultas.length })
    }
    if (caminho === `/api/v1/pacientes/${paciente.id}/consultas` && metodo === 'POST') {
      const corpo = requisicao.postDataJSON() as { agendadaPara: string }
      const novaConsulta = {
        id: '22222222-2222-4222-8222-222222222222',
        pacienteId: paciente.id,
        agendadaPara: corpo.agendadaPara,
        status: 'AGENDADA',
        observacoes: null,
        criadaEm: '2026-09-20T12:00:00Z',
        statusAlteradoEm: null,
        sincronizacaoGoogleAgenda: { estado: estado === 'CONECTADA' ? 'PENDENTE' : 'AGUARDANDO_CONEXAO', ultimaTentativa: null },
      }
      consultas.unshift(novaConsulta)
      return respostaJson(route, novaConsulta, 201)
    }
    if (caminho.includes('/sincronizacao-google/tentar-novamente') && metodo === 'POST') {
      const idConsulta = caminho.split('/').at(-3)
      const indice = consultas.findIndex(consulta => consulta.id === idConsulta)
      const atualizada = { ...consultas[indice], sincronizacaoGoogleAgenda: { estado: 'PENDENTE', ultimaTentativa: null } }
      if (indice >= 0) consultas[indice] = atualizada
      return respostaJson(route, atualizada, 202)
    }
    if (caminho.endsWith('/status') && metodo === 'POST') {
      const idConsulta = caminho.split('/').at(-2)
      const indice = consultas.findIndex(consulta => consulta.id === idConsulta)
      const atualizada = { ...consultas[indice], status: (requisicao.postDataJSON() as { status: string }).status }
      if (indice >= 0) consultas[indice] = atualizada
      return respostaJson(route, atualizada)
    }
    return respostaJson(route, { itens: [], pagina: 0, tamanho: 25, total: 0 })
  })

  return {
    chamadas,
    definirDisponibilidade(valor: string) { disponibilidade = valor },
  }
}

test('permite agendamento local após confirmar disponibilidade e mostra o estado pendente', async ({ page }) => {
  const fake = await prepararApiFake(page, { estado: 'NAO_CONECTADA' })
  await page.goto('/agenda')
  await expect(page.getByText(/Google Agenda: Não conectada/)).toBeVisible()
  await expect(page.getByRole('link', { name: 'Conectar conta Google' })).toHaveAttribute('href', '/api/v1/integracoes/google-agenda/conectar')
  await page.getByRole('button', { name: 'Agendar consulta' }).click()
  await page.getByRole('button', { name: 'Informar data e hora' }).click()

  await expect(page.locator('#disponibilidade-consulta-mensagem')).toHaveAttribute('role', 'status')
  await expect(page.getByLabel('Data e hora')).toHaveAttribute('aria-describedby', 'disponibilidade-consulta-mensagem')
  await page.locator('#agenda-paciente').selectOption(paciente.id)
  await page.getByLabel('Data e hora').fill('2026-09-24T12:00')
  await page.getByRole('button', { name: 'Verificar disponibilidade' }).click()
  await expect(page.getByText('Este horário está disponível para agendamento.')).toBeVisible()
  await page.getByRole('dialog').getByRole('button', { name: 'Agendar consulta' }).click()

  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByText('Consulta agendada com sucesso.')).toBeVisible()
  await expect(page.getByText('Aguardando conexão com Google Agenda')).toBeVisible()
  expect(fake.chamadas).toContainEqual({ caminho: '/api/v1/consultas/disponibilidade', metodo: 'GET' })
  expect(fake.chamadas.some(chamada => chamada.metodo === 'POST' && chamada.caminho.endsWith('/consultas'))).toBe(true)
})

test('distingue horário ocupado de indisponibilidade e impede o envio nos dois casos', async ({ page }) => {
  const fake = await prepararApiFake(page, { estado: 'CONECTADA', disponibilidade: 'OCUPADO' })
  await page.goto('/agenda')
  await page.getByRole('button', { name: 'Agendar consulta' }).click()
  await page.getByRole('button', { name: 'Informar data e hora' }).click()
  await page.getByLabel('Data e hora').fill('2026-09-24T12:00')
  await page.getByRole('button', { name: 'Verificar disponibilidade' }).click()
  await expect(page.getByText(/Este horário já está ocupado/)).toBeVisible()
  await expect(page.locator('#disponibilidade-consulta-mensagem')).toHaveAttribute('aria-live', 'polite')
  await expect(page.getByLabel('Data e hora')).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Agendar consulta' })).toBeDisabled()
  expect(fake.chamadas.some(chamada => chamada.metodo === 'POST' && chamada.caminho.endsWith('/consultas'))).toBe(false)

  fake.definirDisponibilidade('INDISPONIVEL')
  await page.getByLabel('Data e hora').fill('2026-09-25T12:00')
  await page.getByRole('button', { name: 'Verificar disponibilidade' }).click()
  await expect(page.getByText(/Não foi possível verificar a agenda/)).toBeVisible()
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Agendar consulta' })).toBeDisabled()
  expect(fake.chamadas.some(chamada => chamada.metodo === 'POST' && chamada.caminho.endsWith('/consultas'))).toBe(false)
})

test('simula conexão e desconexão com o redirecionamento OAuth local', async ({ page }) => {
  await prepararApiFake(page, { estado: 'NAO_CONECTADA' })
  page.on('dialog', dialog => dialog.accept())
  await page.goto('/agenda')

  await page.getByRole('link', { name: 'Conectar conta Google' }).click()
  await expect(page).toHaveURL(/googleAgenda=conectada/)
  await expect(page.getByRole('button', { name: 'Desconectar Google Agenda' })).toBeVisible()
  await expect(page.getByText('A conexão com Google Agenda foi concluída.')).toBeVisible()
  await page.getByRole('button', { name: 'Desconectar Google Agenda' }).click()

  await expect(page.getByRole('link', { name: 'Conectar novamente' })).toBeVisible()
  await expect(page.getByText(/Eventos Google já criados permanecem no calendário/)).toBeVisible()
})

test('apresenta os estados de sincronização e mantém o horário ao finalizar consultas', async ({ page }) => {
  const consulta = (id: string, dia: number, sincronizacao: string) => ({
    id,
    pacienteId: paciente.id,
    agendadaPara: `2026-09-${dia}T15:00:00Z`,
    status: 'AGENDADA',
    observacoes: null,
    criadaEm: '2026-09-20T12:00:00Z',
    statusAlteradoEm: null,
    sincronizacaoGoogleAgenda: { estado: sincronizacao, ultimaTentativa: null },
  })
  const consultaRealizada = consulta('consulta-realizada', 25, 'SINCRONIZADA')
  const consultaFalta = consulta('consulta-falta', 26, 'AGUARDANDO_CONEXAO')
  const consultaCancelada = consulta('consulta-cancelada', 27, 'PENDENTE')
  const consultaFalha = consulta('consulta-falha', 28, 'FALHA')
  const consultaLegada = consulta('consulta-legada', 29, 'NAO_APLICAVEL')
  const fake = await prepararApiFake(page, {
    estado: 'NAO_CONECTADA',
    consultas: [consultaRealizada, consultaFalta, consultaCancelada, consultaFalha, consultaLegada],
  })
  await page.goto('/agenda')

  await expect(page.getByText('Sincronizada com Google Agenda')).toBeVisible()
  await expect(page.getByText('Aguardando conexão com Google Agenda')).toBeVisible()
  await expect(page.getByText('Aguardando sincronização com Google Agenda')).toBeVisible()
  await expect(page.getByText('Falha ao sincronizar com Google Agenda')).toBeVisible()
  await expect(page.getByText('Sem evento Google associado')).toBeVisible()
  const consultaComFalha = page.locator('.lista.consultas > li').filter({ hasText: '28' })
  await consultaComFalha.getByRole('button', { name: 'Tentar sincronizar novamente' }).click()
  expect(fake.chamadas).toContainEqual({ caminho: '/api/v1/consultas/consulta-falha/sincronizacao-google/tentar-novamente', metodo: 'POST' })

  const itens = page.locator('.lista.consultas > li')
  await itens.nth(0).getByRole('button', { name: 'Realizada' }).click()
  await page.getByRole('button', { name: /Realizadas/ }).click()
  await expect(itens.nth(0).locator('.consulta-status')).toHaveText('Realizada')
  await expect(itens.nth(0)).toContainText('12:00')
  await page.getByRole('button', { name: /Próximas/ }).click()
  await itens.nth(0).getByRole('button', { name: 'Falta' }).click()
  await page.getByRole('button', { name: /Faltas/ }).click()
  await expect(itens.nth(0).locator('.consulta-status')).toHaveText('Falta')
  await expect(itens.nth(0)).toContainText('12:00')
  await page.getByRole('button', { name: /Próximas/ }).click()
  await itens.nth(0).getByRole('button', { name: 'Cancelada' }).click()
  await page.getByRole('button', { name: /Canceladas/ }).click()
  await expect(itens.nth(0).locator('.consulta-status')).toHaveText('Cancelada')
  await expect(itens.nth(0)).toContainText('12:00')
})

test('mantém controles acessíveis por teclado e em viewport estreita', async ({ page }) => {
  await prepararApiFake(page, { estado: 'DESCONECTADA' })
  await page.setViewportSize({ width: 320, height: 812 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/agenda')

  await page.keyboard.press('Tab')
  await expect(page.locator('.skip-link')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#conteudo')).toBeFocused()
  await expect(page.getByRole('link', { name: 'Conectar novamente' })).toBeVisible()
  await page.getByRole('button', { name: 'Agendar consulta' }).click()
  await page.getByRole('button', { name: 'Informar data e hora' }).click()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  expect(await page.getByRole('button', { name: 'Verificar disponibilidade' }).evaluate(element => getComputedStyle(element).minHeight)).toBe('44px')
})

test('organiza a Agenda com próxima consulta, integração lateral e cadastro sob demanda', async ({ page }) => {
  const dataProxima = new Date(Date.now() + 2 * 86_400_000)
  dataProxima.setUTCHours(12, 0, 0, 0)
  const proxima = {
    id: 'consulta-proxima-layout', pacienteId: paciente.id, agendadaPara: dataProxima.toISOString(), status: 'AGENDADA',
    observacoes: null, criadaEm: '2026-10-01T12:00:00Z', statusAlteradoEm: null,
    sincronizacaoGoogleAgenda: { estado: 'NAO_APLICAVEL', ultimaTentativa: null },
  }
  const fake = await prepararApiFake(page, { estado: 'DESCONECTADA', consultas: [proxima] })
  await page.goto('/agenda')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('region', { name: 'Próxima consulta' })).toContainText(paciente.nome)
  await expect(page.getByRole('region', { name: 'Próxima consulta' }).locator('time')).toHaveAttribute('datetime', proxima.agendadaPara)
  await expect(page.getByRole('region', { name: 'Próxima consulta' })).toContainText('09:00')
  expect(fake.chamadas.some(chamada => chamada.caminho.includes('/disponibilidade'))).toBe(false)

  for (const largura of [320, 360, 768, 1024, 1440]) {
    await page.setViewportSize({ width: largura, height: 900 })
    const lista = (await page.getByRole('region', { name: 'Consultas', exact: true }).boundingBox())!
    const google = (await page.getByRole('region', { name: 'Google Agenda', exact: true }).boundingBox())!
    if (largura >= 1024) expect(google.x).toBeGreaterThanOrEqual(lista.x + lista.width)
    else expect(google.y).toBeGreaterThanOrEqual(lista.y + lista.height)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: `test-results/agenda-layout/agenda-${largura}.png`, fullPage: true })
  }

  const acionador = page.getByRole('button', { name: 'Agendar consulta' })
  await acionador.focus()
  await page.keyboard.press('Enter')
  const dialogo = page.getByRole('dialog', { name: 'Agendar consulta' })
  await expect(dialogo).toBeVisible()
  await expect(dialogo.getByRole('button', { name: 'Fechar agendamento' })).toBeFocused()
  await expect(dialogo.getByLabel('Paciente', { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialogo).toHaveCount(0)
  await expect(acionador).toBeFocused()
})
