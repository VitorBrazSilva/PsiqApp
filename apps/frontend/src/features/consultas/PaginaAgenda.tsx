import { useEffect, useState } from 'react'
import { FormularioConsulta } from './FormularioConsulta'
import { ListaConsultas } from './ListaConsultas'
import { servicoConsultas, type Consulta } from './servicoConsultas'
import { servicoPacientes, type Paciente } from '../pacientes/servicoPacientes'
import { Paginacao } from '../../shared/componentes/Paginacao'

export function PaginaAgenda() {
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [pacienteFiltro, setPacienteFiltro] = useState('')
  const [de, setDe] = useState('')
  const [ate, setAte] = useState('')
  const [pagina, setPagina] = useState({ pagina: 0, tamanho: 50, total: 0 })

  useEffect(() => {
    const controle = new AbortController()
    const filtros = { pacienteId: pacienteFiltro || undefined, de: de || undefined, ate: ate || undefined, pagina: pagina.pagina, tamanho: 50 }
    servicoConsultas.listar(Object.values(filtros).some(Boolean) ? filtros : {}, controle.signal)
      .then(resposta => { setConsultas(resposta.itens); setPagina({ pagina: resposta.pagina, tamanho: resposta.tamanho, total: resposta.total }); setErro('') })
      .catch(falha => { if (falha instanceof DOMException) return; setErro('Não foi possível carregar a agenda.') })
      .finally(() => { if (!controle.signal.aborted) setCarregando(false) })
    return () => controle.abort()
  }, [pacienteFiltro, de, ate, pagina.pagina])

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
        <div className="cabecalho-pagina"><div><p className="etiqueta">ROTINA DO CONSULTÓRIO</p><h1>Agenda</h1><p className="subtitulo">Acompanhe consultas e mantenha cada transição registrada.</p></div><span className="contador">{consultas.length} consultas</span></div>
        {erro && <p role="alert" className="erro">{erro}</p>}
        <div className="filtros-agenda" aria-label="Filtros da agenda">
          <label>Filtrar por paciente<select value={pacienteFiltro} onChange={e => { setPagina(atual => ({ ...atual, pagina: 0 })); setPacienteFiltro(e.target.value) }}><option value="">Todos os pacientes</option>{pacientes.map(paciente => <option key={paciente.id} value={paciente.id}>{paciente.nome}</option>)}</select></label>
          <label>De<input type="date" value={de} onChange={e => { setPagina(atual => ({ ...atual, pagina: 0 })); setDe(e.target.value) }} /></label>
          <label>Até<input type="date" value={ate} onChange={e => { setPagina(atual => ({ ...atual, pagina: 0 })); setAte(e.target.value) }} /></label>
        </div>
        <ListaConsultas consultas={consultas} carregando={carregando} aoAtualizar={substituir}
          nomesPacientes={Object.fromEntries(pacientes.map(paciente => [paciente.id, paciente.nome]))} />
        <Paginacao {...pagina} aoMudar={novaPagina => { setCarregando(true); setPagina(atual => ({ ...atual, pagina: novaPagina })) }} />
      </div>
      <div className="painel">
        <FormularioConsulta aoCriar={consulta => setConsultas(atuais => [consulta, ...atuais])} />
      </div>
    </section>
  )
}
