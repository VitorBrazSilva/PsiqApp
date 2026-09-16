import type { Paciente } from './servicoPacientes'

export function DadosPaciente({ paciente }: { paciente: Paciente }) {
  return (
    <section className="bloco">
      <h2>Dados do paciente</h2>
      <dl className="dados">
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
