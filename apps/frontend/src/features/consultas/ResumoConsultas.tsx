import { formatarDataHoraConsulta } from './formatacaoConsulta'
import { rotuloStatus } from './servicoConsultas'
import type { ResumoConsultasPaciente } from './useResumoConsultas'

export function ResumoConsultas({ resumo, erro, aoTentarNovamente }: {
  resumo: ResumoConsultasPaciente | null
  erro: boolean
  aoTentarNovamente: () => void
}) {
  return <aside className="painel resumo-consultas" aria-labelledby="titulo-resumo-consultas">
    <h2 id="titulo-resumo-consultas"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20V10h3v10M11 20V4h3v16M17 20v-7h3v7" /></svg>Resumo das consultas</h2>
    {erro ? <div><p className="erro" role="alert">Não foi possível carregar o resumo das consultas.</p><button className="text-button" type="button" onClick={aoTentarNovamente}>Tentar novamente</button></div>
      : !resumo ? <p className="estado" role="status">Carregando resumo…</p>
        : <dl aria-live="polite">
          <div><dt>Total de consultas</dt><dd className="resumo-consultas-total"><data value={resumo.total}>{new Intl.NumberFormat('pt-BR').format(resumo.total)}</data></dd></div>
          {[
            { titulo: 'Próxima consulta', consulta: resumo.proxima, vazio: 'Nenhuma consulta agendada.' },
            { titulo: 'Última consulta realizada', consulta: resumo.ultimaRealizada, vazio: 'Nenhuma consulta realizada.' },
          ].map(({ titulo, consulta, vazio }) => <div key={titulo}>
            <dt>{titulo}</dt>
            <dd>{consulta ? <>
              <time dateTime={consulta.agendadaPara}>{formatarDataHoraConsulta(consulta.agendadaPara)}</time>
              <span className={`consulta-status status-${consulta.status.toLowerCase()}`}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" />{consulta.status === 'AGENDADA' ? <path d="M12 7v5l3 2" /> : <path d="m8 12 3 3 5-6" />}</svg>
                {rotuloStatus(consulta.status)}
              </span>
            </> : <span className="resumo-consultas-vazio">{vazio}</span>}</dd>
          </div>)}
        </dl>}
  </aside>
}
