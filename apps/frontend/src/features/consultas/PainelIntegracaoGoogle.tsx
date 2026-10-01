import {
  URL_CONECTAR_GOOGLE_AGENDA,
  type EstadoConexaoGoogleAgenda,
} from './servicoGoogleAgenda'

const rotulosEstado: Record<EstadoConexaoGoogleAgenda, string> = {
  NAO_CONFIGURADA: 'Não configurada neste ambiente',
  NAO_CONECTADA: 'Não conectada',
  DESCONECTADA: 'Desconectada',
  CONECTADA: 'Conectada',
  INDISPONIVEL: 'Indisponível',
}

const mensagensEstado: Record<EstadoConexaoGoogleAgenda, string> = {
  NAO_CONFIGURADA: 'A integração não está configurada neste ambiente. Você pode continuar usando a disponibilidade local do PsiqApp.',
  NAO_CONECTADA: 'Sua agenda continua disponível no PsiqApp. Ao conectar uma conta, os novos horários também serão verificados no Google Agenda.',
  DESCONECTADA: 'A agenda continua disponível no PsiqApp. Eventos Google já criados permanecem no calendário sem novas atualizações do PsiqApp.',
  CONECTADA: 'A conexão está ativa. A disponibilidade Google será consultada antes de criar uma nova consulta.',
  INDISPONIVEL: 'Não foi possível consultar o Google Agenda. Novos agendamentos aguardam uma verificação válida da agenda.',
}

export function PainelIntegracaoGoogle({
  estado,
  carregando,
  ocupada,
  erro,
  mensagemResultado,
  aoDesconectar,
}: {
  estado: EstadoConexaoGoogleAgenda | null
  carregando: boolean
  ocupada: boolean
  erro: string
  mensagemResultado: { texto: string, tipo: 'sucesso' | 'erro' } | null
  aoDesconectar: () => void
}) {
  const statusTexto = carregando || !estado
    ? 'Consultando o estado da conexão Google...'
    : `Google Agenda: ${rotulosEstado[estado]}. ${mensagensEstado[estado]}`

  return (
    <section className="section-panel google-agenda-painel" aria-labelledby="google-agenda-titulo" aria-busy={carregando || ocupada}>
      <div className="google-agenda-cabecalho">
        <div>
          <h2 id="google-agenda-titulo">Google Agenda</h2>
          <p className="google-agenda-resumo" role="status" aria-live="polite" aria-atomic="true">
            {statusTexto}
          </p>
        </div>
        {estado && <span className={`google-agenda-selo google-agenda-${estado.toLowerCase()}`}>{rotulosEstado[estado]}</span>}
      </div>

      <p className="google-agenda-divulgacao">
        Antes de conectar: cada evento criado pelo PsiqApp inclui o nome, o e-mail e o horário da consulta. Quando marcada como realizada ou falta, o evento identifica esse estado final. Não inclui conteúdo clínico.
        A visibilidade segue as permissões de compartilhamento da sua agenda Google. Desconectar não remove eventos já criados.
      </p>

      {mensagemResultado && (
        <p className={mensagemResultado.tipo === 'erro' ? 'google-agenda-feedback erro' : 'google-agenda-feedback'}
          role={mensagemResultado.tipo === 'erro' ? 'alert' : 'status'}>
          {mensagemResultado.texto}
        </p>
      )}
      {erro && <p className="google-agenda-feedback erro" role="alert">{erro}</p>}

      <div className="google-agenda-acoes">
        {(estado === 'NAO_CONECTADA' || estado === 'DESCONECTADA') && (
          <a className="primary google-agenda-acao" href={URL_CONECTAR_GOOGLE_AGENDA}>
            {estado === 'DESCONECTADA' ? 'Conectar novamente' : 'Conectar conta Google'}
          </a>
        )}
        {estado === 'INDISPONIVEL' && (
          <a className="primary google-agenda-acao" href={URL_CONECTAR_GOOGLE_AGENDA}>Reconectar conta Google</a>
        )}
        {estado === 'CONECTADA' && (
          <button className="secondary google-agenda-acao" type="button" onClick={aoDesconectar} disabled={ocupada}>
            {ocupada ? 'Desconectando...' : 'Desconectar Google Agenda'}
          </button>
        )}
        {estado === 'NAO_CONFIGURADA' && (
          <p className="google-agenda-ajuda">A conexão pode ser ativada quando o ambiente receber a configuração OAuth.</p>
        )}
      </div>
    </section>
  )
}
