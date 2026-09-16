import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ErroApi } from '../../shared/api/erroApi'
import { EstadoVazio } from '../../shared/componentes/EstadoVazio'
import { FonteRegistroClinico } from '../analyses/FonteRegistroClinico'
import { HistoricoGeracoes } from '../analyses/HistoricoGeracoes'
import { PainelAnaliseAtual } from '../analyses/PainelAnaliseAtual'
import { servicoAnalises } from '../analyses/servicoAnalises'
import { usePollingAnalise } from '../analyses/usePollingAnalise'
import { FormularioConsulta } from '../appointments/FormularioConsulta'
import { ListaConsultas } from '../appointments/ListaConsultas'
import { servicoConsultas, type Consulta } from '../appointments/servicoConsultas'
import { DadosPaciente } from '../patients/DadosPaciente'
import { servicoPacientes, type Paciente } from '../patients/servicoPacientes'
import { FormularioParecer } from './FormularioParecer'
import { LinhaDoTempoClinica } from './LinhaDoTempoClinica'
import { servicoRegistrosClinicos, type CriarRegistroClinicoResposta, type RegistroClinico } from './servicoRegistrosClinicos'

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
  const { estado, geracoes, carregando: carregandoAnalise, erro: erroAnalise, recarregar } = usePollingAnalise(pacienteId ?? null)

  useEffect(() => {
    if (!pacienteId) return
    const controle = new AbortController()
    Promise.all([
      servicoPacientes.obter(pacienteId, controle.signal),
      servicoConsultas.listar({ pacienteId }, controle.signal),
      servicoRegistrosClinicos.listar(pacienteId, controle.signal),
    ]).then(([pacienteResposta, paginaConsultas, paginaRegistros]) => {
      setPaciente(pacienteResposta)
      setConsultas(paginaConsultas.items)
      setRegistros(paginaRegistros.items)
      setOriginalEmComplemento(null)
      setFonteAberta(null)
      setErro('')
    }).catch(falha => {
      if (falha instanceof DOMException) return
      setErro('Não foi possível carregar o prontuário.')
    }).finally(() => { if (!controle.signal.aborted) setCarregando(false) })
    return () => controle.abort()
  }, [pacienteId])

  if (!pacienteId) {
    return (
      <section className="painel">
        <h1>Prontuário</h1>
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
      </section>

      <div>
        <PainelAnaliseAtual
          estado={estado}
          carregando={carregandoAnalise}
          erro={erroAnalise}
          aoRegenerar={regenerarAnalise}
          regenerando={regenerando}
          aoAbrirFonte={setFonteAberta}
        />
        <FonteRegistroClinico pacienteId={pacienteId} registroId={fonteAberta} aoFechar={() => setFonteAberta(null)} />
        <div className="painel">
          <HistoricoGeracoes geracoes={geracoes} />
        </div>
      </div>
    </section>
  )
}
