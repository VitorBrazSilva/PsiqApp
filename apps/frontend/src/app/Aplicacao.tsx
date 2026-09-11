import { NavLink } from 'react-router'
import { AvisoDadosFicticios } from '../shared/componentes/AvisoDadosFicticios'
import { Rotas } from './rotas'

export function Aplicacao() {
  return (
    <>
      <a className="pular-conteudo" href="#conteudo">Pular para o conteúdo</a>
      <AvisoDadosFicticios />
      <header className="cabecalho">
        <div className="marca">PsiqApp <span>Ambiente de validação</span></div>
        <nav aria-label="Navegação principal">
          <NavLink to="/pacientes">Pacientes</NavLink>
          <NavLink to="/agenda">Agenda</NavLink>
          <NavLink to="/prontuario">Prontuário</NavLink>
        </nav>
      </header>
      <main id="conteudo" tabIndex={-1}><Rotas /></main>
      <footer>Uso local · Validação com dados fictícios</footer>
    </>
  )
}
