import { EstadoVazio } from '../../shared/componentes/EstadoVazio'

export function PaginaAgenda() {
  return (
    <section className="painel">
      <p className="etiqueta">Área em preparação</p>
      <h1>Agenda</h1>
      <p>A organização de consultas estará disponível em uma próxima etapa.</p>
      <EstadoVazio mensagem="O agendamento ainda não está disponível nesta versão." />
    </section>
  )
}
