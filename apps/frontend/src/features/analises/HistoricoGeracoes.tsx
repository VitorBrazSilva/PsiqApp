import { formatarDataHora } from '../registros-clinicos/datasClinicas'
import type { GeracaoAnalise } from './servicoAnalises'

interface Props {
  geracoes: GeracaoAnalise[]
}

export function HistoricoGeracoes({ geracoes }: Props) {
  return (
    <section className="bloco">
      <h2>Histórico de gerações</h2>
      {geracoes.length === 0 ? <p className="estado">Nenhuma geração registrada.</p> : (
        <ul className="lista historico">
          {geracoes.map(geracao => (
            <li key={geracao.id}>
              <div>
                <strong>{geracao.estado}</strong>
                <span>{formatarDataHora(geracao.solicitadaEm)} · snapshot {geracao.revisaoSnapshot} · {geracao.totalOriginais} originais · {geracao.totalComplementos} complementos</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
