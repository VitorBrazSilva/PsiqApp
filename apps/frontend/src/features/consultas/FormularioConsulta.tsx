import { useEffect, useRef, useState } from 'react'
import { ErroApi } from '../../shared/api/erroApi'
import { errosDeCampo, mensagemErro, type ErrosFormulario } from '../../shared/formularios/errosDeCampo'
import { servicoPacientes, type Paciente } from '../pacientes/servicoPacientes'
import { paraIsoComOffset, validarConsulta } from './validacaoConsulta'
import { servicoConsultas, type Consulta } from './servicoConsultas'
import {
  servicoGoogleAgenda,
  type EstadoConexaoGoogleAgenda,
  type EstadoDisponibilidadeGoogleAgenda,
} from './servicoGoogleAgenda'

type EstadoVerificacao = EstadoDisponibilidadeGoogleAgenda | 'NAO_VERIFICADA' | 'VERIFICANDO'

const mensagensDisponibilidade: Record<EstadoVerificacao, string> = {
  NAO_VERIFICADA: 'Verifique a disponibilidade antes de criar a consulta.',
  VERIFICANDO: 'Verificando a disponibilidade no PsiqApp e no Google Agenda...',
  DISPONIVEL: 'Este horário está disponível para agendamento.',
  OCUPADO: 'Este horário já está ocupado. Escolha outra data ou horário e verifique novamente.',
  INDISPONIVEL: 'Não foi possível verificar a agenda. Tente novamente; a consulta não pode ser criada enquanto a verificação estiver indisponível.',
}

