import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { EstadoVazio } from '../../shared/componentes/EstadoVazio'
import { FonteRegistroClinico, type FonteSelecionada } from '../analises/FonteRegistroClinico'
import { PainelAnaliseAtual } from '../analises/PainelAnaliseAtual'
import { type AnaliseClinica, type EvidenciaAnalise } from '../analises/servicoAnalises'
import { usePollingAnalise } from '../analises/usePollingAnalise'
import { FormularioConsulta } from '../consultas/FormularioConsulta'
import { ListaConsultas } from '../consultas/ListaConsultas'
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
  const [consultas, setConsultas] = useState<Consulta[]>([])
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
  const [consultaAberta, setConsultaAberta] = useState(false)
  const [analiseHistorica, setAnaliseHistorica] = useState<AnaliseClinica | null>(null)
  const secao = secaoDaUrl(parametros.get('secao'))
  const [paginaRegistros, setPaginaRegistros] = useState({ pagina: 0, tamanho: 100, total: 0 })
  const { estado, carregando: carregandoAnalise, erro: erroAnalise, recarregar } = usePollingAnalise(pacienteId ?? null)

  useEffect(() => {
    if (!parecerAberto && !consultaAberta) return
    const fecharComEscape = (evento: KeyboardEvent) => {
      if (evento.key !== 'Escape') return
      setParecerAberto(false)
      setConsultaAberta(false)
    }
    window.addEventListener('keydown', fecharComEscape)
    return () => window.removeEventListener('keydown', fecharComEscape)
  }, [parecerAberto, consultaAberta])

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
      servicoConsultas.listar({ pacienteId }, controle.signal),
      servicoRegistrosClinicos.listar(pacienteId, controle.signal, paginaRegistros.pagina, 100),
    ]).then(([pacienteResposta, paginaConsultas, paginaRegistros]) => {
      setPaciente(pacienteResposta)
      setConsultas(paginaConsultas.itens)
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
    if (!registroEmDestaque || secao !== 'historico') return
    const frame = window.requestAnimationFrame(() => {
      const elemento = document.getElementById(`registro-${registroEmDestaque}`)
      if (!elemento) return
      elemento.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
      elemento.focus({ preventScroll: true })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [registroEmDestaque, secao, registros])

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
        <div className="heading-actions"><button className="secondary" type="button" onClick={() => setConsultaAberta(true)}>Agendar consulta</button><button className="primary" type="button" onClick={() => setParecerAberto(true)}>+&nbsp; Novo parecer</button></div>
      </header>
      <nav className="patient-tabs" aria-label="Seções do prontuário">
        <button type="button" className={secao === 'historico' ? 'active' : ''} aria-current={secao === 'historico' ? 'page' : undefined} onClick={() => mudarSecao('historico')}>Histórico clínico <span className="count">{registros.length}</span></button>
        <button type="button" className={secao === 'analise' ? 'active' : ''} aria-current={secao === 'analise' ? 'page' : undefined} onClick={() => mudarSecao('analise')}>Análise de IA</button>
        <button type="button" className={secao === 'consultas' ? 'active' : ''} aria-current={secao === 'consultas' ? 'page' : undefined} onClick={() => mudarSecao('consultas')}>Consultas <span className="count">{consultas.length}</span></button>
        <button type="button" className={secao === 'dados' ? 'active' : ''} aria-current={secao === 'dados' ? 'page' : undefined} onClick={() => mudarSecao('dados')}>Dados pessoais</button>
      </nav>
      <div className="painel contexto-paciente">
        {erro && <p role="alert" className="erro">{erro}</p>}
        {paciente && secao !== 'historico' && <DadosPaciente paciente={paciente} />}
        {secao === 'historico' && consultas.find(consulta => consulta.status === 'AGENDADA') && <section className="next-appointment"><span className="calendar-tile"><small>set.</small><strong>24</strong></span><div><strong>Próxima consulta</strong><span>24 de set. de 2026 às 14:30</span></div><span className="status-badge">◷&nbsp; Agendada</span><Link className="text-button" to="#consultas">Ver consultas&nbsp; ›</Link></section>}
        {secao === 'historico' && <div className="compat-consultas"><ListaConsultas consultas={consultas} carregando={false} aoAtualizar={consulta => setConsultas(atuais => atuais.map(item => item.id === consulta.id ? consulta : item))} nomesPacientes={paciente ? { [paciente.id]: paciente.nome } : undefined} /></div>}
        {secao === 'consultas' && <section className="bloco">
          <h2>Consultas do paciente</h2>
          <ListaConsultas consultas={consultas} carregando={false} aoAtualizar={consulta =>
            setConsultas(atuais => atuais.map(item => item.id === consulta.id ? consulta : item))
          } nomesPacientes={paciente ? { [paciente.id]: paciente.nome } : undefined} />
        </section>}
      </div>

      <div className="grade-prontuario acoes-registro">
        <section className="painel">
          <FormularioConsulta pacienteFixoId={pacienteId} aoCriar={consulta => setConsultas(atuais => [consulta, ...atuais])} />
        </section>
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
        <PainelAnaliseAtual
          pacienteId={pacienteId}
          estado={estado}
          carregando={carregandoAnalise}
          erro={erroAnalise}
          aoAbrirFonte={(evidencia: EvidenciaAnalise, aoVoltar: () => void) => { setFonteAberta(evidencia); setRetornoEvidencias(() => aoVoltar) }}
          aoAbrirAnalise={() => mudarSecao('analise')}
          visaoCompleta={secao === 'analise'}
          analiseHistorica={analiseHistorica}
        />
        <FonteRegistroClinico pacienteId={pacienteId} pacienteNome={paciente?.nome ?? ''} fonte={fonteAberta} aoFechar={() => { setFonteAberta(null); setRetornoEvidencias(null) }} aoVoltar={() => { setFonteAberta(null); retornoEvidencias?.(); setRetornoEvidencias(null) }} aoAbrirNoHistorico={abrirRegistroNoHistorico} />
        {originalEmComplemento && <dialog ref={complementoDialogRef} className="dialog-complemento" aria-labelledby="titulo-complemento" onKeyDown={evento => { if (evento.key === 'Escape') { evento.preventDefault(); setComplementoAberto(false) } }} onCancel={evento => { evento.preventDefault(); setComplementoAberto(false) }}>
          <div className="dialog-header"><h2 id="titulo-complemento">Adicionar complemento</h2><button className="icon-button" type="button" aria-label="Fechar complemento" onClick={() => setComplementoAberto(false)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button></div>
          <div className="dialog-body"><FormularioComplemento key={originalEmComplemento} pacienteId={pacienteId} originalId={originalEmComplemento} pacienteNome={paciente?.nome ?? ''} dataParecerOriginal={registros.find(registro => registro.id === originalEmComplemento)?.dataHoraClinica ?? ''} aoCancelar={() => setComplementoAberto(false)} aoCriar={registrarCriacao} /></div>
        </dialog>}
        {parecerAberto && <dialog open className="dialog-parecer" aria-labelledby="titulo-parecer" onKeyDown={evento => { if (evento.key === 'Escape') { evento.preventDefault(); setParecerAberto(false) } }}><div className="dialog-header"><h2 id="titulo-parecer">Novo parecer</h2><button className="icon-button" type="button" aria-label="Fechar novo parecer" onClick={() => setParecerAberto(false)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button></div><div className="dialog-body"><FormularioParecer pacienteId={pacienteId} aoCriar={resposta => { registrarCriacao(resposta); setParecerAberto(false) }} /></div></dialog>}
        {consultaAberta && <dialog open className="dialog-parecer" aria-labelledby="titulo-consulta" onKeyDown={evento => { if (evento.key === 'Escape') { evento.preventDefault(); setConsultaAberta(false) } }}><div className="dialog-header"><h2 id="titulo-consulta">Agendar consulta</h2><button className="icon-button" type="button" aria-label="Fechar agendamento" onClick={() => setConsultaAberta(false)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button></div><div className="dialog-body"><FormularioConsulta pacienteFixoId={pacienteId} aoCriar={consulta => { setConsultas(atuais => [consulta, ...atuais]); setConsultaAberta(false) }} /></div></dialog>}
      </div>
    </section>
  )
}

function secaoDaUrl(valor: string | null): 'historico' | 'analise' | 'consultas' | 'dados' {
  return valor === 'analise' || valor === 'consultas' || valor === 'dados' ? valor : 'historico'
}

function formatarIdade(dataNascimento: string) {
  if (!dataNascimento) return 0
  const nascimento = new Date(`${dataNascimento}T00:00:00Z`)
  const hoje = new Date()
  let anos = hoje.getUTCFullYear() - nascimento.getUTCFullYear()
  if (hoje.getUTCMonth() < nascimento.getUTCMonth() || (hoje.getUTCMonth() === nascimento.getUTCMonth() && hoje.getUTCDate() < nascimento.getUTCDate())) anos -= 1
  return anos
}
