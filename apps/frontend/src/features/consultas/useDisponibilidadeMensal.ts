import { useCallback, useEffect, useRef, useState } from 'react'
import { ErroApi } from '../../shared/api/erroApi'
import { servicoConsultas, type DisponibilidadeMensal } from './servicoConsultas'
import { dataCivil, proximaViradaCivil } from './tempoAgenda'

type Leitura = { contexto: string, versao: number, dados?: DisponibilidadeMensal, recebidaEm?: number, erro?: string }

export function useDisponibilidadeMensal(contextoPaciente: string, conexao: string | null, ativo = true) {
  const [mes, setMes] = useState<string>()
  const [versao, setVersao] = useState(0)
  const [leitura, setLeitura] = useState<Leitura | null>(null)
  const [corte, setCorte] = useState(0)
  const controlador = useRef<AbortController | null>(null)
  const sequencia = useRef(0)
  const contexto = JSON.stringify([contextoPaciente, conexao, mes, ativo])
  const [contextoAnterior, setContextoAnterior] = useState(contexto)
  if (contextoAnterior !== contexto) {
    // Invalida também A → B → A antes de uma resposta de B, sem reativar dados de A.
    setContextoAnterior(contexto)
    setLeitura(null)
    setVersao(valor => valor + 1)
  }
  const atual = leitura?.contexto === contexto && leitura.versao === versao ? leitura : null
  const dados = atual?.dados ?? null

  const renovar = useCallback(() => {
    controlador.current?.abort()
    sequencia.current++
    setVersao(valor => valor + 1)
  }, [])

  const invalidar = useCallback((erro: string) => {
    controlador.current?.abort()
    sequencia.current++
    setLeitura({ contexto, versao, erro })
  }, [contexto, versao])

  useEffect(() => {
    if (!ativo || conexao === 'CARREGANDO') return
    const controle = new AbortController()
    controlador.current = controle
    const id = ++sequencia.current
    void servicoConsultas.consultarDisponibilidadeMensal(mes, controle.signal).then(resposta => {
      if (controle.signal.aborted || id !== sequencia.current) return
      if (!resposta || !/^\d{4}-\d{2}$/.test(resposta.mes) || !/^\d{4}-\d{2}-\d{2}$/.test(resposta.hoje)
        || resposta.fusoHorario !== 'America/Sao_Paulo' || !Number.isFinite(Date.parse(resposta.verificadoEm))
        || !['LOCAL', 'LOCAL_E_GOOGLE'].includes(resposta.fonteDisponibilidade) || !Array.isArray(resposta.dias)
        || resposta.dias.some(dia => !Array.isArray(dia.horarios) || dia.horarios.some(hora => !Number.isFinite(Date.parse(hora))))) {
        throw new ErroApi(200, 'RESPOSTA_INVALIDA')
      }
      setCorte(Date.parse(resposta.verificadoEm))
      setLeitura({ contexto, versao, dados: resposta, recebidaEm: performance.now() })
    }).catch(erro => {
      if (controle.signal.aborted || id !== sequencia.current) return
      setLeitura({ contexto, versao, erro: erro instanceof ErroApi && erro.codigo === 'GOOGLE_DISPONIBILIDADE_INDISPONIVEL'
        ? 'Não foi possível consultar o Google Agenda. A disponibilidade não foi validada. Tente novamente.'
        : 'Não foi possível buscar horários. Tente novamente.' })
    })
    return () => { controle.abort() }
  }, [ativo, conexao, contexto, mes, versao])

  const recebidaEm = atual?.recebidaEm
  const referenciaAtual = useCallback(() => dados && recebidaEm !== undefined
    ? Date.parse(dados.verificadoEm) + Math.max(0, performance.now() - recebidaEm)
    : Number.POSITIVE_INFINITY, [dados, recebidaEm])

  useEffect(() => {
    if (!dados || atual?.recebidaEm === undefined) return
    let timer: number
    const atualizar = () => {
      const agora = Date.parse(dados.verificadoEm) + Math.max(0, performance.now() - atual.recebidaEm!)
      const hoje = dataCivil(agora)
      if (hoje !== dados.hoje) {
        // Voltar ao mês do servidor se o mês exibido acabou.
        if (dados.mes < hoje.slice(0, 7)) setMes(undefined)
        renovar()
        return
      }
      setCorte(agora)
      const proximo = Math.min(...dados.dias.flatMap(dia => dia.horarios.map(Date.parse)).filter(hora => hora >= agora))
      // A próxima virada civil também é um evento, mesmo num mês vazio.
      const meiaNoite = proximaViradaCivil(agora)
      timer = window.setTimeout(atualizar, Math.max(1, Math.min(proximo + 1, meiaNoite) - agora))
    }
    timer = window.setTimeout(atualizar, 0)
    return () => window.clearTimeout(timer)
  }, [dados, atual?.recebidaEm, renovar])

  useEffect(() => {
    if (!ativo) return
    const atualizar = () => { if (document.visibilityState === 'visible') renovar() }
    window.addEventListener('focus', atualizar)
    document.addEventListener('visibilitychange', atualizar)
    return () => { window.removeEventListener('focus', atualizar); document.removeEventListener('visibilitychange', atualizar) }
  }, [ativo, renovar])

  const dias = dados?.dias.map(dia => ({ ...dia, horarios: [...new Set(dia.horarios)]
    .filter(hora => Date.parse(hora) >= corte).sort((a, b) => Date.parse(a) - Date.parse(b)) })) ?? []
  const estado = !ativo || !atual ? 'CARREGANDO' : atual.erro ? 'FALHA' : dias.some(dia => dia.horarios.length) ? 'PRONTO' : 'SEM_HORARIOS'
  function mudarMes(novo: string) { controlador.current?.abort(); sequencia.current++; setMes(novo); setVersao(valor => valor + 1) }
  return { dados, dias, estado, erro: atual?.erro ?? '', renovar, invalidar, mudarMes, referenciaAtual,
    identificador: `${contexto}:${versao}` }
}
