import type { EvidenciaAnalise } from './servicoAnalises'

const campos = {
  TEXTO: 'Texto',
  HUMOR: 'Estado/humor',
  MEDICAMENTOS: 'MedicaÃ§Ãµes',
  text: 'Texto',
  mood: 'Estado/humor',
  medications: 'Medicações',
}

interface Props {
  evidencias: EvidenciaAnalise[]
  aoAbrirFonte: (registroId: string) => void
}

export function ListaEvidencias({ evidencias, aoAbrirFonte }: Props) {
  if (evidencias.length === 0) return <p className="estado">Sem evidências vinculadas.</p>
  return (
    <ul className="evidencias" aria-label="Evidências da observação">
      {evidencias.map((evidencia, indice) => (
        <li key={`${evidencia.registroId}-${indice}`}>
          <button type="button" aria-label="Abrir fonte" className="link-botao evidencia-link" onClick={() => aoAbrirFonte(evidencia.registroId)}>
            Ver fonte completa <span aria-hidden="true">↗</span>
          </button>
          <span>{campos[evidencia.campo]}: "{evidencia.citacao}"</span>
        </li>
      ))}
    </ul>
  )
}
