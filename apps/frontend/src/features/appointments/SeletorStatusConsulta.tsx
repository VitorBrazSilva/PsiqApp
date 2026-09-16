import { useState } from 'react'
import { servicoConsultas, type Consulta, type StatusConsulta, rotuloStatus } from './servicoConsultas'

const finais: Exclude<StatusConsulta, 'AGENDADA'>[] = ['REALIZADA', 'CANCELADA', 'FALTA']

export function SeletorStatusConsulta({ consulta, aoAtualizar }: { consulta: Consulta, aoAtualizar: (consulta: Consulta) => void }) {
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState<StatusConsulta | ''>('')
  if (consulta.status !== 'AGENDADA') return <span className="status-final">Estado final</span>

  async function atualizar(status: Exclude<StatusConsulta, 'AGENDADA'>) {
    setSalvando(status)
    setErro('')
    try {
      aoAtualizar(await servicoConsultas.atualizarStatus(consulta.id, status))
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível atualizar o status.')
    } finally {
      setSalvando('')
    }
  }

  return (
    <div className="acoes-status">
      {finais.map(status => (
        <button key={status} disabled={!!salvando} onClick={() => void atualizar(status)}>
          {salvando === status ? 'Atualizando...' : rotuloStatus(status)}
        </button>
      ))}
      {erro && <p role="alert" className="erro">{erro}</p>}
    </div>
  )
}
