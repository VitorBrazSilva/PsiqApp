import type { GrupoAgendaConsulta } from './servicoConsultas'

const grupos: { id: GrupoAgendaConsulta, label: string }[] = [
  { id: 'PROXIMAS', label: 'Próximas' },
  { id: 'AGENDADAS_ANTERIORES', label: 'Agendadas anteriores' },
  { id: 'REALIZADAS', label: 'Realizadas' },
  { id: 'CANCELADAS', label: 'Canceladas' },
  { id: 'FALTAS', label: 'Faltas' },
]

export function FiltrosConsultas({ grupo, contagens, selecionarGrupo, dataInicial, setDataInicial, dataFinal, setDataFinal,
  erroPeriodo, aplicarPeriodo, limparPeriodo }: {
  grupo: GrupoAgendaConsulta, contagens: Record<GrupoAgendaConsulta, number>, selecionarGrupo: (grupo: GrupoAgendaConsulta) => void,
  dataInicial: string, setDataInicial: (valor: string) => void, dataFinal: string, setDataFinal: (valor: string) => void,
  erroPeriodo: string, aplicarPeriodo: () => void, limparPeriodo: () => void
}) {
  return <div className="filtros-consultas">
    <nav className="grupos-consultas" aria-label="Grupos de consultas">
      {grupos.map(item => <button key={item.id} type="button" aria-pressed={grupo === item.id} onClick={() => selecionarGrupo(item.id)}>
        {item.label} <span className="count">{contagens[item.id] ?? 0}</span>
      </button>)}
    </nav>
    <div className="periodo-consultas">
      <label>Data inicial<input type="date" value={dataInicial} aria-invalid={!!erroPeriodo} aria-describedby={erroPeriodo ? 'erro-periodo-consultas' : undefined} onChange={evento => setDataInicial(evento.target.value)} /></label>
      <label>Data final<input type="date" value={dataFinal} aria-invalid={!!erroPeriodo} aria-describedby={erroPeriodo ? 'erro-periodo-consultas' : undefined} onChange={evento => setDataFinal(evento.target.value)} /></label>
      <button type="button" className="secondary" onClick={aplicarPeriodo}>Aplicar período</button>
      <button type="button" className="secondary" onClick={limparPeriodo}>Limpar período</button>
      {erroPeriodo && <p id="erro-periodo-consultas" className="erro" role="alert">{erroPeriodo}</p>}
    </div>
  </div>
}
