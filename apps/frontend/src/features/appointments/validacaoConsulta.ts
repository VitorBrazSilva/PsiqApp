import type { CriarConsulta } from './servicoConsultas'

export function paraIsoComOffset(valorLocal: string) {
  if (!valorLocal) return ''
  const data = new Date(valorLocal)
  return Number.isNaN(data.getTime()) ? '' : data.toISOString()
}

export function validarConsulta(dados: CriarConsulta) {
  const erros: Record<string, string> = {}
  if (!dados.pacienteId) erros.pacienteId = 'Selecione um paciente.'
  if (!dados.agendadaPara) erros.agendadaPara = 'Informe data e hora.'
  return erros
}
