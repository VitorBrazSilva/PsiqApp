import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { EstadoVazio } from '../../shared/componentes/EstadoVazio'
import { FormularioConsulta } from '../appointments/FormularioConsulta'
import { ListaConsultas } from '../appointments/ListaConsultas'
import { servicoConsultas, type Consulta } from '../appointments/servicoConsultas'
import { DadosPaciente } from '../patients/DadosPaciente'
import { servicoPacientes, type Paciente } from '../patients/servicoPacientes'

export function PaginaProntuario() {
  const { pacienteId } = useParams()
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [carregando, setCarregando] = useState(!!pacienteId)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!pacienteId) return
    const controle = new AbortController()
    Promise.all([
      servicoPacientes.obter(pacienteId, controle.signal),
      servicoConsultas.listar({ pacienteId }, controle.signal),
    ]).then(([pacienteResposta, paginaConsultas]) => {
      setPaciente(pacienteResposta)
      setConsultas(paginaConsultas.items)
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

  return (
    <section className="pagina-dupla">
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
      <div className="painel">
        <FormularioConsulta pacienteFixoId={pacienteId} aoCriar={consulta => setConsultas(atuais => [consulta, ...atuais])} />
      </div>
    </section>
  )
}
