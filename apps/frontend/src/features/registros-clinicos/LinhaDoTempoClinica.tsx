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

export function LinhaDoTempoClinica({ pacienteId, registros, originalEmComplemento, aoComplementar, aoCancelarComplemento, aoCriarComplemento }: Props) {
  if (registros.length === 0) {
    return <EstadoVazio mensagem="Nenhum parecer clínico registrado para este paciente." />
  }

  return (
    <ol className="timeline-clinica">
      {registros.map(registro => (
        <li key={registro.id} id={`registro-${registro.id}`} className={ehComplemento(registro) ? 'registro complemento' : 'registro'}>
          <div className="registro-cabecalho">
            <strong>{ehComplemento(registro) ? 'Complemento' : 'Parecer original'}</strong>
            <span>{formatarDataHora(registro.dataHoraClinica)}</span>
          </div>
          <p>{registro.texto}</p>
          <dl className="metadados">
            <div><dt>Criado em</dt><dd>{formatarDataHora(registro.criadoEm)}</dd></div>
            {registro.humor && <div><dt>Estado/humor</dt><dd>{registro.humor}</dd></div>}
            {registro.medicamentos && <div><dt>Medicações</dt><dd>{registro.medicamentos}</dd></div>}
            {registro.consultaId && <div><dt>Consulta</dt><dd>{registro.consultaId}</dd></div>}
            {registro.parecerOriginalId && <div><dt>Parecer original</dt><dd>{registro.parecerOriginalId}</dd></div>}
          </dl>
          {!ehComplemento(registro) && (
            <button type="button" className="secundario" onClick={() => aoComplementar(registro.id)}>Complementar</button>
          )}
          {originalEmComplemento === registro.id && (
            <FormularioComplemento
              pacienteId={pacienteId}
              originalId={registro.id}
              aoCancelar={aoCancelarComplemento}
              aoCriar={aoCriarComplemento}
            />
          )}
        </li>
      ))}
    </ol>
  )
}
