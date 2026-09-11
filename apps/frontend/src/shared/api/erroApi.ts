export interface ErroDeCampo {
  field: string
  message: string
}

const mensagens: Record<number, string> = {
  0: 'Não foi possível conectar ao serviço. Tente novamente.',
  400: 'Verifique os campos informados.',
  404: 'Recurso não encontrado.',
  409: 'Não foi possível concluir devido a um conflito. Verifique os dados antes de repetir.',
  503: 'Serviço temporariamente indisponível. Tente novamente mais tarde.',
}

export class ErroApi extends Error {
  readonly status: number
  readonly code: string
  readonly requestId?: string
  readonly fieldErrors: ErroDeCampo[]

  constructor(status: number, code = 'ERRO_HTTP', requestId?: string, fieldErrors: ErroDeCampo[] = []) {
    super(mensagens[status] ?? 'Não foi possível processar a solicitação.')
    this.name = 'ErroApi'
    this.status = status
    this.code = code
    this.requestId = requestId
    this.fieldErrors = fieldErrors
  }
}

function objeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor)
}

function identificadorRequisicao(valor: unknown): string | undefined {
  return typeof valor === 'string' && /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(valor)
    ? valor : undefined
}

// Não reter title, detail, instance, valores rejeitados ou mensagens remotas.
export function erroDeResposta(status: number, problema: unknown, requestId: string | null): ErroApi {
  const dados = objeto(problema) ? problema : {}
  const code = typeof dados.code === 'string' && /^[A-Z][A-Z_]{0,63}$/.test(dados.code)
    ? dados.code : 'ERRO_HTTP'
  const campos = Array.isArray(dados.fieldErrors) ? dados.fieldErrors : []
  const fieldErrors = campos.filter((campo): campo is Record<string, unknown> =>
    objeto(campo) && typeof campo.field === 'string' && /^[a-zA-Z][a-zA-Z.[\]]{0,63}$/.test(campo.field),
  ).map(campo => ({ field: campo.field as string, message: 'Valor inválido.' }))
  return new ErroApi(status, code,
    identificadorRequisicao(requestId) ?? identificadorRequisicao(dados.requestId), fieldErrors)
}
