import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { servicoPacientes, type Paciente } from '../pacientes/servicoPacientes'
import { DialogoConsulta } from './DialogoConsulta'
import { PainelConsultas } from './PainelConsultas'
import { PainelIntegracaoGoogle } from './PainelIntegracaoGoogle'
import { ProximaConsultaAgenda } from './ProximaConsultaAgenda'
import { servicoGoogleAgenda, type EstadoConexaoGoogleAgenda } from './servicoGoogleAgenda'

const estadosConexaoValidos: EstadoConexaoGoogleAgenda[] = [
  'NAO_CONFIGURADA',
  'NAO_CONECTADA',
  'DESCONECTADA',
  'CONECTADA',
  'INDISPONIVEL',
]

const mensagensOAuth: Record<string, { texto: string, tipo: 'sucesso' | 'erro' }> = {
  conectada: { texto: 'A conexão com Google Agenda foi concluída.', tipo: 'sucesso' },
  erro: { texto: 'Não foi possível concluir a autorização do Google. Tente conectar novamente.', tipo: 'erro' },
  indisponivel: { texto: 'O Google Agenda não está disponível para conexão neste momento.', tipo: 'erro' },
}

async function consultarEstadoIntegracao(signal?: AbortSignal) {
  try {
    const resposta = await servicoGoogleAgenda.obterEstado(signal)
    const estado = estadosConexaoValidos.includes(resposta.estado) ? resposta.estado : 'INDISPONIVEL'
    return { estado, erro: '' }
  } catch {
    return {
      estado: 'INDISPONIVEL' as const,
      erro: 'Não foi possível consultar o estado da conexão. Tente verificar novamente a disponibilidade.',
    }
  }
}

