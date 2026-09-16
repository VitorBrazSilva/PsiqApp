export function dataHoraLocalParaApi(valor: string) {
  return new Date(valor).toISOString()
}

export function dataHoraParaInput(agora = new Date()) {
  const deslocamentoMs = agora.getTimezoneOffset() * 60_000
  return new Date(agora.getTime() - deslocamentoMs).toISOString().slice(0, 16)
}

export function formatarDataHora(valor: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(valor))
}
