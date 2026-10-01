import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { Paginacao } from '../../shared/componentes/Paginacao'
import { servicoPacientes, type Paciente } from '../pacientes/servicoPacientes'
import { FormularioConsulta } from './FormularioConsulta'
import { ListaConsultas } from './ListaConsultas'
import { PainelIntegracaoGoogle } from './PainelIntegracaoGoogle'
import { servicoConsultas, type Consulta } from './servicoConsultas'
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
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [carregando, setCarregando] = useState(true)
  const [carregandoIntegracao, setCarregandoIntegracao] = useState(true)
  const [desconectando, setDesconectando] = useState(false)
  const [erro, setErro] = useState('')
  const [erroIntegracao, setErroIntegracao] = useState('')
  const [mensagemIntegracao, setMensagemIntegracao] = useState<{ texto: string, tipo: 'sucesso' | 'erro' } | null>(null)
  const [estadoIntegracao, setEstadoIntegracao] = useState<EstadoConexaoGoogleAgenda | null>(null)
  const [pacienteFiltro, setPacienteFiltro] = useState('')
  const [de, setDe] = useState('')
  const [ate, setAte] = useState('')
  const [pagina, setPagina] = useState({ pagina: 0, tamanho: 50, total: 0 })

  useEffect(() => {
    const controlador = new AbortController()
    const filtros = {
      pacienteId: pacienteFiltro || undefined,
      de: de || undefined,
      ate: ate || undefined,
      pagina: pagina.pagina,
      tamanho: 50,
    }
    servicoConsultas.listar(filtros, controlador.signal, { usarApiReal: true })
      .then(resposta => {
        setConsultas(resposta.itens)
        setPagina({ pagina: resposta.pagina, tamanho: resposta.tamanho, total: resposta.total })
        setErro('')
      })
      .catch(falha => {
        if (!(falha instanceof DOMException && falha.name === 'AbortError')) setErro('Não foi possível carregar a agenda.')
      })
      .finally(() => { if (!controlador.signal.aborted) setCarregando(false) })
    return () => controlador.abort()
  }, [pacienteFiltro, de, ate, pagina.pagina])

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

  const resetarPaginacao = () => setPagina(atual => ({ ...atual, pagina: 0 }))
  const resultadoOAuthVisivel = resultadoOAuth ? mensagensOAuth[resultadoOAuth] ?? null : null

  return (
    <section className="agenda-page">
      <div className="page-heading">
        <div>
          <h1>Agenda</h1>
          <p className="section-intro">Acompanhe consultas e mantenha cada transição registrada.</p>
        </div>
        <span className="contador">{pagina.total} consultas</span>
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
        {erro && <p role="alert" className="erro">{erro}</p>}
        <div className="filtros-agenda" aria-label="Filtros da agenda">
          <label htmlFor="filtro-agenda-paciente">Filtrar paciente
            <select id="filtro-agenda-paciente" value={pacienteFiltro} onChange={evento => { resetarPaginacao(); setPacienteFiltro(evento.target.value) }}>
              <option value="">Todos os pacientes</option>
              {pacientes.map(paciente => <option key={paciente.id} value={paciente.id}>{paciente.nome}</option>)}
            </select>
          </label>
          <label htmlFor="filtro-agenda-de">De<input id="filtro-agenda-de" type="date" value={de} onChange={evento => { resetarPaginacao(); setDe(evento.target.value) }} /></label>
          <label htmlFor="filtro-agenda-ate">Até<input id="filtro-agenda-ate" type="date" value={ate} onChange={evento => { resetarPaginacao(); setAte(evento.target.value) }} /></label>
        </div>
        <ListaConsultas
          consultas={consultas}
          carregando={carregando}
          aoAtualizar={consulta => setConsultas(itens => itens.map(item => item.id === consulta.id ? consulta : item))}
          nomesPacientes={Object.fromEntries(pacientes.map(paciente => [paciente.id, paciente.nome]))}
          usarApiReal
        />
        <Paginacao {...pagina} aoMudar={novaPagina => setPagina(atual => ({ ...atual, pagina: novaPagina }))} />
      </div>

      <div className="section-panel agenda-form">
        <FormularioConsulta
          aoCriar={consulta => setConsultas(itens => [consulta, ...itens])}
          exigirDisponibilidade
          estadoIntegracao={estadoIntegracao ?? 'CARREGANDO'}
          usarApiReal
        />
      </div>
    </section>
  )
}
