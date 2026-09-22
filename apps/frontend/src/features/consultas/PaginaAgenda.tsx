import { useEffect, useState } from 'react'
import { FormularioConsulta } from './FormularioConsulta'
import { ListaConsultas } from './ListaConsultas'
import { servicoConsultas, type Consulta } from './servicoConsultas'
import { servicoPacientes, type Paciente } from '../pacientes/servicoPacientes'

export function PaginaAgenda() {
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const controle = new AbortController()
    servicoConsultas.listar({}, controle.signal)
      .then(pagina => { setConsultas(pagina.itens); setErro('') })
      .catch(falha => { if (falha instanceof DOMException) return; setErro('Não foi possível carregar a agenda.') })
      .finally(() => { if (!controle.signal.aborted) setCarregando(false) })
    return () => controle.abort()
  }, [])

  useEffect(() => {
    const controle = new AbortController()
    servicoPacientes.buscar('', controle.signal, 100)
      .then(pagina => setPacientes(Array.isArray(pagina.itens) ? pagina.itens : []))
      .catch(() => setPacientes([]))
    return () => controle.abort()
  }, [])

  function substituir(consulta: Consulta) {
    setConsultas(atuais => atuais.map(item => item.id === consulta.id ? consulta : item))
  }

  return (
    <section className="pagina-dupla">
      <div className="painel">
        <h1>Agenda</h1>
        {erro && <p role="alert" className="erro">{erro}</p>}
        <ListaConsultas consultas={consultas} carregando={carregando} aoAtualizar={substituir}
          nomesPacientes={Object.fromEntries(pacientes.map(paciente => [paciente.id, paciente.nome]))} />
      </div>
      <div className="painel">
        <FormularioConsulta aoCriar={consulta => setConsultas(atuais => [consulta, ...atuais])} />
      </div>
    </section>
  )
}
