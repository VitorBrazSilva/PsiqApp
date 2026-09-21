import { ListaEvidencias } from './ListaEvidencias'
import type { AnaliseClinica, EstadoAnalise, ItemAnalise } from './servicoAnalises'

interface Props {
  estado: EstadoAnalise | null
  carregando: boolean
  erro: string
  aoRegenerar: () => void
  regenerando: boolean
  aoAbrirFonte: (registroId: string) => void
}

function SecaoAnalise({ titulo, vazio, itens, aoAbrirFonte }: { titulo: string, vazio: string, itens: ItemAnalise[], aoAbrirFonte: (registroId: string) => void }) {
  return (
    <section className="bloco">
      <h3>{titulo}</h3>
      {itens.length === 0 ? <p className="estado">{vazio}</p> : (
        <ul className="itens-analise">
          {itens.map((item, indice) => (
            <li key={`${titulo}-${indice}`}>
              <p>{item.texto}</p>
              <span className="etiqueta">{item.nature === 'REPORTED' ? 'Relato registrado' : 'Interpretação apoiada em evidência'}</span>
              <ListaEvidencias evidencias={item.evidencias} aoAbrirFonte={aoAbrirFonte} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function ConteudoAnalise({ analise, aoAbrirFonte }: { analise: AnaliseClinica, aoAbrirFonte: (registroId: string) => void }) {
  return (
    <>
      <p className="etiqueta">Análise {analise.modo === 'RESUMO' ? 'resumida' : 'longitudinal'} gerada em {new Date(analise.geradaEm).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
      <section className="limitacoes">
        <h3>Limitações da IA</h3>
        {analise.limitacoes.length === 0
          ? <p>A análise é apoio à leitura do prontuário e não substitui a decisão clínica.</p>
          : <ul>{analise.limitacoes.map((limite, indice) => <li key={indice}>{limite}</li>)}</ul>}
      </section>
      <SecaoAnalise titulo="Linha do tempo resumida" vazio="Sem itens validados para a linha do tempo resumida." itens={analise.linhaDoTempo} aoAbrirFonte={aoAbrirFonte} />
      <SecaoAnalise titulo="Padrões observados" vazio="Sem padrões validados para exibição." itens={analise.padroes} aoAbrirFonte={aoAbrirFonte} />
      <SecaoAnalise titulo="Pontos de atenção" vazio="Sem pontos de atenção validados para exibição." itens={analise.pontosDeAtencao} aoAbrirFonte={aoAbrirFonte} />
    </>
  )
}

export function PainelAnaliseAtual({ estado, carregando, erro, aoRegenerar, regenerando, aoAbrirFonte }: Props) {
  const ativa = estado?.activeGeneration
  const falha = estado?.latestGeneration?.estado === 'FALHA'
  return (
    <section className="painel analise">
      <div className="registro-cabecalho">
        <h2>Análise atual</h2>
        <button type="button" disabled={!estado?.canRegenerate || regenerando} onClick={aoRegenerar}>
          {regenerando ? 'Solicitando...' : 'Regenerar'}
        </button>
      </div>
      {carregando && <p>Carregando análise...</p>}
      {erro && <p role="alert" className="erro">{erro}</p>}
      {ativa && <p className="estado">Atualização em andamento: {ativa.estado}. O prontuário continua disponível.</p>}
      {falha && <p role="status" className="erro">A última geração falhou. A análise válida anterior permanece exibida quando existe.</p>}
      {!estado?.canRegenerate && estado?.reason && <p className="estado">{estado.reason}</p>}
      {estado?.currentAnalysis
        ? <ConteudoAnalise analise={estado.currentAnalysis} aoAbrirFonte={aoAbrirFonte} />
        : !carregando && <p className="estado">Ainda não há análise válida para este paciente.</p>}
    </section>
  )
}
