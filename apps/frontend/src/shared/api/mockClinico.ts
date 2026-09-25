const paciente = { id: 'mock-helena', nome: 'Helena Duarte', cpf: '529.982.247-25', dataNascimento: '1992-03-18', telefone: '(11) 90000-0000', email: 'helena.ficticia@example.test', queixaInicial: 'Dificuldade para dormir e mudanças na rotina.' }
const pacientes = [paciente]
const pagina = <T,>(itens: T[]) => ({ itens, pagina: 0, tamanho: 100, total: itens.length })
const registros = [
  { id: 'setembro', pacienteId: paciente.id, tipo: 'ORIGINAL', parecerOriginalId: null, consultaId: null, dataHoraClinica: '2026-09-10T14:30:00', criadoEm: '2026-09-10T15:08:00', texto: 'Relata sono mais regular nas últimas duas semanas e retomada de caminhadas pela manhã. Refere que manter uma rotina tem ajudado na organização do dia. Ainda percebe dificuldade para desacelerar após o trabalho.', humor: 'Tranquila durante a consulta', medicamentos: 'Não informado', revisao: 1 },
  { id: 'agosto', pacienteId: paciente.id, tipo: 'ORIGINAL', parecerOriginalId: null, consultaId: null, dataHoraClinica: '2026-08-13T14:30:00', criadoEm: '2026-08-13T15:12:00', texto: 'Refere dificuldade para iniciar o sono em dias de maior demanda profissional. Conta que tem reservado pouco tempo para atividades de lazer. Mantém contato frequente com a irmã e descreve essa relação como fonte de apoio.', humor: 'Apreensiva com a rotina', medicamentos: 'Não informado', revisao: 1 },
  { id: 'julho', pacienteId: paciente.id, tipo: 'ORIGINAL', parecerOriginalId: null, consultaId: null, dataHoraClinica: '2026-07-16T14:30:00', criadoEm: '2026-07-16T15:05:00', texto: 'Primeiro registro de acompanhamento. Relata mudanças recentes na rotina de trabalho e horários de sono irregulares. Apresenta o contexto familiar e descreve as atividades que gostaria de retomar.', humor: 'Não informado', medicamentos: 'Não informado', revisao: 1 },
]
const evidence = (registroId: string, campo: 'TEXTO' | 'HUMOR', citacao: string) => ({ apelidoRegistro: { julho: 'R1', agosto: 'R2', setembro: 'R3' }[registroId as 'julho' | 'agosto' | 'setembro'], registroId, campo, citacao })
const analise = { id: 'mock-analise', geracaoId: 'mock-geracao', pacienteId: paciente.id, geradaEm: '2026-09-10T15:10:00', modo: 'LONGITUDINAL', linhaDoTempo: [
  { texto: 'Em julho, foram registrados horários de sono irregulares e mudanças na rotina profissional.', natureza: 'RELATO', evidencias: [evidence('julho', 'TEXTO', 'Relata mudanças recentes na rotina de trabalho e horários de sono irregulares.')] },
  { texto: 'Em agosto, o relato associa dificuldade para iniciar o sono a dias de maior demanda no trabalho.', natureza: 'RELATO', evidencias: [evidence('agosto', 'TEXTO', 'Refere dificuldade para iniciar o sono em dias de maior demanda profissional.')] },
  { texto: 'Em setembro, relata sono mais regular e retomada das caminhadas pela manhã.', natureza: 'RELATO', evidencias: [evidence('setembro', 'TEXTO', 'Relata sono mais regular nas últimas duas semanas e retomada das caminhadas pela manhã.')] },
], padroes: [
  { texto: 'A rotina profissional aparece relacionada ao sono ou à dificuldade de desacelerar em mais de um relato.', natureza: 'INTERPRETACAO', evidencias: [evidence('agosto', 'TEXTO', 'Refere dificuldade para iniciar o sono em dias de maior demanda profissional.'), evidence('setembro', 'TEXTO', 'Ainda percebe dificuldade para desacelerar após o trabalho.')] },
  { texto: 'A retomada de atividades pessoais aparece como tema recorrente, com desejo registrado em julho e caminhadas relatadas em setembro.', natureza: 'INTERPRETACAO', evidencias: [evidence('julho', 'TEXTO', 'Apresenta o contexto familiar e descreve as atividades que gostaria de retomar.'), evidence('setembro', 'TEXTO', 'Relata sono mais regular nas últimas duas semanas e retomada das caminhadas pela manhã.')] },
], pontosDeAtencao: [
  { texto: 'Apesar do sono mais regular relatado em setembro, ainda há menção à dificuldade para desacelerar após o trabalho.', natureza: 'INTERPRETACAO', evidencias: [evidence('setembro', 'TEXTO', 'Ainda percebe dificuldade para desacelerar após o trabalho.')] },
  { texto: 'Em agosto, o estado/humor foi registrado como apreensivo em relação à rotina.', natureza: 'RELATO', evidencias: [evidence('agosto', 'HUMOR', 'Apreensiva com a rotina')] },
  { texto: 'O pouco tempo para lazer foi mencionado no relato de agosto.', natureza: 'RELATO', evidencias: [evidence('agosto', 'TEXTO', 'Conta que tem reservado pouco tempo para atividades de lazer.')] },
], limitacoes: ['Histórico de três consultas. Os relatos não permitem estabelecer relações de causa.', 'A análise apoia a leitura; a decisão clínica é do médico.'] }
const geracao = { id: 'mock-geracao', pacienteId: paciente.id, estado: 'CONCLUIDA', revisaoSnapshot: 3, sequenciaRequisicao: 1, solicitadaEm: '2026-09-10T15:10:00', totalRegistros: 3, totalOriginais: 3, totalComplementos: 0, ultimoRegistroClinicoId: 'setembro', modo: 'LONGITUDINAL', analiseId: analise.id }
const consultas = [{ id: 'consulta-proxima', pacienteId: paciente.id, agendadaPara: '2026-09-24T14:30:00', status: 'AGENDADA', observacoes: null, criadaEm: '2026-09-10T15:10:00', statusAlteradoEm: null }, { id: 'consulta-setembro', pacienteId: paciente.id, agendadaPara: '2026-09-10T14:30:00', status: 'REALIZADA', observacoes: null, criadaEm: '2026-09-10T15:10:00', statusAlteradoEm: null }, { id: 'consulta-agosto', pacienteId: paciente.id, agendadaPara: '2026-08-13T14:30:00', status: 'REALIZADA', observacoes: null, criadaEm: '2026-08-13T15:10:00', statusAlteradoEm: null }]

export function mockClinico(caminho: string, metodo = 'GET'): unknown {
  if (metodo !== 'GET') throw new Error('MOCK_WRITE_UNSUPPORTED')
  if (caminho === '/pacientes' || caminho.startsWith('/pacientes?')) return pagina(pacientes)
  if (caminho === `/pacientes/${paciente.id}`) return paciente
  if (caminho.includes('/registros-clinicos/')) return registros.find(registro => caminho.includes(`/${registro.id}`)) ?? registros[0]
  if (caminho.includes('/registros-clinicos')) return pagina(registros)
  if (caminho.includes('/estado-analise')) return { analiseAtual: analise, ultimaGeracao: geracao, geracaoAtiva: null, podeRegenerar: true, motivo: null }
  if (caminho.includes('/geracoes-analise')) return pagina([geracao])
  if (caminho.includes('/analises/')) return analise
  if (caminho.includes('/consultas')) return pagina(consultas)
  return pagina([])
}
