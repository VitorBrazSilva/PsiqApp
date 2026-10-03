import { useEffect, useRef, useState } from 'react'
import { chaveDeIdempotencia } from '../../shared/idempotencia/chaveDeIdempotencia'
import { CalendarioDisponibilidade } from './CalendarioDisponibilidade'
import { HorariosDisponiveis } from './HorariosDisponiveis'
import { IconeAgendamento } from './IconeAgendamento'
import { useDisponibilidadeMensal } from './useDisponibilidadeMensal'
import { dataCompleta, dataResumida, diaDaSemana, horaAgenda, horarioExibidoNaBusca } from './tempoAgenda'
import { ErroApi } from '../../shared/api/erroApi'
import { errosDeCampo, mensagemErro, type ErrosFormulario } from '../../shared/formularios/errosDeCampo'
import { servicoPacientes, type Paciente } from '../pacientes/servicoPacientes'
import { paraIsoComOffset, validarConsulta } from './validacaoConsulta'
import { servicoConsultas, type Consulta, type CriarConsulta } from './servicoConsultas'
import {
  servicoGoogleAgenda,
  type EstadoConexaoGoogleAgenda,
  type EstadoDisponibilidadeGoogleAgenda,
} from './servicoGoogleAgenda'

type EstadoVerificacao = EstadoDisponibilidadeGoogleAgenda | 'NAO_VERIFICADA' | 'VERIFICANDO'

const mensagensDisponibilidade: Record<EstadoVerificacao, string> = {
  NAO_VERIFICADA: 'Verifique a disponibilidade antes de criar a consulta.',
  VERIFICANDO: 'Verificando a disponibilidade no PsiqApp e no Google Agenda...',
  DISPONIVEL: 'Este horário está disponível para agendamento.',
  OCUPADO: 'Este horário já está ocupado. Escolha outra data ou horário e verifique novamente.',
  INDISPONIVEL: 'Não foi possível verificar a agenda. Tente novamente; a consulta não pode ser criada enquanto a verificação estiver indisponível.',
}

