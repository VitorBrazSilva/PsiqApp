import { EstadoVazio } from '../../shared/componentes/EstadoVazio'

export function PaginaProntuario() {
  return (
    <section className="painel">
      <p className="etiqueta">Área em preparação</p>
      <h1>Prontuário</h1>
      <p>Os registros clínicos estarão disponíveis em uma próxima etapa.</p>
      <EstadoVazio mensagem="Nenhum prontuário pode ser consultado nesta versão." />
    </section>
  )
}
