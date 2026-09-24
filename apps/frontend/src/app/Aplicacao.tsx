import { NavLink, useLocation } from 'react-router'
import { AvisoDadosFicticios } from '../shared/componentes/AvisoDadosFicticios'
import { Rotas } from './rotas'

function Icon({ type }: { type: 'people' | 'calendar' }) {
  const paths = { people: <><path d="M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 4 18.5V20M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm6-6v6m3-3h-6" /></>, calendar: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></> }
  return <svg className="nav-svg" viewBox="0 0 24 24" aria-hidden="true">{paths[type]}</svg>
}

export function Aplicacao() {
  const location = useLocation()
  const agenda = location.pathname === '/agenda'
  const prontuario = location.pathname.startsWith('/prontuario/')
  const contexto = agenda ? 'Agenda' : prontuario ? 'Prontuário' : 'Todos os pacientes'
  return <>
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <div className="review-bar" aria-label="Comparação de propostas"><div className="review-label"><span className="review-dot" />Direção A escolhida <span className="review-stage">/ PsiqApp</span></div><div className="direction-picker" role="group" aria-label="Direção visual"><button type="button" className="direction-active" aria-pressed="true"><span>A</span> Foco clínico</button><button type="button" aria-pressed="false"><span>B</span> Referência anterior</button></div><button className="review-about" type="button" onClick={() => window.alert('A direção A é a referência visual escolhida para o frontend funcional.')}>Sobre o protótipo <span aria-hidden="true">↗</span></button><AvisoDadosFicticios /></div>
    <div className="app-shell">
      <div className="sidebar"><div className="brand"><span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20 4C12 4 6 7 6 14c0 3 2 5 5 5 7 0 9-7 9-15Z"/><path d="M5 20c3-5 7-8 12-10"/></svg></span><span>PsiqApp</span></div><p className="workspace-label">Seu espaço de cuidado</p>
        <nav className="primary-nav" aria-label="Navegação principal"><NavLink aria-label="Pacientes" to="/pacientes"><Icon type="people" />Pacientes <span className="nav-count">1</span></NavLink><NavLink to="/agenda"><Icon type="calendar" />Agenda</NavLink><NavLink className="sr-only" to="/prontuario">Prontuário</NavLink></nav>
        <div className="sidebar-note"><strong>Ambiente de demonstração</strong><span>Explore com dados fictícios.<br />As alterações duram apenas até recarregar a página.</span></div><div className="account"><span className="account-avatar">MD</span><span><strong>Médico demonstrativo</strong><small>Consultório particular</small></span></div>
      </div>
      <div className="app-body"><header className="topbar"><div className="breadcrumb">{agenda || prontuario ? <NavLink to="/pacientes">Pacientes</NavLink> : <span>Pacientes</span>}<span aria-hidden="true">›</span><span>{contexto}</span></div><div className="topbar-tools"><NavLink className="search-button" to="/pacientes">⌕&nbsp; Encontrar paciente</NavLink><span className="demo-badge">◉&nbsp; Somente dados fictícios</span></div></header><main id="conteudo" tabIndex={-1}><Rotas /></main><footer className="page-footer"><span>Protótipo navegável. Nenhum dado é enviado ou salvo no servidor.</span><span>A / Foco clínico</span></footer></div>
    </div>
  </>
}
