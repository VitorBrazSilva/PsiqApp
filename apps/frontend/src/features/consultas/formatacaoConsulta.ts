export function formatarDataHoraConsulta(valor: string) {
  const opcoesFuso = { timeZone: 'America/Sao_Paulo' }
  const data = new Date(valor)
  const dia = new Intl.DateTimeFormat('pt-BR', { ...opcoesFuso, day: 'numeric', month: 'short', year: 'numeric' }).format(data)
  const hora = new Intl.DateTimeFormat('pt-BR', { ...opcoesFuso, hour: '2-digit', minute: '2-digit' }).format(data)
  return `${dia} às ${hora}`
}
