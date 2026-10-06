import type { Paciente } from './servicoPacientes'

export function DadosPaciente({ paciente }: { paciente: Paciente }) {
  return (
    <section className="section-panel dados-paciente" aria-labelledby="titulo-dados-paciente">
      <h2 id="titulo-dados-paciente">Dados pessoais</h2>
      <dl className="details-grid">
        <div><dt>Nome</dt><dd>{paciente.nome}</dd></div>
        <div><dt>CPF</dt><dd>{paciente.cpf}</dd></div>
        <div><dt>Nascimento</dt><dd>{formatarData(paciente.dataNascimento)}</dd></div>
        <div><dt>Telefone</dt><dd>{paciente.telefone}</dd></div>
        <div><dt>E-mail</dt><dd>{paciente.email}</dd></div>
        <div><dt>Queixa inicial</dt><dd>{paciente.queixaInicial || 'Não informada'}</dd></div>
      </dl>
    </section>
  )
}

function formatarData(valor: string) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${valor}T00:00:00Z`))
}
