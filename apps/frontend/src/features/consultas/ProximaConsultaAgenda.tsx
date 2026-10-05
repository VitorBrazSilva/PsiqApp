import { useEffect } from 'react'
import { ProximaConsulta } from './ProximaConsulta'
import { useAgendaConsultas } from './useAgendaConsultas'

export function ProximaConsultaAgenda({ pacienteId, nomesPacientes, versaoAtualizacao }: {
  pacienteId?: string
  nomesPacientes: Record<string, string>
  versaoAtualizacao: number
}) {
  const { resultado, carregando, erro, recarregar } = useAgendaConsultas(pacienteId, 1)
  useEffect(() => {
    if (versaoAtualizacao > 0) void recarregar(0)
  }, [versaoAtualizacao, recarregar])

  const contextoInvalido = pacienteId && resultado?.itens.some(consulta => consulta.pacienteId !== pacienteId)
  if (erro || contextoInvalido) return <div className="agenda-proxima-estado">
    <p className="erro" role="alert">Não foi possível carregar a próxima consulta.</p>
    <button className="text-button" type="button" onClick={() => void recarregar(0)}>Tentar novamente</button>
  </div>
  if (carregando) return <p className="agenda-proxima-estado" role="status">Carregando próxima consulta…</p>

  const proxima = resultado?.itens.find(consulta => consulta.status === 'AGENDADA')
  if (!proxima) return <p className="agenda-proxima-estado" role="status">Nenhuma consulta futura agendada.</p>

  return <ProximaConsulta consulta={proxima} pacienteNome={nomesPacientes[proxima.pacienteId] ?? proxima.pacienteId} />
}
