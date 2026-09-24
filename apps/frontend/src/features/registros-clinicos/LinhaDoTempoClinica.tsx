import { EstadoVazio } from '../../shared/componentes/EstadoVazio'
import { formatarDataHora } from './datasClinicas'
import { FormularioComplemento } from './FormularioComplemento'
import { ehComplemento, type CriarRegistroClinicoResposta, type RegistroClinico } from './servicoRegistrosClinicos'

interface Props {
  pacienteId: string
  registros: RegistroClinico[]
  originalEmComplemento: string | null
  aoComplementar: (registroId: string) => void
  aoCancelarComplemento: () => void
  aoCriarComplemento: (resposta: CriarRegistroClinicoResposta) => void
}

function formatarDataTimeline(valor: string) {
  const partes = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }).formatToParts(new Date(valor))
  const valorParte = (tipo: Intl.DateTimeFormatPartTypes) => partes.find(parte => parte.type === tipo)?.value ?? ''
  return `${valorParte('day')} de ${valorParte('month').replace('.', '')} de ${valorParte('year')} / ${valorParte('hour')}:${valorParte('minute')}`
}

export function LinhaDoTempoClinica({ pacienteId, registros, originalEmComplemento, aoComplementar, aoCancelarComplemento, aoCriarComplemento }: Props) {
  if (registros.length === 0) return <EstadoVazio mensagem="Nenhum parecer clínico registrado para este paciente." />

  return (
    <ol className="timeline-clinica">
      {registros.map(registro => (
        <li key={registro.id} id={`registro-${registro.id}`} className={`timeline-item ${ehComplemento(registro) ? 'is-complemento' : ''}`}>
          <time className="timeline-date">{formatarDataTimeline(registro.dataHoraClinica)}</time>
          <article className="registro">
            <div className="registro-cabecalho">
              <h3><span className="document-icon" aria-hidden="true">▤</span>{ehComplemento(registro) ? 'Complemento' : 'Parecer clínico'}</h3>
              {!ehComplemento(registro) && <span className="registro-tipo">Registro original</span>}
            </div>
            <p>{registro.texto}</p>
            {registro.humor && <p className="registro-humor"><span aria-hidden="true">◉</span> Estado/humor: <strong>{registro.humor}</strong></p>}
            <div className="registro-footer">
              <span>Registrado em {formatarDataHora(registro.criadoEm)}</span>
              {!ehComplemento(registro) && <button type="button" aria-label="Complementar" className="link-complemento" onClick={() => aoComplementar(registro.id)}>Adicionar complemento <span aria-hidden="true">+</span></button>}
            </div>
          </article>
          {originalEmComplemento === registro.id && <FormularioComplemento pacienteId={pacienteId} originalId={registro.id} aoCancelar={aoCancelarComplemento} aoCriar={aoCriarComplemento} />}
        </li>
      ))}
    </ol>
  )
}
