export const FUSO_AGENDA = 'America/Sao_Paulo'
const formatadorHora = new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO_AGENDA, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

export function dataCivil(instante: number) {
  const partes = new Intl.DateTimeFormat('en-CA', { timeZone: FUSO_AGENDA, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(instante)
  const obter = (tipo: string) => partes.find(parte => parte.type === tipo)!.value
  return `${obter('year')}-${obter('month')}-${obter('day')}`
}

export function proximaViradaCivil(agora: number) {
  const hoje = dataCivil(agora)
  let inicio = Math.floor(agora)
  let fim = inicio + 27 * 60 * 60 * 1000
  while (fim - inicio > 1) {
    const meio = Math.floor((inicio + fim) / 2)
    if (dataCivil(meio) === hoje) inicio = meio
    else fim = meio
  }
  return fim
}

export function horaAgenda(instante: string) {
  return formatadorHora.format(new Date(instante))
}

export function horarioExibidoNaBusca(instante: string) {
  // Madrugada fica oculta somente na apresentação da busca; o contrato mensal permanece completo.
  return Number(horaAgenda(instante).slice(0, 2)) >= 6
}

export function dataResumida(data: string) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${data}T12:00:00Z`))
}

export function diaDaSemana(data: string) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', weekday: 'long' }).format(new Date(`${data}T12:00:00Z`))
}

export function dataCompleta(data: string) {
  // Data civil, sem conversão pelo fuso do navegador.
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${data}T12:00:00Z`))
}

export function deslocarMes(mes: string, deslocamento: number) {
  const [ano, numero] = mes.split('-').map(Number)
  const data = new Date(Date.UTC(ano, numero - 1 + deslocamento, 1))
  return `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, '0')}`
}
