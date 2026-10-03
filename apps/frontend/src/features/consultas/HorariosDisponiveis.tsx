import { dataCompleta, horaAgenda } from './tempoAgenda'

export function HorariosDisponiveis({ data, horarios, selecionado, aoSelecionar, desabilitado = false }: {
  data: string, horarios: string[], selecionado: string, aoSelecionar: (hora: string) => void, desabilitado?: boolean,
}) {
  const grupos = ['Madrugada', 'Manhã', 'Tarde', 'Noite']
  const ordenados = [...new Set(horarios)].sort((a, b) => Date.parse(a) - Date.parse(b))
  return <section className="horarios-disponiveis" aria-label="Selecione um horário">
    <h3>{data ? dataCompleta(data) : 'Escolha uma data no calendário'}</h3>
    {!data && <p className="muted">Os horários livres aparecerão aqui.</p>}
    {data && !horarios.length && <p role="status">Não há mais horários livres nesta data. Escolha outra data.</p>}
    {grupos.map((grupo, indice) => {
      const opcoes = ordenados.filter(hora => Math.floor(Number(horaAgenda(hora).slice(0, 2)) / 6) === indice)
      return opcoes.length > 0 && <fieldset key={grupo} disabled={desabilitado}><legend>{grupo}</legend><div className="horarios-grade">
        {opcoes.map(hora => <label key={hora} className={selecionado === hora ? 'horario-selecionado' : ''}>
          <input type="radio" name="horario-consulta" value={hora} checked={selecionado === hora} onChange={() => aoSelecionar(hora)} />
          <span>{horaAgenda(hora)}</span>
        </label>)}
      </div></fieldset>
    })}
  </section>
}
