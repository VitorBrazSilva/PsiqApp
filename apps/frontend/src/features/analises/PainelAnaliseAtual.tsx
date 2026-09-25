import { useEffect, useRef, useState } from 'react'
import type { AnaliseClinica, EstadoAnalise, EvidenciaAnalise, GeracaoAnalise, ItemAnalise } from './servicoAnalises'
import { formatarDataHora } from '../registros-clinicos/datasClinicas'
import { servicoRegistrosClinicos, type RegistroClinico } from '../registros-clinicos/servicoRegistrosClinicos'

interface Props { pacienteId: string; estado: EstadoAnalise | null; geracoes: GeracaoAnalise[]; carregando: boolean; erro: string; erroHistorico?: string; aoRegenerar?: () => void; regenerando?: boolean; aoAbrirFonte: (evidencia: EvidenciaAnalise, aoVoltar: () => void) => void; aoAbrirAnalise: () => void; aoSelecionarHistorica: (analiseId: string) => void; analiseHistorica?: AnaliseClinica | null; visaoCompleta?: boolean }

type IconeNome = 'file' | 'trend' | 'eye' | 'arrow' | 'link'

function IconeAnalise({ nome, classe = '' }: { nome: IconeNome; classe?: string }) {
  return <svg className={classe} viewBox="0 0 24 24" aria-hidden="true">
    {nome === 'file' && <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5" />}
    {nome === 'trend' && <path d="m3 17 6-6 4 4 8-10M15 5h6v6" />}
    {nome === 'eye' && <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>}
    {nome === 'arrow' && <path d="m9 5 7 7-7 7" />}
    {nome === 'link' && <path d="M10 13a5 5 0 0 0 7 .2l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7-.2l-3 3a5 5 0 0 0 7 7l2-2" />}
  </svg>
}

function SecaoAnalise({ titulo, vazio, itens, aoAbrirEvidencias, icone, visaoCompleta }: { titulo: string; vazio: string; itens: ItemAnalise[]; aoAbrirEvidencias: (titulo: string, item: ItemAnalise, acionador: HTMLButtonElement) => void; icone: Exclude<IconeNome, 'arrow' | 'link'>; visaoCompleta: boolean }) {
  return <details open={visaoCompleta || titulo === 'Padrões observados'} className="analysis-group">
    <summary><IconeAnalise nome={icone} classe="analysis-icon" /><span>{titulo}</span><span className="analysis-count">{itens.length}</span><IconeAnalise nome="arrow" classe="analysis-chevron" /></summary>
    {itens.length === 0 ? <p className="estado">{vazio}</p> : <ul className="analysis-items">{itens.map((item, indice) => <li className="analysis-observation" key={`${titulo}-${indice}`}><span className="observation-nature">{item.natureza === 'RELATO' ? 'Relato registrado' : 'Interpretação da IA'}</span><p>{item.texto}</p><button type="button" className="evidence-link" onClick={evento => aoAbrirEvidencias(titulo, item, evento.currentTarget)}><IconeAnalise nome="link" />{item.evidencias.length} {item.evidencias.length === 1 ? 'evidência' : 'evidências'} desta observação<IconeAnalise nome="arrow" /></button></li>)}</ul>}
  </details>
}

function ConteudoAnalise({ analise, totalOriginais, aoAbrirEvidencias, aoAbrirAnalise, aoRegenerar, podeRegenerar, regenerando, visaoCompleta }: { analise: AnaliseClinica; totalOriginais: number; aoAbrirEvidencias: (titulo: string, item: ItemAnalise, acionador: HTMLButtonElement) => void; aoAbrirAnalise: () => void; aoRegenerar?: () => void; podeRegenerar: boolean; regenerando: boolean; visaoCompleta: boolean }) {
  const data = new Date(analise.geradaEm).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace('.', '')
  const total = analise.linhaDoTempo.length + analise.padroes.length + analise.pontosDeAtencao.length
  return <>
    <div className="analise-meta"><span>Gerada em {data}</span><span>Baseada em {totalOriginais} pareceres originais</span></div>
    <section className="analise-secao"><SecaoAnalise titulo="Linha do tempo resumida" vazio="Sem itens validados para a linha do tempo resumida." itens={analise.linhaDoTempo} aoAbrirEvidencias={aoAbrirEvidencias} icone="file" visaoCompleta={visaoCompleta} /><SecaoAnalise titulo="Padrões observados" vazio="Sem padrões validados para exibição." itens={analise.padroes} aoAbrirEvidencias={aoAbrirEvidencias} icone="trend" visaoCompleta={visaoCompleta} /><SecaoAnalise titulo="Pontos de atenção" vazio="Sem pontos de atenção validados para exibição." itens={analise.pontosDeAtencao} aoAbrirEvidencias={aoAbrirEvidencias} icone="eye" visaoCompleta={visaoCompleta} /></section>
    <div className="analise-limites"><strong>Limites desta análise</strong>{analise.limitacoes.map((limitacao, indice) => <p key={indice}>{limitacao}</p>)}<p>A análise apoia a leitura; a decisão clínica é do médico.</p></div>
    {visaoCompleta && <button type="button" className="text-button analise-atualizar" onClick={aoRegenerar} disabled={!podeRegenerar || regenerando}>{regenerando ? 'Solicitando atualização...' : 'Atualizar análise'} <IconeAnalise nome="arrow" /></button>}
    {!visaoCompleta && <button type="button" className="text-button analise-historico-link" onClick={aoAbrirAnalise}>Abrir análise e histórico&nbsp; <IconeAnalise nome="arrow" /></button>}
    <span className="sr-only">{total} observações disponíveis</span>
  </>
}

export function PainelAnaliseAtual({ pacienteId, estado, geracoes, carregando, erro, erroHistorico, aoRegenerar, regenerando = false, aoAbrirFonte, aoAbrirAnalise, aoSelecionarHistorica, analiseHistorica, visaoCompleta = false }: Props) {
  const [evidencias, setEvidencias] = useState<{ titulo: string; item: ItemAnalise } | null>(null)
  const [historicoAberto, setHistoricoAberto] = useState(false)
  const [registrosFonte, setRegistrosFonte] = useState<Record<string, RegistroClinico | null>>({})
  const dialogRef = useRef<HTMLDialogElement>(null)
  const historicoDialogRef = useRef<HTMLDialogElement>(null)
  const acionadorRef = useRef<HTMLButtonElement | null>(null)
  const acionadorHistoricoRef = useRef<HTMLButtonElement | null>(null)
  const analise = analiseHistorica ?? estado?.analiseAtual
  const versoesConcluidas = geracoes.filter(geracao => geracao.estado === 'CONCLUIDA' && geracao.analiseId)
  const totalOriginaisExibido = analiseHistorica ? geracoes.find(geracao => geracao.analiseId === analiseHistorica.id)?.totalOriginais ?? 0 : estado?.ultimaGeracao?.totalOriginais ?? 0

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

  useEffect(() => {
    const dialog = historicoDialogRef.current
    const acionador = acionadorHistoricoRef.current
    if (!historicoAberto || !dialog) return
    if (typeof dialog.showModal === 'function') dialog.showModal()
    else dialog.setAttribute('open', '')
    dialog.querySelector<HTMLButtonElement>('.icon-button')?.focus()
    return () => {
      if (dialog.open) {
        if (typeof dialog.close === 'function') dialog.close()
        else dialog.removeAttribute('open')
      }
      if (acionador?.isConnected) acionador.focus()
    }
  }, [historicoAberto])

  useEffect(() => {
    if (!evidencias) return
    const faltantes = [...new Set(evidencias.item.evidencias.map(item => item.registroId))]
      .filter(registroId => !(registroId in registrosFonte))
    if (!faltantes.length) return
    let ativo = true
    const controle = new AbortController()
    void Promise.all(faltantes.map(async registroId => {
      try {
        const registro = await servicoRegistrosClinicos.obter(pacienteId, registroId, controle.signal)
        if (ativo) setRegistrosFonte(atuais => ({ ...atuais, [registroId]: registro }))
      } catch (falha) {
        if (ativo && !(falha instanceof DOMException)) setRegistrosFonte(atuais => ({ ...atuais, [registroId]: null }))
      }
    }))
    return () => { ativo = false; controle.abort() }
  }, [evidencias, pacienteId, registrosFonte])

  function abrirEvidencias(titulo: string, item: ItemAnalise, acionador: HTMLButtonElement) {
    acionadorRef.current = acionador
    setEvidencias({ titulo, item })
  }

  return <section className={`painel analise${visaoCompleta ? ' ai-full' : ''}`} aria-labelledby="titulo-analise">
    <div className="analise-cabecalho"><span className="spark-icon" aria-hidden="true">✦</span><div><h2 id="titulo-analise">Análise longitudinal</h2><span className="ia-badge">IA</span></div></div>
    {carregando && <p>Carregando análise...</p>}{erro && <p role="alert" className="erro">{erro}</p>}
    {estado?.geracaoAtiva && <p className="analise-status status-ativa">Atualização em andamento. A análise anterior permanece disponível.</p>}
    {estado?.ultimaGeracao?.estado === 'FALHA' && <p className="analise-status status-falha">A última geração falhou. A análise válida anterior permanece exibida quando existe.</p>}
    {erroHistorico && <p role="alert" className="erro">{erroHistorico}</p>}
    {analise ? <ConteudoAnalise analise={analise} totalOriginais={totalOriginaisExibido} aoAbrirEvidencias={abrirEvidencias} aoAbrirAnalise={aoAbrirAnalise} aoRegenerar={aoRegenerar} podeRegenerar={!analiseHistorica && !!estado?.podeRegenerar} regenerando={regenerando} visaoCompleta={visaoCompleta} /> : !carregando && <p className="estado">Ainda não há análise válida para este paciente.</p>}
    {visaoCompleta && analise && <div className="analysis-history-actions">
      {analiseHistorica && <button type="button" className="text-button" onClick={() => aoSelecionarHistorica('')}>Voltar &#224; an&#225;lise atual</button>}
      {versoesConcluidas.length > 0 && <button type="button" className="text-button" onClick={evento => { acionadorHistoricoRef.current = evento.currentTarget; setHistoricoAberto(true) }}>Ver hist&#243;rico de an&#225;lises <IconeAnalise nome="arrow" /></button>}
    </div>}
    {visaoCompleta && <dialog ref={historicoDialogRef} className="dialog-historico-analise" aria-labelledby="titulo-historico-analise" onCancel={evento => { evento.preventDefault(); setHistoricoAberto(false) }}>
      <div className="dialog-header"><h2 id="titulo-historico-analise">Hist&#243;rico de an&#225;lises</h2><button type="button" className="icon-button" aria-label="Fechar hist&#243;rico de an&#225;lises" onClick={() => setHistoricoAberto(false)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button></div>
      <div className="dialog-body"><p className="muted">Vers&#245;es preservadas para consulta.</p>{versoesConcluidas.length ? <ul className="analysis-version-list">{versoesConcluidas.map((geracao, indice) => <li key={geracao.id}><div><h3>{geracao.analiseId === estado?.analiseAtual?.id ? 'Vers&#227;o atual' : `Vers&#227;o ${versoesConcluidas.length - indice}`}</h3><p>{geracao.totalOriginais} pareceres originais / {geracao.modo === 'LONGITUDINAL' ? 'An&#225;lise longitudinal' : 'Resumo cl&#237;nico'}</p><time>{new Date(geracao.solicitadaEm).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</time></div>{geracao.analiseId === estado?.analiseAtual?.id ? <span className="status-badge">Vers&#227;o atual</span> : <button type="button" className="text-button" onClick={() => { aoSelecionarHistorica(geracao.analiseId!); setHistoricoAberto(false) }}>Abrir vers&#227;o</button>}</li>)}</ul> : <p className="estado">Ainda n&#227;o h&#225; vers&#245;es salvas.</p>}</div>
    </dialog>}
    <dialog ref={dialogRef} className="dialog-evidencias" aria-labelledby="titulo-evidencias" onKeyDown={evento => { if (evento.key === 'Escape') { evento.preventDefault(); setEvidencias(null) } }} onCancel={evento => { evento.preventDefault(); setEvidencias(null) }}>
      {evidencias && <><div className="dialog-header"><h2 id="titulo-evidencias">Evidências desta observação</h2><button data-fechar-evidencias type="button" className="icon-button" aria-label="Fechar evidências" onClick={() => setEvidencias(null)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button></div><div className="dialog-body"><section className="observation-context" aria-label="Observação analisada"><div className="observation-context-header"><span className="observation-nature">{evidencias.titulo}</span><span className="observation-origin">{evidencias.item.natureza === 'RELATO' ? 'Relato registrado' : 'Interpretação da IA'}</span></div><p>{evidencias.item.texto}</p></section><p className="evidence-intro">{evidencias.item.evidencias.length} trechos originais vinculados a esta observação.</p><ol className="evidence-list">{evidencias.item.evidencias.map((evidencia, indice) => {
        const registro = registrosFonte[evidencia.registroId]
        const data = registro ? formatarDataHora(registro.dataHoraClinica) : null
        const registroResolvido = evidencia.registroId in registrosFonte
        const tipoRegistro = registro?.tipo === 'COMPLEMENTO' || registro?.tipo === 'COMPLEMENT' ? 'Complemento' : 'Original'
        return <li className="evidence-card" key={`${evidencia.registroId}-${indice}`}><div className="evidence-source-header"><h3>{data ? `Parecer de ${data}` : registroResolvido ? 'Data do parecer indisponível' : 'Carregando data do parecer…'}</h3><span className="record-type">{tipoRegistro}</span></div><span className="evidence-field">{evidencia.campo === 'HUMOR' ? 'Estado/humor' : evidencia.campo === 'MEDICAMENTOS' ? 'Medicações em uso' : 'Texto do parecer'}</span><blockquote className="source-excerpt">{evidencia.citacao}</blockquote><button type="button" className="text-button" onClick={() => { const contextoAtual = evidencias; setEvidencias(null); aoAbrirFonte(evidencia, () => setEvidencias(contextoAtual)) }}>Abrir registro completo&nbsp; ›</button></li>
      })}</ol></div></>}
    </dialog>
  </section>
}
