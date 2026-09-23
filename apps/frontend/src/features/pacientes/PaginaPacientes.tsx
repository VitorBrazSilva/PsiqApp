import { useEffect, useState } from 'react'
import { FormularioPaciente } from './FormularioPaciente'
import { ListaPacientes } from './ListaPacientes'
import { servicoPacientes, type Paciente } from './servicoPacientes'
import { Paginacao } from '../../shared/componentes/Paginacao'

export function PaginaPacientes() {
  const [busca, setBusca] = useState('')
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [pagina, setPagina] = useState({ pagina: 0, tamanho: 25, total: 0 })

  useEffect(() => {
    const controle = new AbortController()
    servicoPacientes.buscar(busca, controle.signal, 25, pagina.pagina)
      .then(resposta => { setPacientes(resposta.itens); setPagina({ pagina: resposta.pagina, tamanho: resposta.tamanho, total: resposta.total }); setErro('') })
      .catch(falha => { if (falha instanceof DOMException) return; setErro('Não foi possível carregar pacientes.') })
      .finally(() => { if (!controle.signal.aborted) setCarregando(false) })
    return () => controle.abort()
  }, [busca, pagina.pagina])

  return (
    <section className="pagina-dupla">
      <div className="painel">
        <div className="cabecalho-pagina"><div><p className="etiqueta">ACOMPANHAMENTO CLÍNICO</p><h1>Pacientes</h1><p className="subtitulo">Encontre um prontuário ou cadastre uma nova pessoa.</p></div><span className="contador">{pacientes.length} visíveis</span></div>
        <label className="campo-busca"><span>Buscar por nome</span><input placeholder="Digite um nome..." value={busca} onChange={e => { setCarregando(true); setPagina(atual => ({ ...atual, pagina: 0 })); setBusca(e.target.value) }} /></label>
        {erro && <p role="alert" className="erro">{erro}</p>}
        <ListaPacientes pacientes={pacientes} carregando={carregando} />
        <Paginacao {...pagina} aoMudar={novaPagina => { setCarregando(true); setPagina(atual => ({ ...atual, pagina: novaPagina })) }} />
      </div>
      <div className="painel">
        <FormularioPaciente aoCriar={paciente => setPacientes(atuais => [paciente, ...atuais])} />
      </div>
    </section>
  )
}
