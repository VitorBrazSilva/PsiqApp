import { EstadoVazio } from '../../shared/componentes/EstadoVazio'

export function PaginaPacientes() {
  return (
    <section className="painel">
      <p className="etiqueta">Área em preparação</p>
      <h1>Pacientes</h1>
      <p>O cadastro e a busca de pacientes estarão disponíveis em uma próxima etapa.</p>
      <EstadoVazio mensagem="Ainda não há cadastro disponível nesta versão." />
    </section>
  )
}
