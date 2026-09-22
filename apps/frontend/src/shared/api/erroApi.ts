export interface ErroDeCampo {
  campo?: string
  mensagem?: string
  field?: string
  message?: string
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
  readonly codigo: string
  readonly idRequisicao?: string
  readonly errosDeCampo: ErroDeCampo[]

  constructor(status: number, code = 'ERRO_HTTP', requestId?: string, fieldErrors: ErroDeCampo[] = []) {
    super(mensagens[status] ?? 'Não foi possível processar a solicitação.')
    this.name = 'ErroApi'
    this.status = status
    this.codigo = code
    this.idRequisicao = requestId
    this.errosDeCampo = fieldErrors
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
  const code = typeof dados.codigo === 'string' && /^[A-Z][A-Z_]{0,63}$/.test(dados.codigo)
    ? dados.codigo : 'ERRO_HTTP'
  const campos = Array.isArray(dados.errosDeCampo) ? dados.errosDeCampo : []
  const fieldErrors = campos.filter(campo => objeto(campo) && typeof (campo as Record<string, unknown>).campo === 'string')
    .map(campo => ({ campo: (campo as Record<string, unknown>).campo as string, mensagem: 'Valor invalido.' })); /*
    objeto(campo) && typeof campo.campo === 'string',
  ).map(campo => ({ field: campo.field as string, message: 'Valor inválido.' }))
  */ return new ErroApi(status, code,
    identificadorRequisicao(requestId) ?? identificadorRequisicao(dados.idRequisicao), fieldErrors)
}
