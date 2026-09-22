import { useCallback, useEffect, useRef, useState } from 'react'
import { ErroApi } from '../../shared/api/erroApi'
import { servicoAnalises, type EstadoAnalise, type GeracaoAnalise } from './servicoAnalises'

export function usePollingAnalise(pacienteId: string | null) {
  const [estado, setEstado] = useState<EstadoAnalise | null>(null)
  const [geracoes, setGeracoes] = useState<GeracaoAnalise[]>([])
  const [carregando, setCarregando] = useState(!!pacienteId)
  const [erro, setErro] = useState('')
  const requisicaoEmCurso = useRef(false)
  const pacienteAtual = useRef(pacienteId)

  useEffect(() => { pacienteAtual.current = pacienteId }, [pacienteId])

  const carregar = useCallback(async (signal?: AbortSignal) => {
    if (!pacienteId || requisicaoEmCurso.current) return
    requisicaoEmCurso.current = true
    try {
      const [novoEstado, paginaGeracoes] = await Promise.all([
        servicoAnalises.obterEstado(pacienteId, signal),
        servicoAnalises.listarGeracoes(pacienteId, signal),
      ])
      if (pacienteAtual.current !== pacienteId || signal?.aborted) return
      setEstado(novoEstado)
      setGeracoes(paginaGeracoes.itens)
      setErro('')
    } catch (falha) {
      if (falha instanceof DOMException) return
      setErro(falha instanceof ErroApi ? falha.message : 'Não foi possível carregar a análise.')
    } finally {
      requisicaoEmCurso.current = false
      setCarregando(false)
    }
  }, [pacienteId])

  useEffect(() => {
    if (!pacienteId) return
    const controle = new AbortController()
    queueMicrotask(() => { void carregar(controle.signal) })
    return () => controle.abort()
  }, [carregar, pacienteId])

  useEffect(() => {
    const aguardandoAnalisePersistida = estado?.ultimaGeracao?.estado === 'CONCLUIDA' && !estado.analiseAtual
    if (!pacienteId || (!estado?.geracaoAtiva && !aguardandoAnalisePersistida)) return
    const controle = new AbortController()
    const aoVisibilizar = () => {
      if (!document.hidden) void carregar(controle.signal)
    }
    document.addEventListener('visibilitychange', aoVisibilizar)
    const timer = window.setInterval(() => {
      if (!document.hidden) void carregar(controle.signal)
    }, 3000)
    return () => {
      document.removeEventListener('visibilitychange', aoVisibilizar)
      window.clearInterval(timer)
      controle.abort()
    }
  }, [carregar, estado?.geracaoAtiva, estado?.analiseAtual, estado?.ultimaGeracao?.estado, pacienteId])

  return { estado, geracoes, carregando, erro, recarregar: carregar }
}