export function FormularioConsulta({
  pacienteFixoId,
  pacienteNome,
  aoCriar,
  emDialogo = false,
  aoCancelar,
  exigirDisponibilidade = false,
  estadoIntegracao = null,
  usarApiReal = false,
}: {
  pacienteFixoId?: string
  pacienteNome?: string
  aoCriar: (consulta: Consulta) => void
  emDialogo?: boolean
  aoCancelar?: () => void
  exigirDisponibilidade?: boolean
  estadoIntegracao?: EstadoConexaoGoogleAgenda | 'CARREGANDO' | null
  usarApiReal?: boolean
}) {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [pacienteSelecionadoId, setPacienteSelecionadoId] = useState('')
  const [dataHora, setDataHora] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [erros, setErros] = useState<ErrosFormulario>({})
  const [erroGeral, setErroGeral] = useState('')
  const [erroPacientes, setErroPacientes] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [estadoDisponibilidade, setEstadoDisponibilidade] = useState<EstadoVerificacao>('NAO_VERIFICADA')
  const [dataHoraVerificada, setDataHoraVerificada] = useState('')
  const [conexaoVerificada, setConexaoVerificada] = useState<EstadoConexaoGoogleAgenda | 'CARREGANDO' | null>(null)
  const resumoErros = useRef<HTMLDivElement>(null)
  const requisicaoDisponibilidade = useRef<AbortController | null>(null)

  useEffect(() => {
    if (pacienteFixoId) return
    const controlador = new AbortController()
    servicoPacientes.buscar('', controlador.signal, 100, 0, { usarApiReal })
      .then(pagina => setPacientes(Array.isArray(pagina.itens) ? pagina.itens : []))
      .catch(() => {
        if (!controlador.signal.aborted) setErroPacientes('Não foi possível carregar os pacientes. Atualize a página e tente novamente.')
      })
    return () => controlador.abort()
  }, [pacienteFixoId, usarApiReal])

  useEffect(() => {
    requisicaoDisponibilidade.current?.abort()
  }, [estadoIntegracao])

  useEffect(() => () => requisicaoDisponibilidade.current?.abort(), [])

  useEffect(() => {
    if (Object.keys(erros).length > 1) resumoErros.current?.focus()
  }, [erros])

  const verificacaoValida = estadoDisponibilidade === 'DISPONIVEL'
    && dataHoraVerificada === dataHora
    && conexaoVerificada === estadoIntegracao
    && estadoIntegracao !== 'CARREGANDO'
  const disponibilidadeVisivel = conexaoVerificada !== estadoIntegracao && estadoDisponibilidade !== 'NAO_VERIFICADA'
    ? 'NAO_VERIFICADA'
    : estadoDisponibilidade
  const podeCriar = !salvando && (!exigirDisponibilidade || verificacaoValida)

  function alterarDataHora(valor: string) {
    requisicaoDisponibilidade.current?.abort()
    setDataHora(valor)
    setEstadoDisponibilidade('NAO_VERIFICADA')
    setDataHoraVerificada('')
    setConexaoVerificada(null)
    setErros(atuais => {
      const novos = { ...atuais }
      delete novos.agendadaPara
      return novos
    })
    setErroGeral('')
  }

  async function verificarDisponibilidade() {
    if (estadoIntegracao === 'CARREGANDO') return
    if (!dataHora || !paraIsoComOffset(dataHora)) {
      setErros(atuais => ({ ...atuais, agendadaPara: 'Informe uma data e hora válidas.' }))
      setEstadoDisponibilidade('NAO_VERIFICADA')
      setDataHoraVerificada('')
      return
    }

    requisicaoDisponibilidade.current?.abort()
    const controlador = new AbortController()
    requisicaoDisponibilidade.current = controlador
    const dataHoraCandidata = dataHora
    setEstadoDisponibilidade('VERIFICANDO')
    setDataHoraVerificada('')
    setConexaoVerificada(estadoIntegracao)
    setErroGeral('')
    try {
      const resposta = await servicoGoogleAgenda.verificarDisponibilidade(paraIsoComOffset(dataHoraCandidata), controlador.signal)
      if (controlador.signal.aborted) return
      setEstadoDisponibilidade(resposta.estado)
      setDataHoraVerificada(resposta.estado === 'DISPONIVEL' ? dataHoraCandidata : '')
      setConexaoVerificada(estadoIntegracao)
    } catch (erro) {
      if (controlador.signal.aborted || (erro instanceof DOMException && erro.name === 'AbortError')) return
      setEstadoDisponibilidade(erro instanceof ErroApi && erro.status === 409 ? 'OCUPADO' : 'INDISPONIVEL')
      setDataHoraVerificada('')
      setConexaoVerificada(estadoIntegracao)
    }
  }

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault()
    const pacienteId = pacienteFixoId ?? pacienteSelecionadoId
    const dados = { pacienteId, agendadaPara: paraIsoComOffset(dataHora), observacoes: observacoes.trim() || null }
    const validacao = validarConsulta(dados)
    setErros(validacao)
    setErroGeral('')
    if (Object.keys(validacao).length) return
    if (exigirDisponibilidade && !verificacaoValida) {
      setErroGeral('Verifique novamente a disponibilidade desta data e hora antes de criar a consulta.')
      return
    }

    setSalvando(true)
    try {
      const consulta = await servicoConsultas.criar(dados, { usarApiReal })
      setDataHora('')
      setObservacoes('')
      setEstadoDisponibilidade('NAO_VERIFICADA')
      setDataHoraVerificada('')
      setConexaoVerificada(null)
      aoCriar(consulta)
    } catch (erro) {
      if (erro instanceof ErroApi && erro.status === 409) {
        setEstadoDisponibilidade('OCUPADO')
        setDataHoraVerificada('')
        setConexaoVerificada(estadoIntegracao)
        setErroGeral('Este horário deixou de estar disponível. Verifique novamente antes de criar a consulta.')
      } else if (erro instanceof ErroApi && erro.codigo === 'GOOGLE_DISPONIBILIDADE_INDISPONIVEL') {
        setEstadoDisponibilidade('INDISPONIVEL')
        setDataHoraVerificada('')
        setConexaoVerificada(estadoIntegracao)
        setErroGeral('Não foi possível consultar o Google Agenda. Tente verificar a disponibilidade novamente.')
      } else {
        setErros(errosDeCampo(erro))
        setErroGeral(mensagemErro(erro))
      }
    } finally {
      setSalvando(false)
    }
  }

  const quantidadeErros = Object.keys(erros).length
  const textoDisponibilidade = mensagensDisponibilidade[disponibilidadeVisivel]

  return (
    <form className="formulario" onSubmit={enviar} noValidate aria-busy={salvando}>
      {!emDialogo && <h2>Nova consulta</h2>}
      {emDialogo && pacienteFixoId && <div className="form-context">{pacienteNome ?? 'Paciente'} / Paciente fictício</div>}
      {quantidadeErros > 1 && (
        <div className="google-agenda-resumo-erros erro" role="alert" tabIndex={-1} ref={resumoErros}>
          <strong>Revise os campos abaixo:</strong>
          <ul>
            {erros.pacienteId && <li><a href="#agenda-paciente">Paciente: {erros.pacienteId}</a></li>}
            {erros.agendadaPara && <li><a href="#agenda-data-hora">Data e hora: {erros.agendadaPara}</a></li>}
          </ul>
        </div>
      )}
      {erroGeral && <p role="alert" className="erro">{erroGeral}</p>}
      {erroPacientes && <p role="alert" className="erro">{erroPacientes}</p>}

      {!pacienteFixoId && (
        <label htmlFor="agenda-paciente">Paciente
          <select
            id="agenda-paciente"
            required
            disabled={salvando}
            value={pacienteSelecionadoId}
            aria-invalid={!!erros.pacienteId}
            aria-describedby={erros.pacienteId ? 'agenda-paciente-erro' : undefined}
            onChange={evento => {
              setPacienteSelecionadoId(evento.target.value)
              setErros(atuais => { const novos = { ...atuais }; delete novos.pacienteId; return novos })
            }}
          >
            <option value="">Selecione</option>
            {pacientes.map(paciente => <option key={paciente.id} value={paciente.id}>{paciente.nome}</option>)}
          </select>
        </label>
      )}
      {erros.pacienteId && <span id="agenda-paciente-erro" className="erro-campo" role={quantidadeErros <= 1 ? 'alert' : undefined}>{erros.pacienteId}</span>}

      <label htmlFor="agenda-data-hora">Data e hora
        <input
          id="agenda-data-hora"
          type="datetime-local"
          required
          disabled={salvando}
          value={dataHora}
          aria-invalid={!!erros.agendadaPara || estadoDisponibilidade === 'OCUPADO'}
          aria-describedby={[
            exigirDisponibilidade ? 'disponibilidade-consulta-mensagem' : '',
            erros.agendadaPara ? 'agenda-data-hora-erro' : '',
          ].filter(Boolean).join(' ') || undefined}
          onChange={evento => alterarDataHora(evento.target.value)}
        />
      </label>
      {erros.agendadaPara && <span id="agenda-data-hora-erro" className="erro-campo" role={quantidadeErros <= 1 ? 'alert' : undefined}>{erros.agendadaPara}</span>}
      {exigirDisponibilidade && (
        <div className="google-agenda-verificacao" aria-busy={disponibilidadeVisivel === 'VERIFICANDO'}>
          <button
            className="secondary google-agenda-verificar"
            type="button"
            onClick={() => void verificarDisponibilidade()}
            disabled={!dataHora || salvando || disponibilidadeVisivel === 'VERIFICANDO' || estadoIntegracao === 'CARREGANDO'}
          >
            {disponibilidadeVisivel === 'VERIFICANDO' ? 'Verificando...' : 'Verificar disponibilidade'}
          </button>
          <p
            id="disponibilidade-consulta-mensagem"
            className={`google-agenda-mensagem-disponibilidade disponibilidade-${disponibilidadeVisivel.toLowerCase()}`}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {textoDisponibilidade}
          </p>
        </div>
      )}

      <label htmlFor="agenda-observacoes">Observações
        <textarea id="agenda-observacoes" value={observacoes} disabled={salvando} onChange={evento => setObservacoes(evento.target.value)} />
      </label>
      <div className="form-actions">
        {emDialogo && <button type="button" className="secondary" onClick={aoCancelar}>Cancelar</button>}
        <button className="primary" disabled={!podeCriar}>
          {salvando ? 'Salvando...' : emDialogo ? 'Agendar consulta' : 'Criar consulta'}
        </button>
      </div>
    </form>
  )
}
