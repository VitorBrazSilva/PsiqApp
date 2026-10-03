import { Link } from 'react-router'
import type { Consulta } from './servicoConsultas'
import { formatarDataHoraConsulta } from './formatacaoConsulta'

const fusoHorario = 'America/Sao_Paulo'

export function ProximaConsulta({ consulta, linkConsultas }: { consulta: Consulta, linkConsultas?: string }) {
  const data = new Date(consulta.agendadaPara)
  const dia = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', timeZone: fusoHorario }).format(data)
  const mes = new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: fusoHorario }).format(data)

  return <section className="next-appointment" aria-label="Próxima consulta">
    <span className="calendar-tile" aria-hidden="true"><small>{mes}</small><strong>{dia}</strong></span>
    <div><strong>Próxima consulta</strong><time dateTime={consulta.agendadaPara}>{formatarDataHoraConsulta(consulta.agendadaPara)}</time></div>
    <span className="status-badge"><svg className="appointment-clock" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>Agendada</span>
    {linkConsultas && <Link className="text-button" to={linkConsultas}>Ver consultas&nbsp; ›</Link>}
  </section>
}
