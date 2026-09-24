import { useEffect, useRef, useState } from 'react'
import type { AnaliseClinica, EstadoAnalise, EvidenciaAnalise, ItemAnalise } from './servicoAnalises'

interface Props { estado: EstadoAnalise | null; carregando: boolean; erro: string; aoRegenerar?: () => void; regenerando?: boolean; aoAbrirFonte: (evidencia: EvidenciaAnalise) => void; analiseHistorica?: AnaliseClinica | null }

function SecaoAnalise({ titulo, vazio, itens, aoAbrirEvidencias }: { titulo: string; vazio: string; itens: ItemAnalise[]; aoAbrirEvidencias: (titulo: string, item: ItemAnalise, acionador: HTMLButtonElement) => void }) {
  return <details open={titulo === 'Padrões observados'} className="analysis-group">
    <summary><span>{titulo}</span><span className="analysis-count">{itens.length}</span><span aria-hidden="true">›</span></summary>
    {itens.length === 0 ? <p className="estado">{vazio}</p> : <ul className="analysis-items">{itens.map((item, indice) => <li className="analysis-observation" key={`${titulo}-${indice}`}><span className="observation-nature">{item.natureza === 'RELATO' ? 'Relato registrado' : 'Interpretação da IA'}</span><p>{item.texto}</p><button type="button" className="evidence-link" onClick={evento => aoAbrirEvidencias(titulo, item, evento.currentTarget)}>↗ {item.evidencias.length} {item.evidencias.length === 1 ? 'evidência' : 'evidências'} desta observação ›</button></li>)}</ul>}
  </details>
}

function ConteudoAnalise({ analise, totalOriginais, aoAbrirEvidencias }: { analise: AnaliseClinica; totalOriginais: number; aoAbrirEvidencias: (titulo: string, item: ItemAnalise, acionador: HTMLButtonElement) => void }) {
  const data = new Date(analise.geradaEm).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace('.', '')
  const total = analise.linhaDoTempo.length + analise.padroes.length + analise.pontosDeAtencao.length
  return <>
    <div className="analise-meta"><span>Gerada em {data}</span><span>Baseada em {totalOriginais} pareceres originais</span></div>
    <section className="analise-secao"><SecaoAnalise titulo="Linha do tempo resumida" vazio="Sem itens validados para a linha do tempo resumida." itens={analise.linhaDoTempo} aoAbrirEvidencias={aoAbrirEvidencias} /><SecaoAnalise titulo="Padrões observados" vazio="Sem padrões validados para exibição." itens={analise.padroes} aoAbrirEvidencias={aoAbrirEvidencias} /><SecaoAnalise titulo="Pontos de atenção" vazio="Sem pontos de atenção validados para exibição." itens={analise.pontosDeAtencao} aoAbrirEvidencias={aoAbrirEvidencias} /></section>
    <div className="analise-limites"><strong>Limites desta análise</strong>{analise.limitacoes.map((limitacao, indice) => <p key={indice}>{limitacao}</p>)}<p>A análise apoia a leitura; a decisão clínica é do médico.</p></div>
    <button type="button" className="text-button analise-historico-link">Abrir análise e histórico&nbsp; ›</button>
    <span className="sr-only">{total} observações disponíveis</span>
  </>
}

export function PainelAnaliseAtual({ estado, carregando, erro, aoAbrirFonte, analiseHistorica }: Props) {
  const [evidencias, setEvidencias] = useState<{ titulo: string; item: ItemAnalise } | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const acionadorRef = useRef<HTMLButtonElement | null>(null)
  const analise = analiseHistorica ?? estado?.analiseAtual

  useEffect(() => {
    const dialog = dialogRef.current
    if (!evidencias || !dialog) return
    if (typeof dialog.showModal === 'function') dialog.showModal()
    else dialog.setAttribute('open', '')
    dialog.querySelector<HTMLButtonElement>('[data-fechar-evidencias]')?.focus()
    return () => {
      if (dialog.open) {
        if (typeof dialog.close === 'function') dialog.close()
        else dialog.removeAttribute('open')
      }
      if (acionadorRef.current?.isConnected) acionadorRef.current.focus()
    }
  }, [evidencias])

  function abrirEvidencias(titulo: string, item: ItemAnalise, acionador: HTMLButtonElement) {
    acionadorRef.current = acionador
    setEvidencias({ titulo, item })
  }

  return <section className="painel analise" aria-labelledby="titulo-analise">
    <div className="analise-cabecalho"><span className="spark-icon" aria-hidden="true">✦</span><div><h2 id="titulo-analise">Análise longitudinal</h2><span className="ia-badge">IA</span></div></div>
    {carregando && <p>Carregando análise...</p>}{erro && <p role="alert" className="erro">{erro}</p>}
    {estado?.geracaoAtiva && <p className="analise-status status-ativa">Atualização em andamento. A análise anterior permanece disponível.</p>}
    {estado?.ultimaGeracao?.estado === 'FALHA' && <p className="analise-status status-falha">A última geração falhou. A análise válida anterior permanece exibida quando existe.</p>}
    {analise ? <ConteudoAnalise analise={analise} totalOriginais={estado?.ultimaGeracao?.totalOriginais ?? 0} aoAbrirEvidencias={abrirEvidencias} /> : !carregando && <p className="estado">Ainda não há análise válida para este paciente.</p>}
    <dialog ref={dialogRef} className="dialog-evidencias" aria-labelledby="titulo-evidencias" onKeyDown={evento => { if (evento.key === 'Escape') { evento.preventDefault(); setEvidencias(null) } }} onCancel={evento => { evento.preventDefault(); setEvidencias(null) }}>
      {evidencias && <><div className="dialog-header"><h2 id="titulo-evidencias">Evidências desta observação</h2><button data-fechar-evidencias type="button" className="icon-button" aria-label="Fechar evidências" onClick={() => setEvidencias(null)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button></div><div className="dialog-body"><div className="observation-context"><span className="observation-nature">{evidencias.titulo} / {evidencias.item.natureza === 'RELATO' ? 'Relato registrado' : 'Interpretação da IA'}</span><p>{evidencias.item.texto}</p></div><p className="evidence-intro">{evidencias.item.evidencias.length} trechos originais vinculados a esta observação.</p><ol className="evidence-list">{evidencias.item.evidencias.map((evidencia, indice) => <li className="evidence-card" key={`${evidencia.registroId}-${indice}`}><div className="evidence-source-header"><h3>{evidencia.apelidoRegistro}</h3><span className="record-type">Original</span></div><span className="evidence-field">{evidencia.campo === 'HUMOR' ? 'Estado/humor' : evidencia.campo === 'MEDICAMENTOS' ? 'Medicações em uso' : 'Texto do parecer'}</span><blockquote className="source-excerpt">{evidencia.citacao}</blockquote><button type="button" className="text-button" onClick={() => { setEvidencias(null); aoAbrirFonte(evidencia) }}>Abrir registro completo&nbsp; ›</button></li>)}</ol></div></>}
    </dialog>
  </section>
}
