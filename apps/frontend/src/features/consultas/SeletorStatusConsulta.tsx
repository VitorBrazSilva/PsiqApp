import { useState } from 'react'
import { servicoConsultas, type Consulta, type StatusConsulta, rotuloStatus } from './servicoConsultas'

const finais: Exclude<StatusConsulta, 'AGENDADA'>[] = ['REALIZADA', 'CANCELADA', 'FALTA']

export function SeletorStatusConsulta({ consulta, aoAtualizar, usarApiReal = false }: {
  consulta: Consulta
  aoAtualizar: (consulta: Consulta) => void
  usarApiReal?: boolean
}) {
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState<StatusConsulta | ''>('')
  if (consulta.status !== 'AGENDADA') return null

  async function atualizar(status: Exclude<StatusConsulta, 'AGENDADA'>) {
    setSalvando(status)
    setErro('')
    try {
      aoAtualizar(await servicoConsultas.atualizarStatus(consulta.id, status, { usarApiReal }))
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível atualizar o status.')
    } finally {
      setSalvando('')
    }
  }

  return (
    <div className="acoes-status" aria-busy={!!salvando}>
      {finais.map(status => (
        <button className="consulta-status-botao" key={status} type="button" disabled={!!salvando} onClick={() => void atualizar(status)}>
          {salvando === status ? 'Atualizando...' : rotuloStatus(status)}
        </button>
      ))}
      {erro && <p role="alert" className="erro">{erro}</p>}
    </div>
  )
}
