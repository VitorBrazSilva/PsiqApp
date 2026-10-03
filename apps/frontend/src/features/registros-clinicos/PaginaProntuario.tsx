import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { EstadoVazio } from '../../shared/componentes/EstadoVazio'
import { FonteRegistroClinico, type FonteSelecionada } from '../analises/FonteRegistroClinico'
import { PainelAnaliseAtual, type ChaveSecaoAnalise } from '../analises/PainelAnaliseAtual'
import { type AnaliseClinica, type EvidenciaAnalise } from '../analises/servicoAnalises'
import { usePollingAnalise } from '../analises/usePollingAnalise'
import { servicoAnalises } from '../analises/servicoAnalises'
import { DialogoConsulta } from '../consultas/DialogoConsulta'
import { PainelConsultas } from '../consultas/PainelConsultas'
import { servicoConsultas, type Consulta } from '../consultas/servicoConsultas'
import { DadosPaciente } from '../pacientes/DadosPaciente'
import { servicoPacientes, type Paciente } from '../pacientes/servicoPacientes'
import { FormularioParecer } from './FormularioParecer'
import { FormularioComplemento } from './FormularioComplemento'
import { LinhaDoTempoClinica } from './LinhaDoTempoClinica'
import { servicoRegistrosClinicos, type CriarRegistroClinicoResposta, type RegistroClinico } from './servicoRegistrosClinicos'
import { Paginacao } from '../../shared/componentes/Paginacao'

