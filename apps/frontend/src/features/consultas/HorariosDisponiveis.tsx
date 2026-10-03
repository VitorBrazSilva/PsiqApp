import { dataCompleta, horaAgenda, horarioExibidoNaBusca } from './tempoAgenda'
import { IconeAgendamento } from './IconeAgendamento'

export function HorariosDisponiveis({ data, horarios, selecionado, aoSelecionar, desabilitado = false }: {
  data: string, horarios: string[], selecionado: string, aoSelecionar: (hora: string) => void, desabilitado?: boolean,
}) {
  const grupos = [
    { nome: 'Manhã', icone: 'manha', periodo: 1 },
    { nome: 'Tarde', icone: 'tarde', periodo: 2 },
    { nome: 'Noite', icone: 'noite', periodo: 3 },
  ] as const
  const ordenados = [...new Set(horarios)].filter(horarioExibidoNaBusca).sort((a, b) => Date.parse(a) - Date.parse(b))
  return <section className="horarios-disponiveis" aria-label="Selecione um horário">
    <h3><IconeAgendamento nome="calendario" /><span>{data ? dataCompleta(data) : 'Escolha uma data no calendário'}</span></h3>
    {!data && <p className="muted">Os horários livres aparecerão aqui.</p>}
    {data && !ordenados.length && <p role="status">Não há mais horários livres nesta data. Escolha outra data.</p>}
    {grupos.map(grupo => {
      const opcoes = ordenados.filter(hora => Math.floor(Number(horaAgenda(hora).slice(0, 2)) / 6) === grupo.periodo)
      return opcoes.length > 0 && <fieldset key={grupo.nome} disabled={desabilitado}><legend><span className="horarios-periodo"><IconeAgendamento nome={grupo.icone} className={`periodo-${grupo.icone}`} />{grupo.nome}</span></legend><div className="horarios-grade">
        {opcoes.map(hora => <label key={hora} className={selecionado === hora ? 'horario-selecionado' : ''}>
          <input type="radio" name="horario-consulta" value={hora} checked={selecionado === hora} onChange={() => aoSelecionar(hora)} />
          <span>{horaAgenda(hora)}</span>
        </label>)}
      </div></fieldset>
    })}
  </section>
}
