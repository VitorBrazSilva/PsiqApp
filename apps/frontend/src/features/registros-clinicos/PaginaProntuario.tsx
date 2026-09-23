import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ErroApi } from '../../shared/api/erroApi'
import { EstadoVazio } from '../../shared/componentes/EstadoVazio'
import { FonteRegistroClinico } from '../analises/FonteRegistroClinico'
import { HistoricoGeracoes } from '../analises/HistoricoGeracoes'
import { PainelAnaliseAtual } from '../analises/PainelAnaliseAtual'
import { servicoAnalises, type AnaliseClinica, type GeracaoAnalise } from '../analises/servicoAnalises'
import { usePollingAnalise } from '../analises/usePollingAnalise'
import { FormularioConsulta } from '../consultas/FormularioConsulta'
import { ListaConsultas } from '../consultas/ListaConsultas'
import { servicoConsultas, type Consulta } from '../consultas/servicoConsultas'
import { DadosPaciente } from '../pacientes/DadosPaciente'
import { servicoPacientes, type Paciente } from '../pacientes/servicoPacientes'
import { FormularioParecer } from './FormularioParecer'
import { LinhaDoTempoClinica } from './LinhaDoTempoClinica'
import { servicoRegistrosClinicos, type CriarRegistroClinicoResposta, type RegistroClinico } from './servicoRegistrosClinicos'
import { Paginacao } from '../../shared/componentes/Paginacao'

export function PaginaProntuario() {
  const { pacienteId } = useParams()
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [registros, setRegistros] = useState<RegistroClinico[]>([])
  const [carregando, setCarregando] = useState(!!pacienteId)
  const [erro, setErro] = useState('')
  const [originalEmComplemento, setOriginalEmComplemento] = useState<string | null>(null)
  const [fonteAberta, setFonteAberta] = useState<string | null>(null)
  const [regenerando, setRegenerando] = useState(false)
  const [analiseHistorica, setAnaliseHistorica] = useState<AnaliseClinica | null>(null)
  const [paginaRegistros, setPaginaRegistros] = useState({ pagina: 0, tamanho: 100, total: 0 })
  const { estado, geracoes, carregando: carregandoAnalise, erro: erroAnalise, recarregar } = usePollingAnalise(pacienteId ?? null)

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
    void recarregar()
  }

  async function regenerarAnalise() {
    const idPaciente = pacienteId
    if (!idPaciente) return
    setRegenerando(true)
    setErro('')
    try {
      await servicoAnalises.regenerar(idPaciente)
      await recarregar()
    } catch (falha) {
      setErro(falha instanceof ErroApi ? falha.message : 'Não foi possível solicitar regeneração.')
    } finally {
      setRegenerando(false)
    }
  }

  async function abrirHistorico(geracao: GeracaoAnalise) {
    if (!geracao.analiseId || geracao.pacienteId !== pacienteId) return
    try {
      const analise = await servicoAnalises.obterHistorica(pacienteId, geracao.analiseId)
      if (analise.pacienteId === pacienteId && analise.geracaoId === geracao.id) setAnaliseHistorica(analise)
    } catch {
      setErro('Não foi possível abrir esta versão histórica da análise.')
    }
  }

  return (
    <section className="pagina-prontuario">
      <div className="painel">
        <h1>Prontuário</h1>
        {erro && <p role="alert" className="erro">{erro}</p>}
        {paciente && <DadosPaciente paciente={paciente} />}
        <section className="bloco">
          <h2>Consultas do paciente</h2>
          <ListaConsultas consultas={consultas} carregando={false} aoAtualizar={consulta =>
            setConsultas(atuais => atuais.map(item => item.id === consulta.id ? consulta : item))
          } nomesPacientes={paciente ? { [paciente.id]: paciente.nome } : undefined} />
        </section>
      </div>

      <div className="grade-prontuario">
        <section className="painel">
          <FormularioConsulta pacienteFixoId={pacienteId} aoCriar={consulta => setConsultas(atuais => [consulta, ...atuais])} />
        </section>
        <section className="painel">
          <FormularioParecer pacienteId={pacienteId} aoCriar={registrarCriacao} />
        </section>
      </div>

      <section className="painel">
        <h2>Linha do tempo clínica</h2>
        <LinhaDoTempoClinica
          pacienteId={pacienteId}
          registros={registros}
          originalEmComplemento={originalEmComplemento}
          aoComplementar={setOriginalEmComplemento}
          aoCancelarComplemento={() => setOriginalEmComplemento(null)}
          aoCriarComplemento={registrarCriacao}
        />
        <Paginacao {...paginaRegistros} aoMudar={novaPagina => setPaginaRegistros(atual => ({ ...atual, pagina: novaPagina }))} />
      </section>

      <div>
        <PainelAnaliseAtual
          estado={estado}
          carregando={carregandoAnalise}
          erro={erroAnalise}
          aoRegenerar={regenerarAnalise}
          regenerando={regenerando}
          aoAbrirFonte={setFonteAberta}
          analiseHistorica={analiseHistorica}
        />
        <FonteRegistroClinico pacienteId={pacienteId} registroId={fonteAberta} aoFechar={() => setFonteAberta(null)} />
        <div className="painel">
          <HistoricoGeracoes geracoes={geracoes} aoAbrir={abrirHistorico} />
        </div>
      </div>
    </section>
  )
}
