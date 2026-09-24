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
  const [cadastroAberto, setCadastroAberto] = useState(false)
  const [pagina, setPagina] = useState({ pagina: 0, tamanho: 25, total: 0 })
  useEffect(() => {
    if (!cadastroAberto) return
    const fecharComEscape = (evento: KeyboardEvent) => { if (evento.key === 'Escape') setCadastroAberto(false) }
    window.addEventListener('keydown', fecharComEscape)
    return () => window.removeEventListener('keydown', fecharComEscape)
  }, [cadastroAberto])
  useEffect(() => { const controle = new AbortController(); servicoPacientes.buscar(busca, controle.signal, 25, pagina.pagina).then(resposta => { setPacientes(resposta.itens); setPagina({ pagina: resposta.pagina, tamanho: resposta.tamanho, total: resposta.total }); setErro('') }).catch(falha => { if (!(falha instanceof DOMException)) setErro('Não foi possível carregar pacientes.') }).finally(() => { if (!controle.signal.aborted) setCarregando(false) }); return () => controle.abort() }, [busca, pagina.pagina])
  return <section className="patients-page">
    <div className="page-heading"><div><h1>Pacientes</h1><p className="section-intro">Encontre um paciente ou inicie um novo acompanhamento.</p></div><button className="primary" type="button" onClick={() => setCadastroAberto(true)} aria-haspopup="dialog">+&nbsp; Novo paciente</button></div>
    <div className="section-panel"><div className="list-toolbar"><label>Buscar por nome<input type="search" autoComplete="off" placeholder="Ex.: Helena…" value={busca} onChange={e => { setPagina(atual => ({ ...atual, pagina: 0 })); setBusca(e.target.value) }} /></label><p className="muted"><small>{pagina.total} {pagina.total === 1 ? 'paciente cadastrado' : 'pacientes cadastrados'}</small></p></div>{erro && <p role="alert" className="erro">{erro}</p>}<ListaPacientes pacientes={pacientes} carregando={carregando} /><Paginacao {...pagina} aoMudar={novaPagina => setPagina(atual => ({ ...atual, pagina: novaPagina }))} /></div>
    {cadastroAberto && <dialog open className="dialog-paciente" aria-labelledby="titulo-cadastro"><div className="dialog-header"><h2 id="titulo-cadastro">Novo paciente</h2><button className="icon-button" type="button" onClick={() => setCadastroAberto(false)} aria-label="Fechar cadastro"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button></div><div className="dialog-body"><FormularioPaciente aoCancelar={() => setCadastroAberto(false)} aoCriar={paciente => { setPacientes(atuais => [paciente, ...atuais]); setPagina(atual => ({ ...atual, total: atual.total + 1 })); window.dispatchEvent(new Event('pacientes:atualizados')); setCadastroAberto(false) }} /></div></dialog>}
  </section>
}
