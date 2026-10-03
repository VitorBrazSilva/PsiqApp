import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { servicoPacientes, type Paciente } from '../pacientes/servicoPacientes'
import { FormularioConsulta } from './FormularioConsulta'
import { PainelConsultas } from './PainelConsultas'
import { PainelIntegracaoGoogle } from './PainelIntegracaoGoogle'
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

  useEffect(() => {
    const controlador = new AbortController()
    servicoPacientes.buscar('', controlador.signal, 100, 0, { usarApiReal: true })
      .then(resposta => setPacientes(resposta.itens))
      .catch(() => { if (!controlador.signal.aborted) setPacientes([]) })
    return () => controlador.abort()
  }, [])

  useEffect(() => {
    const controlador = new AbortController()
    void consultarEstadoIntegracao(controlador.signal).then(resultado => {
      if (controlador.signal.aborted) return
      setEstadoIntegracao(resultado.estado)
      setErroIntegracao(resultado.erro)
      setCarregandoIntegracao(false)
    })
    return () => controlador.abort()
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

  return (
    <section className="agenda-page">
      <div className="page-heading">
        <div>
          <h1>Agenda</h1>
          <p className="section-intro">Acompanhe consultas e mantenha cada transição registrada.</p>
        </div>
        <span className="contador">Agenda de consultas</span>
      </div>

      <PainelIntegracaoGoogle
        estado={estadoIntegracao}
        carregando={carregandoIntegracao}
        ocupada={desconectando}
        erro={erroIntegracao}
        mensagemResultado={mensagemIntegracao ?? resultadoOAuthVisivel}
        aoDesconectar={() => void desconectarGoogle()}
      />

      <div className="section-panel">
        <div className="records-heading"><h2>Consultas</h2></div>
        <div className="filtros-agenda" aria-label="Filtros da agenda">
          <label htmlFor="filtro-agenda-paciente">Filtrar paciente
            <select id="filtro-agenda-paciente" value={pacienteFiltro} onChange={evento => setPacienteFiltro(evento.target.value)}>
              <option value="">Todos os pacientes</option>
              {pacientes.map(paciente => <option key={paciente.id} value={paciente.id}>{paciente.nome}</option>)}
            </select>
          </label>
        </div>
        <PainelConsultas key={pacienteFiltro || 'todos'} versaoAtualizacao={versaoAgenda} nomesPacientes={Object.fromEntries(pacientes.map(paciente => [paciente.id, paciente.nome]))} pacienteId={pacienteFiltro || undefined} />
      </div>
      <div className="section-panel agenda-form">
        <FormularioConsulta
          aoCriar={() => setVersaoAgenda(atual => atual + 1)}
          exigirDisponibilidade
          estadoIntegracao={estadoIntegracao ?? 'CARREGANDO'}
          usarApiReal
        />
      </div>
    </section>
  )
}
