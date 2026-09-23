import { formatarDataHora } from '../registros-clinicos/datasClinicas'
import type { GeracaoAnalise } from './servicoAnalises'

interface Props {
  geracoes: GeracaoAnalise[]
  aoAbrir: (geracao: GeracaoAnalise) => void
}

export function HistoricoGeracoes({ geracoes, aoAbrir }: Props) {
  return (
    <section className="bloco historico-bloco">
      <h2>Histórico de gerações</h2>
      {geracoes.length === 0 ? <p className="estado">Nenhuma geração registrada.</p> : (
        <ul className="lista historico">
          {geracoes.map(geracao => (
            <li className="historico-item" key={geracao.id}>
              <div>
                <strong>{geracao.estado}</strong>
                <span>{formatarDataHora(geracao.solicitadaEm)} · snapshot {geracao.revisaoSnapshot} · {geracao.totalOriginais} originais · {geracao.totalComplementos} complementos</span>
              </div>
              {geracao.estado === 'CONCLUIDA' && <button type="button" className="secundario" disabled={!geracao.analiseId} onClick={() => aoAbrir(geracao)}>{geracao.analiseId ? 'Abrir versão' : 'Versão indisponível'}</button>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
