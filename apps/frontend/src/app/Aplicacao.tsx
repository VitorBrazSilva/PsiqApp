import { NavLink, useLocation } from 'react-router'
import { AvisoDadosFicticios } from '../shared/componentes/AvisoDadosFicticios'
import { Rotas } from './rotas'

export function Aplicacao() {
  const localizacao = useLocation()
  const nomeRota = localizacao.pathname.startsWith('/prontuario/') ? 'Prontuário' : localizacao.pathname === '/agenda' ? 'Agenda' : 'Pacientes'
  return <>
    <a className="pular-conteudo" href="#conteudo">Pular para o conteúdo</a>
    <AvisoDadosFicticios />
    <div className="aplicacao-shell">
      <header className="cabecalho">
        <div className="marca"><span className="marca-simbolo" aria-hidden="true">P</span><span className="marca-nome">PsiqApp</span><span className="marca-contexto">Ambiente de validação</span></div>
        <nav className="navegacao" aria-label="Navegação principal">
          <NavLink to="/pacientes"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 20v-1a6 6 0 0 1 12 0v1M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM18 8v6m3-3h-6" /></svg> Pacientes</NavLink>
          <NavLink to="/agenda"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" /></svg> Agenda</NavLink>
          <NavLink to="/prontuario"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 4h12v16H6zM9 8h6M9 12h6M9 16h4" /></svg> Prontuário</NavLink>
        </nav>
        <div className="perfil-clinico"><span className="avatar">DR</span><span><strong>Dr. Validação</strong><small>Consultório</small></span></div>
      </header>
      <main id="conteudo" className="conteudo" tabIndex={-1}>
        <div className="trilha" aria-label="Breadcrumb"><NavLink to="/pacientes">Início</NavLink><span aria-hidden="true">/</span><span>{nomeRota}</span></div>
        <Rotas />
      </main>
      <footer>Uso local · Validação com dados fictícios</footer>
    </div>
  </>
}
