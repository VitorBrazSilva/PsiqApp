import type { ErroApi } from '../api/erroApi'

export type ErrosFormulario = Record<string, string>

export function errosDeCampo(erro: unknown): ErrosFormulario {
  const api = erro as Partial<ErroApi>
  if (!Array.isArray(api.fieldErrors)) return {}
  return api.fieldErrors.reduce<ErrosFormulario>((acumulado, item) => {
    if (item.field && !acumulado[item.field]) acumulado[item.field] = item.message
    return acumulado
  }, {})
}

export function mensagemErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : 'Nao foi possivel concluir a operacao.'
}
