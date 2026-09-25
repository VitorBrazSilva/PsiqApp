import { useEffect, useRef, useState } from 'react'
import type { AnaliseClinica, EstadoAnalise, EvidenciaAnalise, ItemAnalise } from './servicoAnalises'
import { formatarDataHora } from '../registros-clinicos/datasClinicas'
import { servicoRegistrosClinicos, type RegistroClinico } from '../registros-clinicos/servicoRegistrosClinicos'

interface Props { pacienteId: string; estado: EstadoAnalise | null; carregando: boolean; erro: string; aoRegenerar?: () => void; regenerando?: boolean; aoAbrirFonte: (evidencia: EvidenciaAnalise, aoVoltar: () => void) => void; aoAbrirAnalise: () => void; analiseHistorica?: AnaliseClinica | null; visaoCompleta?: boolean }

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

function ConteudoAnalise({ analise, totalOriginais, aoAbrirEvidencias, aoAbrirAnalise, visaoCompleta }: { analise: AnaliseClinica; totalOriginais: number; aoAbrirEvidencias: (titulo: string, item: ItemAnalise, acionador: HTMLButtonElement) => void; aoAbrirAnalise: () => void; visaoCompleta: boolean }) {
  const data = new Date(analise.geradaEm).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace('.', '')
  const total = analise.linhaDoTempo.length + analise.padroes.length + analise.pontosDeAtencao.length
  return <>
    <div className="analise-meta"><span>Gerada em {data}</span><span>Baseada em {totalOriginais} pareceres originais</span></div>
    <section className="analise-secao"><SecaoAnalise titulo="Linha do tempo resumida" vazio="Sem itens validados para a linha do tempo resumida." itens={analise.linhaDoTempo} aoAbrirEvidencias={aoAbrirEvidencias} icone="file" visaoCompleta={visaoCompleta} /><SecaoAnalise titulo="Padrões observados" vazio="Sem padrões validados para exibição." itens={analise.padroes} aoAbrirEvidencias={aoAbrirEvidencias} icone="trend" visaoCompleta={visaoCompleta} /><SecaoAnalise titulo="Pontos de atenção" vazio="Sem pontos de atenção validados para exibição." itens={analise.pontosDeAtencao} aoAbrirEvidencias={aoAbrirEvidencias} icone="eye" visaoCompleta={visaoCompleta} /></section>
    <div className="analise-limites"><strong>Limites desta análise</strong>{analise.limitacoes.map((limitacao, indice) => <p key={indice}>{limitacao}</p>)}<p>A análise apoia a leitura; a decisão clínica é do médico.</p></div>
    {!visaoCompleta && <button type="button" className="text-button analise-historico-link" onClick={aoAbrirAnalise}>Abrir análise e histórico&nbsp; <IconeAnalise nome="arrow" /></button>}
    <span className="sr-only">{total} observações disponíveis</span>
  </>
}

export function PainelAnaliseAtual({ pacienteId, estado, carregando, erro, aoAbrirFonte, aoAbrirAnalise, analiseHistorica, visaoCompleta = false }: Props) {
  const [evidencias, setEvidencias] = useState<{ titulo: string; item: ItemAnalise } | null>(null)
  const [registrosFonte, setRegistrosFonte] = useState<Record<string, RegistroClinico | null>>({})
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
    {analise ? <ConteudoAnalise analise={analise} totalOriginais={estado?.ultimaGeracao?.totalOriginais ?? 0} aoAbrirEvidencias={abrirEvidencias} aoAbrirAnalise={aoAbrirAnalise} visaoCompleta={visaoCompleta} /> : !carregando && <p className="estado">Ainda não há análise válida para este paciente.</p>}
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
