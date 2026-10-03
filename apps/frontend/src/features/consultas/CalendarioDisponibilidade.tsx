import type { DisponibilidadeMensal } from './servicoConsultas'
import { dataCompleta, deslocarMes } from './tempoAgenda'

export function CalendarioDisponibilidade({ mes, hoje, dias, selecionada, aoSelecionar, aoMudarMes, desabilitado = false }: {
  mes: string, hoje: string, dias: DisponibilidadeMensal['dias'], selecionada: string,
  aoSelecionar: (data: string) => void, aoMudarMes: (mes: string) => void, desabilitado?: boolean,
}) {
  const [ano, numero] = mes.split('-').map(Number)
  const primeiro = new Date(Date.UTC(ano, numero - 1, 1))
  const quantidade = new Date(Date.UTC(ano, numero, 0)).getUTCDate()
  const celulas = Array.from({ length: Math.ceil((primeiro.getUTCDay() + quantidade) / 7) * 7 }, (_, indice) => {
    const dia = indice - primeiro.getUTCDay() + 1
    return dia >= 1 && dia <= quantidade ? `${mes}-${String(dia).padStart(2, '0')}` : null
  })
  const titulo = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(primeiro)
  return <section className="calendario-disponibilidade" aria-label="Selecione uma data">
    <div className="calendario-cabecalho">
      <button className="secondary" type="button" aria-label="Mês anterior" disabled={desabilitado || mes <= hoje.slice(0, 7)} onClick={() => aoMudarMes(deslocarMes(mes, -1))}>‹</button>
      <h3>{titulo}</h3>
      <button className="secondary" type="button" aria-label="Próximo mês" disabled={desabilitado} onClick={() => aoMudarMes(deslocarMes(mes, 1))}>›</button>
    </div>
    <table><caption className="sr-only">{titulo}: datas disponíveis para consulta</caption>
      <thead><tr>{['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map(dia => <th scope="col" key={dia}><abbr title={dia}>{dia.slice(0, 3)}</abbr></th>)}</tr></thead>
      <tbody>{Array.from({ length: celulas.length / 7 }, (_, semana) => <tr key={semana}>{celulas.slice(semana * 7, semana * 7 + 7).map((data, coluna) => {
        const livre = !!data && dias.some(dia => dia.data === data && dia.horarios.length > 0)
        return <td key={coluna}>{data && <button type="button" disabled={desabilitado || data < hoje || !livre} aria-pressed={selecionada === data}
          aria-label={`${dataCompleta(data)} — ${data < hoje ? 'data passada' : livre ? 'horários disponíveis' : 'sem horários'}`}
          onClick={() => aoSelecionar(data)}>{Number(data.slice(-2))}{livre && <span className="sr-only"> disponível</span>}</button>}</td>
      })}</tr>)}</tbody>
    </table>
    <p className="calendario-ajuda">Selecione uma data com horários livres. Consultas de uma hora, em São Paulo.</p>
  </section>
}
