import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { servicoPacientes } from '../features/pacientes/servicoPacientes'
import { Rotas } from './rotas'

function Icon({ type }: { type: 'people' | 'calendar' }) {
  const paths = {
    people: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18M8 15h2M14 15h2" /></>,
  }
  return <svg className="nav-svg" viewBox="0 0 24 24" aria-hidden="true">{paths[type]}</svg>
}

function SearchIcon() {
  return <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
}

export function Aplicacao() {
  const location = useLocation()
  const agenda = location.pathname === '/agenda'
  const prontuario = location.pathname.startsWith('/prontuario/')
  const contexto = agenda ? 'Agenda' : prontuario ? 'Prontuário' : 'Todos os pacientes'
  const [totalPacientes, setTotalPacientes] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    servicoPacientes.buscar('', controller.signal, 1, 0)
      .then(page => setTotalPacientes(page.total))
      .catch(() => { if (!controller.signal.aborted) setTotalPacientes(0) })
    return () => controller.abort()
  }, [location.pathname])

  useEffect(() => {
    const atualizarTotal = () => {
      servicoPacientes.buscar('', undefined, 1, 0).then(page => setTotalPacientes(page.total)).catch(() => undefined)
    }
    window.addEventListener('pacientes:atualizados', atualizarTotal)
    return () => window.removeEventListener('pacientes:atualizados', atualizarTotal)
  }, [])

  function focarBusca() {
    if (location.pathname !== '/pacientes') {
      window.location.assign('/pacientes')
      return
    }
    document.querySelector<HTMLInputElement>('.patients-page input[type="search"]')?.focus()
  }

  return <>
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <div className="review-bar" aria-label="Direção visual"><div className="review-label"><span className="review-dot" />Direção escolhida <span className="review-stage">/ PsiqApp</span></div><span className="review-about">Sobre o protótipo <span aria-hidden="true">↗</span></span></div>
    <div className="app-shell">
      <div className="sidebar">
        <div className="brand"><svg className="brand-mark" viewBox="0 0 36 40" aria-hidden="true"><path d="M18 34V9M18 23C5 23 5 7 5 7s13 0 13 16ZM18 29c13 0 13-18 13-18S18 11 18 29Z" /></svg><span>PsiqApp</span></div>
        <p className="workspace-label">Seu espaço de cuidado</p>
        <nav className="primary-nav" aria-label="Navegação principal">
          <NavLink aria-label="Pacientes" to="/pacientes"><Icon type="people" />Pacientes <span className="nav-count">{totalPacientes}</span></NavLink>
          <NavLink to="/agenda"><Icon type="calendar" />Agenda</NavLink>
          <NavLink className="sr-only" to="/prontuario">Prontuário</NavLink>
        </nav>
        <div className="sidebar-divider" aria-hidden="true" />
        <div className="account"><span className="account-avatar">MD</span><span><strong>Médico demonstrativo</strong><small>Consultório particular</small></span></div>
      </div>
      <div className="app-body">
        <header className="topbar">
          <div className="breadcrumb">{agenda || prontuario ? <NavLink to="/pacientes">Pacientes</NavLink> : <span>Pacientes</span>}<span aria-hidden="true">›</span><span>{contexto}</span></div>
          <div className="topbar-tools">
            <button className="search-button" type="button" onClick={focarBusca}><SearchIcon /><span>Encontrar paciente</span></button>
          </div>
        </header>
        <main id="conteudo" tabIndex={-1}><Rotas /></main>
        <footer className="page-footer"><span>Ambiente de demonstração. Use somente dados fictícios.</span><span>A / Foco clínico</span></footer>
      </div>
    </div>
  </>
}
