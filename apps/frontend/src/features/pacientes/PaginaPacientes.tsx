import { useEffect, useState } from 'react'
import { FormularioPaciente } from './FormularioPaciente'
import { ListaPacientes } from './ListaPacientes'
import { servicoPacientes, type Paciente } from './servicoPacientes'

export function PaginaPacientes() {
  const [busca, setBusca] = useState('')
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const controle = new AbortController()
    servicoPacientes.buscar(busca, controle.signal)
      .then(pagina => { setPacientes(pagina.itens); setErro('') })
      .catch(falha => { if (falha instanceof DOMException) return; setErro('Não foi possível carregar pacientes.') })
      .finally(() => { if (!controle.signal.aborted) setCarregando(false) })
    return () => controle.abort()
  }, [busca])

  return (
    <section className="pagina-dupla">
      <div className="painel">
        <h1>Pacientes</h1>
        <label>Buscar por nome<input value={busca} onChange={e => { setCarregando(true); setBusca(e.target.value) }} /></label>
        {erro && <p role="alert" className="erro">{erro}</p>}
        <ListaPacientes pacientes={pacientes} carregando={carregando} />
      </div>
      <div className="painel">
        <FormularioPaciente aoCriar={paciente => setPacientes(atuais => [paciente, ...atuais])} />
      </div>
    </section>
  )
}