export function PaginaAgenda() {
  const localizacao = useLocation()
  const resultadoOAuth = new URLSearchParams(localizacao.search).get('googleAgenda')
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [carregandoIntegracao, setCarregandoIntegracao] = useState(true)
  const [desconectando, setDesconectando] = useState(false)
  const [erroIntegracao, setErroIntegracao] = useState('')
  const [mensagemIntegracao, setMensagemIntegracao] = useState<{ texto: string, tipo: 'sucesso' | 'erro' } | null>(null)
  const [estadoIntegracao, setEstadoIntegracao] = useState<EstadoConexaoGoogleAgenda | null>(null)
  const [pacienteFiltro, setPacienteFiltro] = useState('')
  const [versaoAgenda, setVersaoAgenda] = useState(0)
  const [versaoProximaConsulta, setVersaoProximaConsulta] = useState(0)
  const [agendamentoAberto, setAgendamentoAberto] = useState(false)
  const [mensagemConsulta, setMensagemConsulta] = useState('')

  useEffect(() => {
    const controlador = new AbortController()
    servicoPacientes.buscar('', controlador.signal, 100, 0, { usarApiReal: true })
      .then(resposta => setPacientes(resposta.itens))
      .catch(() => { if (!controlador.signal.aborted) setPacientes([]) })
    return () => controlador.abort()
  }, [])

  useEffect(() => {
    let controlador: AbortController | null = null
    const atualizar = () => {
      if (document.visibilityState !== 'visible') return
      controlador?.abort()
      const controle = new AbortController()
      controlador = controle
      void consultarEstadoIntegracao(controle.signal).then(resultado => {
        if (controle.signal.aborted) return
        setEstadoIntegracao(resultado.estado)
        setErroIntegracao(resultado.erro)
        setCarregandoIntegracao(false)
      })
    }
    atualizar()
    window.addEventListener('focus', atualizar)
    document.addEventListener('visibilitychange', atualizar)
    return () => { controlador?.abort(); window.removeEventListener('focus', atualizar); document.removeEventListener('visibilitychange', atualizar) }
  }, [])

  async function desconectarGoogle() {
    const confirmar = window.confirm(
      'Desconectar Google Agenda? A agenda local continuará funcionando. Os eventos já criados permanecerão no Google e não receberão novas atualizações do PsiqApp.',
    )
    if (!confirmar) return
    setDesconectando(true)
    setErroIntegracao('')
    setMensagemIntegracao(null)
    try {
      await servicoGoogleAgenda.desconectar()
      setMensagemIntegracao({ texto: 'Conta Google desconectada. Os eventos já criados permanecem no calendário.', tipo: 'sucesso' })
      setCarregandoIntegracao(true)
      const resultado = await consultarEstadoIntegracao()
      setEstadoIntegracao(resultado.estado)
      setErroIntegracao(resultado.erro)
      setCarregandoIntegracao(false)
    } catch {
      setErroIntegracao('Não foi possível desconectar a conta Google. Tente novamente.')
    } finally {
      setDesconectando(false)
    }
  }

  const resultadoOAuthVisivel = resultadoOAuth ? mensagensOAuth[resultadoOAuth] ?? null : null
  const nomesPacientes = Object.fromEntries(pacientes.map(paciente => [paciente.id, paciente.nome]))

  return (
    <section className="agenda-page">
      <div className="page-heading">
        <div>
          <h1>Agenda</h1>
          <p className="section-intro">Acompanhe suas consultas e os próximos atendimentos.</p>
        </div>
        <button className="primary agenda-agendar" type="button" aria-haspopup="dialog" onClick={() => {
          setMensagemConsulta('')
          setAgendamentoAberto(true)
        }}><svg className="button-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>Agendar consulta</button>
      </div>

      {mensagemConsulta && <p className="agenda-feedback" role="status">{mensagemConsulta}</p>}
      <ProximaConsultaAgenda key={pacienteFiltro || 'todos'} pacienteId={pacienteFiltro || undefined}
        nomesPacientes={nomesPacientes} versaoAtualizacao={versaoProximaConsulta} />

      <div className="agenda-layout">
        <section className="section-panel agenda-consultas" aria-labelledby="titulo-consultas-agenda">
          <div className="records-heading"><h2 id="titulo-consultas-agenda">Consultas</h2><p>Horários de Brasília.</p></div>
          <div className="filtros-agenda" aria-label="Filtros da agenda">
            <label htmlFor="filtro-agenda-paciente">Filtrar paciente
              <select id="filtro-agenda-paciente" value={pacienteFiltro} onChange={evento => setPacienteFiltro(evento.target.value)}>
                <option value="">Todos os pacientes</option>
                {pacientes.map(paciente => <option key={paciente.id} value={paciente.id}>{paciente.nome}</option>)}
              </select>
            </label>
          </div>
          <PainelConsultas key={pacienteFiltro || 'todos'} versaoAtualizacao={versaoAgenda} nomesPacientes={nomesPacientes} pacienteId={pacienteFiltro || undefined}
            aoAtualizarConsulta={() => setVersaoProximaConsulta(atual => atual + 1)} />
        </section>
        <aside className="agenda-lateral" aria-label="Integração da agenda">
          <PainelIntegracaoGoogle
            estado={estadoIntegracao}
            carregando={carregandoIntegracao}
            ocupada={desconectando}
            erro={erroIntegracao}
            mensagemResultado={mensagemIntegracao ?? resultadoOAuthVisivel}
            aoDesconectar={() => void desconectarGoogle()}
          />
        </aside>
      </div>
      {agendamentoAberto && <DialogoConsulta
          estadoIntegracao={estadoIntegracao ?? 'CARREGANDO'}
          aoFechar={() => setAgendamentoAberto(false)}
          aoCriar={() => {
            setAgendamentoAberto(false)
            setMensagemConsulta('Consulta agendada com sucesso.')
            setVersaoAgenda(atual => atual + 1)
            setVersaoProximaConsulta(atual => atual + 1)
          }}
        />}
    </section>
  )
}
