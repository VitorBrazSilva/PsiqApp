import { useCallback, useEffect, useState } from 'react'
import { servicoConsultas, type Consulta } from './servicoConsultas'

export interface ResumoConsultasPaciente {
  total: number
  proxima: Consulta | null
  ultimaRealizada: Consulta | null
}

export function useResumoConsultas(pacienteId?: string, versaoAtualizacao = 0) {
  const [leitura, setLeitura] = useState<{ pacienteId: string, resumo: ResumoConsultasPaciente | null, erro: boolean } | null>(null)
  const [versao, setVersao] = useState(0)
  const recarregar = useCallback(() => setVersao(atual => atual + 1), [])

  useEffect(() => {
    if (!pacienteId) return
    const controle = new AbortController()
    Promise.all([
      servicoConsultas.listarAgenda({ pacienteId, grupo: 'PROXIMAS', pagina: 0, tamanho: 1 }, controle.signal),
      servicoConsultas.listarAgenda({ pacienteId, grupo: 'REALIZADAS', pagina: 0, tamanho: 1 }, controle.signal),
    ]).then(([proximas, realizadas]) => {
      if (controle.signal.aborted) return
      if ([...proximas.itens, ...realizadas.itens].some(consulta => consulta.pacienteId !== pacienteId)) {
        throw new Error('Resposta de consultas fora do paciente solicitado.')
      }
      setLeitura({ pacienteId, erro: false, resumo: {
        total: Object.values(proximas.contagens).reduce((total, contagem) => total + contagem, 0),
        proxima: proximas.itens.find(consulta => consulta.status === 'AGENDADA') ?? null,
        ultimaRealizada: realizadas.itens.find(consulta => consulta.status === 'REALIZADA') ?? null,
      } })
    }).catch(() => {
      if (!controle.signal.aborted) setLeitura({ pacienteId, resumo: null, erro: true })
    })
    return () => controle.abort()
  }, [pacienteId, versaoAtualizacao, versao])

  useEffect(() => {
    const atualizar = () => { if (document.visibilityState === 'visible') recarregar() }
    window.addEventListener('focus', atualizar)
    document.addEventListener('visibilitychange', atualizar)
    return () => {
      window.removeEventListener('focus', atualizar)
      document.removeEventListener('visibilitychange', atualizar)
    }
  }, [recarregar])

  const leituraAtual = leitura && leitura.pacienteId === pacienteId ? leitura : null
  const resumo = leituraAtual?.resumo ?? null
  const erro = leituraAtual?.erro ?? false
  const proximoInicio = resumo?.proxima?.agendadaPara

  useEffect(() => {
    if (!proximoInicio) return
    const inicio = Date.parse(proximoInicio)
    const agora = Date.now()
    if (!Number.isFinite(inicio) || inicio < agora) return
    // A consulta ainda pertence a Próximas na igualdade; renovar após seu início.
    const temporizador = window.setTimeout(() => {
      if (document.visibilityState === 'visible') recarregar()
    }, Math.min(inicio - agora + 1, 2_147_483_647))
    return () => window.clearTimeout(temporizador)
  }, [proximoInicio, resumo, recarregar])

  return { resumo, erro, recarregar }
}
