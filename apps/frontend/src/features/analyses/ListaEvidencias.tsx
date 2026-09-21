import type { EvidenciaAnalise } from './servicoAnalises'

const campos = {
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
    <ul className="evidencias">
      {evidencias.map((evidencia, indice) => (
        <li key={`${evidencia.registroId}-${indice}`}>
          <button type="button" className="link-botao" onClick={() => aoAbrirFonte(evidencia.registroId)}>
            Abrir fonte
          </button>
          <span>{campos[evidencia.campo]}: "{evidencia.citacao}"</span>
        </li>
      ))}
    </ul>
  )
}
