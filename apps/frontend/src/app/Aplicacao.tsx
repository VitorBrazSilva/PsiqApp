import { NavLink, useLocation } from 'react-router'
import { AvisoDadosFicticios } from '../shared/componentes/AvisoDadosFicticios'
import { Rotas } from './rotas'

export function Aplicacao() {
  const localizacao = useLocation()
  const emAgenda = localizacao.pathname === '/agenda'
  const emProntuario = localizacao.pathname.startsWith('/prontuario/')
  const contexto = emAgenda ? 'Agenda' : emProntuario ? 'Prontuário' : 'Todos os pacientes'
  return <>
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <div className="review-bar" aria-label="Ambiente da aplicação"><div className="review-label"><span className="review-dot" />PsiqApp <span className="review-stage">/ Foco clínico</span></div><span className="review-about">Ambiente de validação</span><AvisoDadosFicticios /></div>
    <div className="app-shell">
      <aside className="sidebar" role="presentation">
        <div className="brand"><span className="brand-mark" aria-hidden="true">◒</span><span>PsiqApp</span></div>
        <p className="workspace-label">Seu espaço de cuidado</p>
        <nav className="primary-nav" aria-label="Navegação principal">
          <NavLink to="/pacientes"><span aria-hidden="true">♧</span>Pacientes</NavLink>
          <NavLink to="/agenda"><span aria-hidden="true">□</span>Agenda</NavLink>
          <NavLink to="/prontuario"><span aria-hidden="true">▤</span>Prontuário</NavLink>
        </nav>
        <div className="sidebar-note"><strong>Ambiente de demonstração</strong><span>Explore com dados fictícios.<br />As alterações ficam no sistema local.</span></div>
        <div className="account"><span className="account-avatar">MD</span><span><strong>Médico demonstrativo</strong><small>Consultório particular</small></span></div>
      </aside>
      <div className="app-body">
        <header className="topbar"><div className="breadcrumb"><NavLink aria-label="Voltar à lista" to="/pacientes">Pacientes</NavLink><span aria-hidden="true">›</span><span>{contexto}</span></div><div className="topbar-tools"><NavLink className="search-button" to="/pacientes"><span aria-hidden="true">⌕</span>&nbsp; Encontrar paciente</NavLink><span className="demo-badge"><span aria-hidden="true">◉</span>&nbsp; Somente dados fictícios</span></div></header>
        <main id="conteudo" tabIndex={-1}><Rotas /></main>
        <footer className="page-footer"><span>Protótipo funcional com dados fictícios.</span><span>Foco clínico</span></footer>
      </div>
    </div>
  </>
}
