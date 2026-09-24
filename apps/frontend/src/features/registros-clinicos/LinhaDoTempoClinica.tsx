import { EstadoVazio } from '../../shared/componentes/EstadoVazio'
import { BotaoTexto } from '../../shared/componentes/BotaoTexto'
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
  return `${valorParte('day')} de ${valorParte('month')} de ${valorParte('year')} / ${valorParte('hour')}:${valorParte('minute')}`
}

export function LinhaDoTempoClinica({ pacienteId, registros, originalEmComplemento, aoComplementar, aoCancelarComplemento, aoCriarComplemento }: Props) {
  if (registros.length === 0) return <EstadoVazio mensagem="Nenhum parecer clínico registrado para este paciente." />

  return (
    <ol className="timeline-clinica" aria-label="Registros clínicos, mais recentes primeiro">
      {registros.map(registro => (
        <li key={registro.id} id={`registro-${registro.id}`} className={`timeline-item ${ehComplemento(registro) ? 'is-complemento' : ''}`}>
          <time className="timeline-date" dateTime={registro.dataHoraClinica}>{formatarDataTimeline(registro.dataHoraClinica)}</time>
          <article className="registro">
            <div className="registro-cabecalho">
              <h3><svg className="document-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5" /></svg>{ehComplemento(registro) ? 'Complemento' : 'Parecer clínico'}</h3>
              {!ehComplemento(registro) && <span className="registro-tipo">Registro original</span>}
            </div>
            <p>{registro.texto}</p>
            {registro.humor && <p className="registro-humor"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg> Estado/humor: <strong>{registro.humor}</strong></p>}
            <div className="registro-footer">
              <span>Registrado em {formatarDataHora(registro.criadoEm)}</span>
              {!ehComplemento(registro) && <BotaoTexto aria-label="Adicionar complemento" className="link-complemento" onClick={() => aoComplementar(registro.id)}>Adicionar complemento<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></BotaoTexto>}
            </div>
          </article>
          {originalEmComplemento === registro.id && <FormularioComplemento pacienteId={pacienteId} originalId={registro.id} aoCancelar={aoCancelarComplemento} aoCriar={aoCriarComplemento} />}
        </li>
      ))}
    </ol>
  )
}
