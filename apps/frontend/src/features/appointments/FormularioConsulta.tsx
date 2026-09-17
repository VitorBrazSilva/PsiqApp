import { useEffect, useState } from 'react'
import { errosDeCampo, mensagemErro, type ErrosFormulario } from '../../shared/formularios/errosDeCampo'
import { servicoPacientes, type Paciente } from '../patients/servicoPacientes'
import { paraIsoComOffset, validarConsulta } from './validacaoConsulta'
import { servicoConsultas, type Consulta } from './servicoConsultas'

export function FormularioConsulta({ pacienteFixoId, aoCriar }: { pacienteFixoId?: string, aoCriar: (consulta: Consulta) => void }) {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [pacienteSelecionadoId, setPacienteSelecionadoId] = useState('')
  const [dataHora, setDataHora] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [erros, setErros] = useState<ErrosFormulario>({})
  const [erroGeral, setErroGeral] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (pacienteFixoId) return
    servicoPacientes.buscar('', undefined, 100).then(pagina => setPacientes(Array.isArray(pagina.items) ? pagina.items : [])).catch(() => setPacientes([]))
  }, [pacienteFixoId])

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault()
    const pacienteId = pacienteFixoId ?? pacienteSelecionadoId
    const dados = { pacienteId, agendadaPara: paraIsoComOffset(dataHora), observacoes: observacoes.trim() || null }
    const validacao = validarConsulta(dados)
    setErros(validacao)
    setErroGeral('')
    if (Object.keys(validacao).length) return
    setSalvando(true)
    try {
      const consulta = await servicoConsultas.criar(dados)
      setDataHora('')
      setObservacoes('')
      aoCriar(consulta)
    } catch (erro) {
      setErros(errosDeCampo(erro))
      setErroGeral(mensagemErro(erro))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form className="formulario" onSubmit={enviar} noValidate>
      <h2>Nova consulta</h2>
      {erroGeral && <p role="alert" className="erro">{erroGeral}</p>}
      {!pacienteFixoId && (
        <label>Paciente
          <select value={pacienteSelecionadoId} onChange={e => setPacienteSelecionadoId(e.target.value)}>
            <option value="">Selecione</option>
            {pacientes.map(paciente => <option key={paciente.id} value={paciente.id}>{paciente.nome}</option>)}
          </select>
        </label>
      )}
      {erros.pacienteId && <span className="erro-campo">{erros.pacienteId}</span>}
      <label>Data e hora<input type="datetime-local" value={dataHora} onChange={e => setDataHora(e.target.value)} /></label>
      {erros.agendadaPara && <span className="erro-campo">{erros.agendadaPara}</span>}
      <label>Observações<textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} /></label>
      <button disabled={salvando}>{salvando ? 'Salvando...' : 'Criar consulta'}</button>
    </form>
  )
}
