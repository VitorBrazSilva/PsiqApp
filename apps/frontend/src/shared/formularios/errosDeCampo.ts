import type { ErroApi } from '../api/erroApi'

export type ErrosFormulario = Record<string, string>

export function errosDeCampo(erro: unknown): ErrosFormulario {
  const api = erro as Partial<ErroApi>
  if (!Array.isArray(api.errosDeCampo)) return {}
  return api.errosDeCampo.reduce<ErrosFormulario>((acumulado, item) => {
    const campo = item.campo ?? item.field
    const mensagem = item.mensagem ?? item.message
    if (campo && !acumulado[campo]) acumulado[campo] = mensagem ?? 'Valor invalido.'
    return acumulado
  }, {})
}

export function mensagemErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : 'Nao foi possivel concluir a operacao.'
}
