import { useCallback, useEffect, useRef, useState } from 'react'
import { servicoConsultas, type Consulta, type GrupoAgendaConsulta, type PaginaAgendaConsultas } from './servicoConsultas'

export function useAgendaConsultas(pacienteId?: string, tamanho = 50) {
  const [grupo, setGrupo] = useState<GrupoAgendaConsulta>('PROXIMAS')
  const [dataInicialEditada, setDataInicialEditada] = useState('')
  const [dataFinalEditada, setDataFinalEditada] = useState('')
  const [periodo, setPeriodo] = useState<{ dataInicial?: string, dataFinal?: string }>({})
  const [pagina, setPagina] = useState(0)
  const [resultado, setResultado] = useState<PaginaAgendaConsultas | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [erroPeriodo, setErroPeriodo] = useState('')
  const requisicao = useRef(0)
  const controladorRef = useRef<AbortController | null>(null)

  const recarregar = useCallback(async (paginaSolicitada = pagina) => {
    controladorRef.current?.abort()
    const controlador = new AbortController()
    controladorRef.current = controlador
    const id = ++requisicao.current
    setCarregando(true)
    setErro('')
    setResultado(null)
    try {
      const resposta = await servicoConsultas.listarAgenda({ grupo, pacienteId, ...periodo, pagina: paginaSolicitada, tamanho }, controlador.signal)
      if (id !== requisicao.current) return
      const ultimaPagina = Math.max(0, Math.ceil(resposta.total / Math.max(resposta.tamanho, 1)) - 1)
      if (paginaSolicitada > ultimaPagina) {
        setPagina(ultimaPagina)
        return
      }
      setResultado(resposta)
      setPagina(resposta.pagina)
    } catch (falha) {
      if (id === requisicao.current && !(falha instanceof DOMException && falha.name === 'AbortError')) {
        setResultado(null)
        setErro('Não foi possível carregar as consultas. Tente novamente.')
      }
    } finally {
      if (id === requisicao.current) setCarregando(false)
    }
  }, [grupo, pacienteId, periodo, pagina, tamanho])

  useEffect(() => {
    const temporizador = window.setTimeout(() => { void recarregar(pagina) }, 0)
    return () => { window.clearTimeout(temporizador); controladorRef.current?.abort() }
  }, [recarregar, pagina])

  useEffect(() => {
    const atualizar = () => { if (document.visibilityState === 'visible') void recarregar() }
    window.addEventListener('focus', atualizar)
    document.addEventListener('visibilitychange', atualizar)
    return () => { window.removeEventListener('focus', atualizar); document.removeEventListener('visibilitychange', atualizar) }
  }, [recarregar])

  useEffect(() => {
    if (grupo !== 'PROXIMAS' || !resultado) return
    const agora = Date.now()
    const proximoInicio = resultado.itens
      .filter(consulta => consulta.status === 'AGENDADA')
      .map(consulta => Date.parse(consulta.agendadaPara))
      .filter(inicio => inicio >= agora)
      .sort((a, b) => a - b)[0]
    if (proximoInicio === undefined) return
    // A igualdade ainda pertence a Próximas; renovar depois de atravessar o início.
    const temporizador = window.setTimeout(() => {
      if (document.visibilityState === 'visible') void recarregar()
    }, Math.min(proximoInicio - agora + 1, 2_147_483_647))
    return () => window.clearTimeout(temporizador)
  }, [grupo, resultado, recarregar])

  function selecionarGrupo(novoGrupo: GrupoAgendaConsulta) { setGrupo(novoGrupo); setPagina(0) }
  function aplicarPeriodo() {
    if (!dataInicialEditada && !dataFinalEditada) { setErroPeriodo(''); setPeriodo({}); setPagina(0); return }
    if (!dataInicialEditada || !dataFinalEditada) { setErroPeriodo('Informe as datas inicial e final.'); return }
    if (dataInicialEditada > dataFinalEditada) { setErroPeriodo('A data inicial deve ser anterior ou igual à data final.'); return }
    setErroPeriodo('')
    setPeriodo({ dataInicial: dataInicialEditada, dataFinal: dataFinalEditada })
    setPagina(0)
  }
  function limparPeriodo() { setDataInicialEditada(''); setDataFinalEditada(''); setPeriodo({}); setErroPeriodo(''); setPagina(0) }
  function aoAtualizar(consulta: Consulta) { if (consulta.pacienteId === (pacienteId ?? consulta.pacienteId)) void recarregar() }

  return { grupo, selecionarGrupo, dataInicialEditada, setDataInicialEditada, dataFinalEditada, setDataFinalEditada,
    erroPeriodo, aplicarPeriodo, limparPeriodo, resultado, carregando, erro, pagina, setPagina, recarregar, aoAtualizar }
}
