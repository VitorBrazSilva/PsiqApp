import { useEffect, useRef, useState } from 'react'
import { FormularioConsulta } from './FormularioConsulta'
import { servicoGoogleAgenda, type EstadoConexaoGoogleAgenda } from './servicoGoogleAgenda'
import type { Consulta } from './servicoConsultas'

export function DialogoConsulta({ pacienteId, pacienteNome, pacienteEmail, aoFechar, aoCriar }: {
  pacienteId: string, pacienteNome?: string, pacienteEmail?: string, aoFechar: () => void, aoCriar: (consulta: Consulta) => void,
}) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const [conexao, setConexao] = useState<EstadoConexaoGoogleAgenda | 'CARREGANDO'>('CARREGANDO')
  useEffect(() => {
    const elemento = dialogo.current!
    const acionador = document.activeElement as HTMLElement | null
    if (typeof elemento.showModal === 'function') elemento.showModal()
    else elemento.setAttribute('open', '')
    elemento.querySelector<HTMLButtonElement>('button')?.focus()
    return () => {
      if (elemento.open && typeof elemento.close === 'function') elemento.close()
      if (acionador?.isConnected) acionador.focus()
    }
  }, [])
  useEffect(() => {
    let controle: AbortController | null = null
    const atualizar = () => {
      if (document.visibilityState !== 'visible') return
      controle?.abort()
      const atual = new AbortController()
      controle = atual
      void servicoGoogleAgenda.obterEstado(atual.signal).then(resposta => {
        if (!atual.signal.aborted) setConexao(resposta.estado)
      }).catch(() => { if (!atual.signal.aborted) setConexao('INDISPONIVEL') })
    }
    atualizar()
    window.addEventListener('focus', atualizar)
    document.addEventListener('visibilitychange', atualizar)
    return () => { controle?.abort(); window.removeEventListener('focus', atualizar); document.removeEventListener('visibilitychange', atualizar) }
  }, [])
  return <dialog ref={dialogo} className="dialog-parecer dialog-consulta" aria-labelledby="titulo-consulta"
    onCancel={evento => { evento.preventDefault(); aoFechar() }}>
    <div className="dialog-header"><h2 id="titulo-consulta">Agendar consulta</h2><button className="icon-button" type="button" aria-label="Fechar agendamento" onClick={aoFechar}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button></div>
    <div className="dialog-body"><FormularioConsulta pacienteFixoId={pacienteId} pacienteNome={pacienteNome} pacienteEmail={pacienteEmail} emDialogo usarApiReal exigirDisponibilidade estadoIntegracao={conexao} aoCancelar={aoFechar}
      aoCriar={consulta => { if (consulta.pacienteId === pacienteId) aoCriar(consulta) }} /></div>
  </dialog>
}