export function FormularioConsulta({
  pacienteFixoId,
  pacienteNome,
  pacienteEmail,
  aoCriar,
  emDialogo = false,
  aoCancelar,
  exigirDisponibilidade = true,
  estadoIntegracao = null,
  usarApiReal = true,
}: {
  pacienteFixoId?: string
  pacienteNome?: string
  pacienteEmail?: string
  aoCriar: (consulta: Consulta) => void
  emDialogo?: boolean
  aoCancelar?: () => void
  exigirDisponibilidade?: boolean
  estadoIntegracao?: EstadoConexaoGoogleAgenda | 'CARREGANDO' | null
  usarApiReal?: boolean
}) {
  const [modo, setModo] = useState<'BUSCA' | 'MANUAL'>('BUSCA')
  const [selecao, setSelecao] = useState({ contexto: '', data: '', horario: '' })
  const [operacaoIncerta, setOperacaoIncerta] = useState<{ dados: CriarConsulta, chave: string } | null>(null)
  const criacaoRef = useRef<AbortController | null>(null)
  const enviandoRef = useRef(false)
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [pacienteSelecionadoId, setPacienteSelecionadoId] = useState('')
  const [dataHora, setDataHora] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [erros, setErros] = useState<ErrosFormulario>({})
  const [erroGeral, setErroGeral] = useState('')
  const [erroPacientes, setErroPacientes] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [estadoDisponibilidade, setEstadoDisponibilidade] = useState<EstadoVerificacao>('NAO_VERIFICADA')
  const [dataHoraVerificada, setDataHoraVerificada] = useState('')
  const [conexaoVerificada, setConexaoVerificada] = useState<EstadoConexaoGoogleAgenda | 'CARREGANDO' | null>(null)
  const pacienteIdAtual = pacienteFixoId ?? pacienteSelecionadoId
  const mensal = useDisponibilidadeMensal(pacienteIdAtual, estadoIntegracao, modo === 'BUSCA')
  const diasExibidos = mensal.dias.map(dia => ({ ...dia, horarios: dia.horarios.filter(horarioExibidoNaBusca) }))
  const semHorariosExibidos = mensal.estado === 'SEM_HORARIOS' || (mensal.estado === 'PRONTO' && !diasExibidos.some(dia => dia.horarios.length))
  const selecaoAtual = selecao.contexto === mensal.identificador ? selecao : { data: '', horario: '' }
  const horariosDia = diasExibidos.find(dia => dia.data === selecaoAtual.data)?.horarios ?? []
  const horarioSelecionado = horariosDia.includes(selecaoAtual.horario) ? selecaoAtual.horario : ''
  const pacienteRevisao = pacienteFixoId ? { nome: pacienteNome ?? 'Paciente', email: pacienteEmail }
    : pacientes.find(paciente => paciente.id === pacienteIdAtual)
  const resumoErros = useRef<HTMLDivElement>(null)
  const requisicaoDisponibilidade = useRef<AbortController | null>(null)

  useEffect(() => {
    if (pacienteFixoId) return
    const controlador = new AbortController()
    servicoPacientes.buscar('', controlador.signal, 100, 0, { usarApiReal })
      .then(pagina => setPacientes(Array.isArray(pagina.itens) ? pagina.itens : []))
      .catch(() => {
        if (!controlador.signal.aborted) setErroPacientes('Não foi possível carregar os pacientes. Atualize a página e tente novamente.')
      })
    return () => controlador.abort()
  }, [pacienteFixoId, usarApiReal])

  useEffect(() => {
    requisicaoDisponibilidade.current?.abort()
  }, [estadoIntegracao])

  useEffect(() => () => { requisicaoDisponibilidade.current?.abort(); criacaoRef.current?.abort() }, [])

  useEffect(() => {
    if (Object.keys(erros).length > 1) resumoErros.current?.focus()
  }, [erros])

  const verificacaoValida = estadoDisponibilidade === 'DISPONIVEL'
    && dataHoraVerificada === dataHora
    && conexaoVerificada === estadoIntegracao
    && estadoIntegracao !== 'CARREGANDO'
  const disponibilidadeVisivel = conexaoVerificada !== estadoIntegracao && estadoDisponibilidade !== 'NAO_VERIFICADA'
    ? 'NAO_VERIFICADA'
    : estadoDisponibilidade
  const podeCriar = !salvando && (!!operacaoIncerta || (modo === 'BUSCA'
    ? !!horarioSelecionado && mensal.estado === 'PRONTO'
    : !exigirDisponibilidade || verificacaoValida))

  function limparOperacao() { setOperacaoIncerta(null); setErroGeral('') }
  function alterarModo(novo: 'BUSCA' | 'MANUAL') {
    requisicaoDisponibilidade.current?.abort()
    setModo(novo)
    setSelecao({ contexto: '', data: '', horario: '' })
    alterarDataHora('')
    limparOperacao()
    mensal.renovar()
  }

  function alterarDataHora(valor: string) {
    requisicaoDisponibilidade.current?.abort()
    limparOperacao()
    setDataHora(valor)
    setEstadoDisponibilidade('NAO_VERIFICADA')
    setDataHoraVerificada('')
    setConexaoVerificada(null)
    setErros(atuais => {
      const novos = { ...atuais }
      delete novos.agendadaPara
      return novos
    })
    setErroGeral('')
  }

  async function verificarDisponibilidade() {
    if (estadoIntegracao === 'CARREGANDO') return
    if (!dataHora || !paraIsoComOffset(dataHora)) {
      setErros(atuais => ({ ...atuais, agendadaPara: 'Informe uma data e hora válidas.' }))
      setEstadoDisponibilidade('NAO_VERIFICADA')
      setDataHoraVerificada('')
      return
    }

    requisicaoDisponibilidade.current?.abort()
    const controlador = new AbortController()
    requisicaoDisponibilidade.current = controlador
    const dataHoraCandidata = dataHora
    setEstadoDisponibilidade('VERIFICANDO')
    setDataHoraVerificada('')
    setConexaoVerificada(estadoIntegracao)
    setErroGeral('')
    try {
      const resposta = await servicoGoogleAgenda.verificarDisponibilidade(paraIsoComOffset(dataHoraCandidata), controlador.signal)
      if (controlador.signal.aborted) return
      setEstadoDisponibilidade(resposta.estado)
      setDataHoraVerificada(resposta.estado === 'DISPONIVEL' ? dataHoraCandidata : '')
      setConexaoVerificada(estadoIntegracao)
    } catch (erro) {
      if (controlador.signal.aborted || (erro instanceof DOMException && erro.name === 'AbortError')) return
      setEstadoDisponibilidade(erro instanceof ErroApi && erro.status === 409 ? 'OCUPADO' : 'INDISPONIVEL')
      setDataHoraVerificada('')
      setConexaoVerificada(estadoIntegracao)
    }
  }

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault()
    if (enviandoRef.current) return
    const pacienteId = pacienteFixoId ?? pacienteSelecionadoId
    const dados = operacaoIncerta?.dados ?? { pacienteId, agendadaPara: modo === 'BUSCA' ? horarioSelecionado : paraIsoComOffset(dataHora), observacoes: observacoes.trim() || null }
    const validacao = validarConsulta(dados)
    setErros(validacao)
    setErroGeral('')
    if (Object.keys(validacao).length) return
    if (!operacaoIncerta && modo === 'BUSCA' && (!horarioSelecionado || Date.parse(horarioSelecionado) < mensal.referenciaAtual())) {
      setSelecao({ contexto: '', data: '', horario: '' })
      mensal.renovar()
      setErroGeral('Este horário já passou. Escolha outro horário disponível.')
      return
    }
    if (!operacaoIncerta && modo === 'MANUAL' && exigirDisponibilidade && !verificacaoValida) {
      setErroGeral('Verifique novamente a disponibilidade desta data e hora antes de criar a consulta.')
      return
    }

    const operacao = operacaoIncerta ?? { dados, chave: chaveDeIdempotencia() }
    const controle = new AbortController()
    criacaoRef.current = controle
    enviandoRef.current = true
    setSalvando(true)
    try {
      const consulta = await servicoConsultas.criar(operacao.dados, { usarApiReal, chaveIdempotencia: operacao.chave, signal: controle.signal })
      if (controle.signal.aborted) return
      if (consulta.pacienteId !== pacienteId) throw new ErroApi(201, 'RESPOSTA_INVALIDA')
      setOperacaoIncerta(null)
      setSelecao({ contexto: '', data: '', horario: '' })
      mensal.renovar()
      setDataHora('')
      setObservacoes('')
      setEstadoDisponibilidade('NAO_VERIFICADA')
      setDataHoraVerificada('')
      setConexaoVerificada(null)
      aoCriar(consulta)
    } catch (erro) {
      if (controle.signal.aborted) return
      if (erro instanceof ErroApi && erro.status === 409) {
        setOperacaoIncerta(null)
        setSelecao({ contexto: '', data: '', horario: '' })
        mensal.renovar()
        setEstadoDisponibilidade('OCUPADO')
        setDataHoraVerificada('')
        setConexaoVerificada(estadoIntegracao)
        setErroGeral(modo === 'BUSCA' ? 'Este horário deixou de estar disponível. Escolha outro horário.' : 'Este horário deixou de estar disponível. Verifique novamente antes de criar a consulta.')
      } else if (erro instanceof ErroApi && erro.codigo === 'GOOGLE_DISPONIBILIDADE_INDISPONIVEL') {
        setOperacaoIncerta(null)
        setSelecao({ contexto: '', data: '', horario: '' })
        mensal.invalidar('Não foi possível consultar o Google Agenda. Tente buscar novamente.')
        setEstadoDisponibilidade('INDISPONIVEL')
        setDataHoraVerificada('')
        setConexaoVerificada(estadoIntegracao)
        setErroGeral('Não foi possível consultar o Google Agenda. Tente verificar a disponibilidade novamente.')
      } else if (!(erro instanceof ErroApi) || erro.status === 0 || erro.status >= 500 || erro.codigo === 'RESPOSTA_INVALIDA') {
        setOperacaoIncerta(operacao)
        setErroGeral('A resposta da criação não foi recebida. Repita a confirmação para recuperar a mesma consulta com segurança.')
      } else {
        setOperacaoIncerta(null)
        setErros(errosDeCampo(erro))
        setErroGeral(mensagemErro(erro))
      }
    } finally {
      enviandoRef.current = false
      if (!controle.signal.aborted) setSalvando(false)
    }
  }

  const quantidadeErros = Object.keys(erros).length
  const textoDisponibilidade = mensagensDisponibilidade[disponibilidadeVisivel]

  return (
    <form className="formulario" onSubmit={enviar} noValidate aria-busy={salvando}>
      {!emDialogo && <h2>Nova consulta</h2>}
      <div className="agendamento-introducao">
        {emDialogo && pacienteFixoId && <div className="agendamento-paciente"><strong>{pacienteNome ?? 'Paciente'}</strong>{pacienteEmail && <span>{pacienteEmail}</span>}</div>}
        <p className="section-intro">Selecione uma data e um horário livre para o acompanhamento.</p>
      </div>
      {quantidadeErros > 1 && (
        <div className="google-agenda-resumo-erros erro" role="alert" tabIndex={-1} ref={resumoErros}>
          <strong>Revise os campos abaixo:</strong>
          <ul>
            {erros.pacienteId && <li><a href="#agenda-paciente">Paciente: {erros.pacienteId}</a></li>}
            {erros.agendadaPara && <li><a href="#agenda-data-hora">Data e hora: {erros.agendadaPara}</a></li>}
          </ul>
        </div>
      )}
      <ol className="agendamento-etapas" aria-label="Etapas do agendamento">
        <li aria-current={!selecaoAtual.data ? 'step' : undefined}><span>1</span> Data</li>
        <li aria-current={selecaoAtual.data && !horarioSelecionado ? 'step' : undefined}><span>2</span> Horário</li>
        <li aria-current={horarioSelecionado ? 'step' : undefined}><span>3</span> Confirmação</li>
      </ol>
      <div className="agendamento-modos" aria-label="Forma de agendamento">
        <button className="secondary" type="button" aria-pressed={modo === 'BUSCA'} disabled={salvando} onClick={() => alterarModo('BUSCA')}>Buscar horários</button>
        <button className="secondary" type="button" aria-pressed={modo === 'MANUAL'} disabled={salvando} onClick={() => alterarModo('MANUAL')}>Informar data e hora</button>
      </div>
      {erroGeral && <p role="alert" className="erro">{erroGeral}</p>}
      {erroPacientes && <p role="alert" className="erro">{erroPacientes}</p>}

      {!pacienteFixoId && (
        <div><label htmlFor="agenda-paciente">Paciente</label>
          <select
            id="agenda-paciente"
            required
            disabled={salvando}
            value={pacienteSelecionadoId}
            aria-invalid={!!erros.pacienteId}
            aria-describedby={erros.pacienteId ? 'agenda-paciente-erro' : undefined}
            onChange={evento => {
              requisicaoDisponibilidade.current?.abort()
              setPacienteSelecionadoId(evento.target.value)
              setEstadoDisponibilidade('NAO_VERIFICADA')
              setDataHoraVerificada('')
              setSelecao({ contexto: '', data: '', horario: '' })
              limparOperacao()
              setErros(atuais => { const novos = { ...atuais }; delete novos.pacienteId; return novos })
            }}
          >
            <option value="">Selecione</option>
            {pacientes.map(paciente => <option key={paciente.id} value={paciente.id}>{paciente.nome}</option>)}
          </select>
        </div>
      )}
      {erros.pacienteId && <span id="agenda-paciente-erro" className="erro-campo" role={quantidadeErros <= 1 ? 'alert' : undefined}>{erros.pacienteId}</span>}

      {modo === 'BUSCA' ? <>
        <div className="agendamento-disponibilidade" role="status" aria-live="polite" aria-atomic="true">
          {mensal.estado === 'CARREGANDO' && 'Buscando horários disponíveis...'}
          {semHorariosExibidos && 'Não foram encontrados horários livres neste mês. '}
          {mensal.dados && `Disponibilidade ${mensal.dados.fonteDisponibilidade === 'LOCAL_E_GOOGLE' ? 'local e Google Agenda' : 'local do PsiqApp'}. Horários em São Paulo.`}
        </div>
        {mensal.estado === 'FALHA' && <div><p className="erro" role="alert">{mensal.erro}</p><button type="button" className="secondary" disabled={salvando} onClick={mensal.renovar}>Buscar novamente</button></div>}
        {mensal.dados && <div className="agendamento-busca">
          <CalendarioDisponibilidade mes={mensal.dados.mes} hoje={mensal.dados.hoje} dias={diasExibidos} selecionada={selecaoAtual.data}
            desabilitado={salvando} aoMudarMes={mes => { limparOperacao(); mensal.mudarMes(mes) }}
            aoSelecionar={data => { limparOperacao(); setSelecao({ contexto: mensal.identificador, data, horario: '' }) }} />
          <HorariosDisponiveis data={selecaoAtual.data} horarios={horariosDia} selecionado={horarioSelecionado} desabilitado={salvando}
            aoSelecionar={horario => { limparOperacao(); setSelecao({ contexto: mensal.identificador, data: selecaoAtual.data, horario }) }} />
        </div>}
        {erros.agendadaPara && <span className="erro-campo" role="alert">{erros.agendadaPara}</span>}
      </> : <>
      <label htmlFor="agenda-data-hora">Data e hora
        <input
          id="agenda-data-hora"
          type="datetime-local"
          required
          disabled={salvando}
          value={dataHora}
          aria-invalid={!!erros.agendadaPara || estadoDisponibilidade === 'OCUPADO'}
          aria-describedby={[
            exigirDisponibilidade ? 'disponibilidade-consulta-mensagem' : '',
            erros.agendadaPara ? 'agenda-data-hora-erro' : '',
          ].filter(Boolean).join(' ') || undefined}
          onChange={evento => alterarDataHora(evento.target.value)}
        />
      </label>
      {erros.agendadaPara && <span id="agenda-data-hora-erro" className="erro-campo" role={quantidadeErros <= 1 ? 'alert' : undefined}>{erros.agendadaPara}</span>}
      {exigirDisponibilidade && (
        <div className="google-agenda-verificacao" aria-busy={disponibilidadeVisivel === 'VERIFICANDO'}>
          <button
            className="secondary google-agenda-verificar"
            type="button"
            onClick={() => void verificarDisponibilidade()}
            disabled={!dataHora || salvando || disponibilidadeVisivel === 'VERIFICANDO' || estadoIntegracao === 'CARREGANDO'}
          >
            {disponibilidadeVisivel === 'VERIFICANDO' ? 'Verificando...' : 'Verificar disponibilidade'}
          </button>
          <p
            id="disponibilidade-consulta-mensagem"
            className={`google-agenda-mensagem-disponibilidade disponibilidade-${disponibilidadeVisivel.toLowerCase()}`}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {textoDisponibilidade}
          </p>
        </div>
      )}

      </>}

      <label htmlFor="agenda-observacoes">Observações
        <textarea id="agenda-observacoes" value={observacoes} disabled={salvando} onChange={evento => { limparOperacao(); setObservacoes(evento.target.value) }} />
      </label>
      {modo === 'BUSCA' && horarioSelecionado && <section className="agendamento-resumo" aria-label="Revisão do agendamento">
        <div className="agendamento-resumo-item">
          <span className="agendamento-resumo-icone"><IconeAgendamento nome="calendario" /></span>
          <div><small>Data escolhida</small><strong><time dateTime={selecaoAtual.data} aria-label={dataCompleta(selecaoAtual.data)}>{dataResumida(selecaoAtual.data)}</time></strong><span>{diaDaSemana(selecaoAtual.data)}</span></div>
        </div>
        <div className="agendamento-resumo-item">
          <span className="agendamento-resumo-icone"><IconeAgendamento nome="relogio" /></span>
          <div><small>Horário escolhido</small><strong>{horaAgenda(horarioSelecionado)}</strong><span>São Paulo</span></div>
        </div>
        <div className="agendamento-resumo-item">
          <span className="agendamento-resumo-icone"><IconeAgendamento nome="paciente" /></span>
          <div><small>Paciente</small><strong>{pacienteRevisao?.nome ?? 'Selecione um paciente'}</strong>{pacienteRevisao?.email && <span>{pacienteRevisao.email}</span>}</div>
        </div>
      </section>}
      <div className="form-actions">
        {emDialogo && <button type="button" className="secondary" onClick={aoCancelar} disabled={salvando}><IconeAgendamento nome="seta-esquerda" />Voltar</button>}
        <button className="primary" disabled={!podeCriar}>
          {salvando ? 'Salvando...' : operacaoIncerta ? 'Repetir confirmação' : modo === 'BUSCA' ? 'Confirmar agendamento' : emDialogo ? 'Agendar consulta' : 'Criar consulta'}
          <IconeAgendamento nome="seta-direita" />
        </button>
      </div>
    </form>
  )
}
