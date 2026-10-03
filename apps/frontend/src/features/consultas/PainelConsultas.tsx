import { useEffect } from 'react'
import { Paginacao } from '../../shared/componentes/Paginacao'
import { ListaConsultas } from './ListaConsultas'
import { FiltrosConsultas } from './FiltrosConsultas'
import { useAgendaConsultas } from './useAgendaConsultas'

export function PainelConsultas({ pacienteId, nomesPacientes, versaoAtualizacao = 0 }: { pacienteId?: string, nomesPacientes?: Record<string, string>, versaoAtualizacao?: number }) {
  const agenda = useAgendaConsultas(pacienteId)
  const { recarregar } = agenda
  useEffect(() => { if (versaoAtualizacao > 0) void recarregar(0) }, [versaoAtualizacao, recarregar])
  const contagens = agenda.resultado?.contagens ?? { PROXIMAS: 0, AGENDADAS_ANTERIORES: 0, REALIZADAS: 0, CANCELADAS: 0, FALTAS: 0 }
  return <section className="painel-consultas">
    <FiltrosConsultas grupo={agenda.grupo} contagens={contagens} selecionarGrupo={agenda.selecionarGrupo}
      dataInicial={agenda.dataInicialEditada} setDataInicial={agenda.setDataInicialEditada}
      dataFinal={agenda.dataFinalEditada} setDataFinal={agenda.setDataFinalEditada}
      erroPeriodo={agenda.erroPeriodo} aplicarPeriodo={agenda.aplicarPeriodo} limparPeriodo={agenda.limparPeriodo} />
    {agenda.erro && <p role="alert" className="erro">{agenda.erro} <button type="button" onClick={() => void agenda.recarregar()}>Tentar novamente</button></p>}
    <div aria-live="polite" aria-busy={agenda.carregando}>
      <ListaConsultas consultas={agenda.resultado?.itens ?? []} carregando={agenda.carregando}
        aoAtualizar={agenda.aoAtualizar} nomesPacientes={nomesPacientes} usarApiReal />
    </div>
    <Paginacao pagina={agenda.pagina} tamanho={agenda.resultado?.tamanho ?? 50} total={agenda.resultado?.total ?? 0} aoMudar={agenda.setPagina} />
  </section>
}