export function PaginaProntuario() {
  const { pacienteId } = useParams()
  const [parametros, setParametros] = useSearchParams()
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [resumoConsultas, setResumoConsultas] = useState<{ pacienteId: string, proxima: Consulta | null, total: number } | null>(null)
  const [erroResumoConsultasPacienteId, setErroResumoConsultasPacienteId] = useState<string | null>(null)
  const [versaoAgenda, setVersaoAgenda] = useState(0)
  const [registros, setRegistros] = useState<RegistroClinico[]>([])
  const [carregando, setCarregando] = useState(!!pacienteId)
  const [erro, setErro] = useState('')
  const [originalEmComplemento, setOriginalEmComplemento] = useState<string | null>(null)
  const [complementoAberto, setComplementoAberto] = useState(false)
  const complementoDialogRef = useRef<HTMLDialogElement>(null)
  const acionadorComplementoRef = useRef<HTMLButtonElement | null>(null)
  const [fonteAberta, setFonteAberta] = useState<FonteSelecionada | null>(null)
  const [retornoEvidencias, setRetornoEvidencias] = useState<(() => void) | null>(null)
  const [registroEmDestaque, setRegistroEmDestaque] = useState<string | null>(null)
  const [parecerAberto, setParecerAberto] = useState(false)
  const [consultaAberta, setConsultaAberta] = useState<string | null>(null)
  const [contextoConsulta, setContextoConsulta] = useState(pacienteId)
  const [analiseHistorica, setAnaliseHistorica] = useState<AnaliseClinica | null>(null)
  const [erroHistoricoAnalise, setErroHistoricoAnalise] = useState('')
  const [solicitandoAnalise, setSolicitandoAnalise] = useState(false)
  const secao = secaoDaUrl(parametros.get('secao'))
  const categoriaAnalise = categoriaAnaliseDaUrl(parametros.get('grupo'))
  const [paginaRegistros, setPaginaRegistros] = useState({ pagina: 0, tamanho: 100, total: 0 })
  const { estado, geracoes, carregando: carregandoAnalise, erro: erroAnalise, recarregar } = usePollingAnalise(pacienteId ?? null)

  useEffect(() => {
    if (!parecerAberto) return
    const fecharComEscape = (evento: KeyboardEvent) => {
      if (evento.key !== 'Escape') return
      setParecerAberto(false)
    }
    window.addEventListener('keydown', fecharComEscape)
    return () => window.removeEventListener('keydown', fecharComEscape)
  }, [parecerAberto])

  useEffect(() => {
    const dialog = complementoDialogRef.current
    if (!complementoAberto || !dialog) return
    if (typeof dialog.showModal === 'function') dialog.showModal()
    else dialog.setAttribute('open', '')
    dialog.querySelector<HTMLTextAreaElement>('textarea')?.focus()
    return () => {
      if (dialog.open) {
        if (typeof dialog.close === 'function') dialog.close()
        else dialog.removeAttribute('open')
      }
      if (acionadorComplementoRef.current?.isConnected) acionadorComplementoRef.current.focus()
    }
  }, [complementoAberto, originalEmComplemento])

  useEffect(() => {
    if (!pacienteId) return
    const controle = new AbortController()
    Promise.all([
      servicoPacientes.obter(pacienteId, controle.signal),
      servicoRegistrosClinicos.listar(pacienteId, controle.signal, paginaRegistros.pagina, 100),
    ]).then(([pacienteResposta, paginaRegistros]) => {
      if (controle.signal.aborted) return
      setPaciente(pacienteResposta)
      setRegistros(paginaRegistros.itens)
      setPaginaRegistros({ pagina: paginaRegistros.pagina, tamanho: paginaRegistros.tamanho, total: paginaRegistros.total })
      setOriginalEmComplemento(null)
      setFonteAberta(null)
      setAnaliseHistorica(null)
      setErro('')
    }).catch(falha => {
      if (falha instanceof DOMException) return
      setErro('Não foi possível carregar o prontuário.')
    }).finally(() => { if (!controle.signal.aborted) setCarregando(false) })
    return () => controle.abort()
  }, [pacienteId, paginaRegistros.pagina])

  useEffect(() => {
    if (!pacienteId) return
    const controle = new AbortController()
    servicoConsultas.listarAgenda({ pacienteId, grupo: 'PROXIMAS', pagina: 0, tamanho: 1 }, controle.signal)
      .then(resposta => {
        if (controle.signal.aborted || resposta.itens.some(item => item.pacienteId !== pacienteId)) return
        setResumoConsultas({ pacienteId, proxima: resposta.itens[0] ?? null, total: Object.values(resposta.contagens).reduce((total, contagem) => total + contagem, 0) })
        setErroResumoConsultasPacienteId(null)
      }).catch(() => { if (!controle.signal.aborted) setErroResumoConsultasPacienteId(pacienteId) })
    return () => controle.abort()
  }, [pacienteId, versaoAgenda])

  useEffect(() => {
    const atualizarResumo = () => {
      if (document.visibilityState === 'visible') setVersaoAgenda(versao => versao + 1)
    }
    window.addEventListener('focus', atualizarResumo)
    document.addEventListener('visibilitychange', atualizarResumo)
    return () => {
      window.removeEventListener('focus', atualizarResumo)
      document.removeEventListener('visibilitychange', atualizarResumo)
    }
  }, [])

  useEffect(() => {
    if (!registroEmDestaque || secao !== 'historico') return
    const frame = window.requestAnimationFrame(() => {
      const elemento = document.getElementById(`registro-${registroEmDestaque}`)
      if (!elemento) return
      elemento.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
      elemento.focus({ preventScroll: true })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [registroEmDestaque, secao, registros])

  if (contextoConsulta !== pacienteId) {
    setContextoConsulta(pacienteId)
    setConsultaAberta(null)
  }

  if (!pacienteId) {
    return (
      <section className="painel">
        <div className="cabecalho-pagina prontuario-titulo"><div><p className="etiqueta">PRONTUÁRIO CLÍNICO</p><h1>{paciente?.nome ?? 'Prontuário'}</h1><p className="subtitulo">Histórico, consultas e registros em uma única leitura.</p></div><Link className="botao-secundario" to="/pacientes">Trocar paciente</Link></div>
        <EstadoVazio mensagem="Busque um paciente e abra o prontuário a partir da lista de pacientes." />
        <Link to="/pacientes">Ir para pacientes</Link>
      </section>
    )
  }

  if (carregando) return <section className="painel"><h1>Prontuário</h1><p>Carregando prontuário...</p></section>

  function registrarCriacao(resposta: CriarRegistroClinicoResposta) {
    setRegistros(atuais => [resposta.registro, ...atuais].sort((a, b) =>
      b.dataHoraClinica.localeCompare(a.dataHoraClinica) || b.criadoEm.localeCompare(a.criadoEm) || b.id.localeCompare(a.id)))
    setOriginalEmComplemento(null)
    setComplementoAberto(false)
    void recarregar()
  }

  function abrirComplemento(registroId: string, acionador: HTMLButtonElement) {
    acionadorComplementoRef.current = acionador
    setOriginalEmComplemento(registroId)
    setComplementoAberto(true)
  }

  function mudarSecao(novaSecao: 'historico' | 'analise' | 'consultas' | 'dados') {
    setParametros(atual => { atual.set('secao', novaSecao); return atual })
  }

  async function selecionarAnaliseHistorica(analiseId: string) {
    if (!analiseId) { setAnaliseHistorica(null); setErroHistoricoAnalise(''); return }
    try {
      const historica = await servicoAnalises.obterHistorica(pacienteId!, analiseId)
      if (historica.pacienteId === pacienteId) { setAnaliseHistorica(historica); setErroHistoricoAnalise('') }
    } catch {
      setErroHistoricoAnalise('Não foi possível carregar esta versão da análise.')
    }
  }

  async function solicitarNovaAnalise() {
    if (!pacienteId || solicitandoAnalise || !estado?.podeRegenerar) return
    setSolicitandoAnalise(true)
    setErroHistoricoAnalise('')
    try {
      await servicoAnalises.regenerar(pacienteId)
      await recarregar()
    } catch {
      setErroHistoricoAnalise('Não foi possível solicitar uma nova análise agora.')
    } finally {
      setSolicitandoAnalise(false)
    }
  }

  async function abrirRegistroNoHistorico(registroId: string) {
    setFonteAberta(null)
    setRetornoEvidencias(null)
    setErro('')
    setRegistroEmDestaque(registroId)
    mudarSecao('historico')
    if (registros.some(registro => registro.id === registroId)) return

    const totalPaginas = Math.max(1, Math.ceil(paginaRegistros.total / paginaRegistros.tamanho))
    for (let pagina = 0; pagina < totalPaginas; pagina += 1) {
      try {
        const resultado = await servicoRegistrosClinicos.listar(pacienteId!, undefined, pagina, paginaRegistros.tamanho)
        if (!resultado.itens.some(registro => registro.id === registroId)) continue
        setRegistros(resultado.itens)
        setPaginaRegistros({ pagina: resultado.pagina, tamanho: resultado.tamanho, total: resultado.total })
        return
      } catch {
        setErro('Não foi possível localizar este parecer no histórico clínico.')
        return
      }
    }
    setErro('Este parecer não foi encontrado no histórico clínico.')
  }

  return (
    <section className={`pagina-prontuario prontuario-secao-${secao}`}>
      <header className="patient-heading">
        <span className="patient-avatar" aria-hidden="true">{paciente?.nome.split(/\s+/).slice(0, 2).map(parte => parte[0]).join('').toUpperCase()}</span>
        <div className="patient-name"><h1>{paciente?.nome}</h1><p className="patient-subtitle"><span>{formatarIdade(paciente?.dataNascimento ?? '')} anos</span><span>{registros.filter(registro => !registros.find(original => original.id === registro.parecerOriginalId)).length} pareceres originais</span></p></div>
        <div className="heading-actions"><button className="secondary" type="button" onClick={() => setConsultaAberta(pacienteId)}><svg className="button-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18M8 15h2M14 15h2" /></svg>Agendar consulta</button><button className="primary" type="button" onClick={() => setParecerAberto(true)}>+&nbsp; Novo parecer</button></div>
      </header>
      <nav className="patient-tabs" aria-label="Seções do prontuário">
        <button type="button" className={secao === 'historico' ? 'active' : ''} aria-current={secao === 'historico' ? 'page' : undefined} onClick={() => mudarSecao('historico')}>Histórico clínico <span className="count">{registros.length}</span></button>
        <button type="button" className={secao === 'analise' ? 'active' : ''} aria-current={secao === 'analise' ? 'page' : undefined} onClick={() => mudarSecao('analise')}>Análise de IA</button>
        <button type="button" className={secao === 'consultas' ? 'active' : ''} aria-current={secao === 'consultas' ? 'page' : undefined} onClick={() => mudarSecao('consultas')}>Consultas <span className="count">{resumoConsultas?.pacienteId === pacienteId ? resumoConsultas.total : 0}</span></button>
        <button type="button" className={secao === 'dados' ? 'active' : ''} aria-current={secao === 'dados' ? 'page' : undefined} onClick={() => mudarSecao('dados')}>Dados pessoais</button>
      </nav>
      <div className="painel contexto-paciente">
        {erro && <p role="alert" className="erro">{erro}</p>}
        {erroResumoConsultasPacienteId === pacienteId && <p role="alert" className="erro">Não foi possível carregar as consultas deste paciente.</p>}
        {paciente && secao !== 'historico' && <DadosPaciente paciente={paciente} />}
        {secao === 'historico' && (() => { const proxima = resumoConsultas?.pacienteId === pacienteId ? resumoConsultas.proxima : null; if (!proxima) return null; const dataLocal = new Date(proxima.agendadaPara); const dia = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', timeZone: 'America/Sao_Paulo' }).format(dataLocal); const mes = new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'America/Sao_Paulo' }).format(dataLocal).replace('.', ''); const dataHora = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }).format(dataLocal).replace('.', ''); return <section className="next-appointment"><span className="calendar-tile"><small>{mes}</small><strong>{dia}</strong></span><div><strong>Pr&#243;xima consulta</strong><span>{dataHora}</span></div><span className="status-badge"><svg className="appointment-clock" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>Agendada</span><Link className="text-button" to="#consultas">Ver consultas&nbsp; &rsaquo;</Link></section> })()}
        {secao === 'consultas' && <section className="bloco">
          <h2>Consultas do paciente</h2>
          <PainelConsultas key={pacienteId} pacienteId={pacienteId} versaoAtualizacao={versaoAgenda} nomesPacientes={paciente ? { [paciente.id]: paciente.nome } : undefined} />
        </section>}
      </div>

      <div className="grade-prontuario acoes-registro">
        <section className="painel">
          <FormularioParecer pacienteId={pacienteId} aoCriar={registrarCriacao} />
        </section>
      </div>

      <section className="painel historico-clinico-painel">
        <div className="records-heading"><h2>Histórico clínico</h2><span className="muted">Mais recentes primeiro</span></div>
        <LinhaDoTempoClinica
          registros={registros}
          registroEmDestaque={registroEmDestaque}
          aoComplementar={abrirComplemento}
        />
        <Paginacao {...paginaRegistros} aoMudar={novaPagina => setPaginaRegistros(atual => ({ ...atual, pagina: novaPagina }))} />
      </section>

      <div className="analise-coluna">
        {secao !== 'consultas' && <PainelAnaliseAtual
          pacienteId={pacienteId}
          estado={estado}
          geracoes={geracoes}
          carregando={carregandoAnalise}
          erro={erroAnalise}
          erroHistorico={erroHistoricoAnalise}
          aoRegenerar={() => { void solicitarNovaAnalise() }}
          regenerando={solicitandoAnalise}
          aoAbrirFonte={(evidencia: EvidenciaAnalise, aoVoltar: () => void) => { setFonteAberta(evidencia); setRetornoEvidencias(() => aoVoltar) }}
          aoAbrirAnalise={() => mudarSecao('analise')}
          aoSelecionarHistorica={id => { void selecionarAnaliseHistorica(id) }}
          visaoCompleta={secao === 'analise'}
          categoriaSelecionada={categoriaAnalise}
          aoSelecionarCategoria={categoria => setParametros(atual => { atual.set('grupo', categoria); return atual })}
          analiseHistorica={analiseHistorica}
        />}
        <FonteRegistroClinico pacienteId={pacienteId} pacienteNome={paciente?.nome ?? ''} fonte={fonteAberta} aoFechar={() => { setFonteAberta(null); setRetornoEvidencias(null) }} aoVoltar={() => { setFonteAberta(null); retornoEvidencias?.(); setRetornoEvidencias(null) }} aoAbrirNoHistorico={abrirRegistroNoHistorico} />
        {originalEmComplemento && <dialog ref={complementoDialogRef} className="dialog-complemento" aria-labelledby="titulo-complemento" onKeyDown={evento => { if (evento.key === 'Escape') { evento.preventDefault(); setComplementoAberto(false) } }} onCancel={evento => { evento.preventDefault(); setComplementoAberto(false) }}>
          <div className="dialog-header"><h2 id="titulo-complemento">Adicionar complemento</h2><button className="icon-button" type="button" aria-label="Fechar complemento" onClick={() => setComplementoAberto(false)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button></div>
          <div className="dialog-body"><FormularioComplemento key={originalEmComplemento} pacienteId={pacienteId} originalId={originalEmComplemento} pacienteNome={paciente?.nome ?? ''} dataParecerOriginal={registros.find(registro => registro.id === originalEmComplemento)?.dataHoraClinica ?? ''} aoCancelar={() => setComplementoAberto(false)} aoCriar={registrarCriacao} /></div>
        </dialog>}
        {parecerAberto && <dialog open className="dialog-parecer" aria-labelledby="titulo-parecer" onKeyDown={evento => { if (evento.key === 'Escape') { evento.preventDefault(); setParecerAberto(false) } }}><div className="dialog-header"><h2 id="titulo-parecer">Novo parecer</h2><button className="icon-button" type="button" aria-label="Fechar novo parecer" onClick={() => setParecerAberto(false)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button></div><div className="dialog-body"><FormularioParecer pacienteId={pacienteId} aoCriar={resposta => { registrarCriacao(resposta); setParecerAberto(false) }} /></div></dialog>}
        {consultaAberta === pacienteId && <DialogoConsulta key={pacienteId} pacienteId={pacienteId} pacienteNome={paciente?.id === pacienteId ? paciente.nome : undefined}
          aoFechar={() => setConsultaAberta(null)} aoCriar={() => { setConsultaAberta(null); setVersaoAgenda(atual => atual + 1) }} />}
      </div>
    </section>
  )
}

function secaoDaUrl(valor: string | null): 'historico' | 'analise' | 'consultas' | 'dados' {
  return valor === 'analise' || valor === 'consultas' || valor === 'dados' ? valor : 'historico'
}

function categoriaAnaliseDaUrl(valor: string | null): ChaveSecaoAnalise {
  return valor === 'padroes' || valor === 'pontosDeAtencao' ? valor : 'linhaDoTempo'
}

function formatarIdade(dataNascimento: string) {
  if (!dataNascimento) return 0
  const nascimento = new Date(`${dataNascimento}T00:00:00Z`)
  const hoje = new Date()
  let anos = hoje.getUTCFullYear() - nascimento.getUTCFullYear()
  if (hoje.getUTCMonth() < nascimento.getUTCMonth() || (hoje.getUTCMonth() === nascimento.getUTCMonth() && hoje.getUTCDate() < nascimento.getUTCDate())) anos -= 1
  return anos
}
