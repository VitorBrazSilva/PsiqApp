import { useState, type FormEvent } from 'react'
import { ErroApi } from '../../shared/api/erroApi'
import { dataHoraLocalParaApi, dataHoraParaInput } from './datasClinicas'
import { servicoRegistrosClinicos, type CriarRegistroClinicoResposta } from './servicoRegistrosClinicos'

interface Props {
  pacienteId: string
  aoCriar: (resposta: CriarRegistroClinicoResposta) => void
}

export function FormularioParecer({ pacienteId, aoCriar }: Props) {
  const [texto, setTexto] = useState('')
  const [humor, setHumor] = useState('')
  const [medicamentos, setMedicamentos] = useState('')
  const [dataHoraClinica, setDataHoraClinica] = useState(dataHoraParaInput)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    if (!texto.trim()) {
      setErro('Informe o texto do parecer.')
      return
    }
    setEnviando(true)
    setErro('')
    try {
      const resposta = await servicoRegistrosClinicos.criarParecer(pacienteId, {
        texto: texto.trim(),
        humor: humor.trim() || null,
        medicamentos: medicamentos.trim() || null,
        dataHoraClinica: dataHoraLocalParaApi(dataHoraClinica),
        consultaId: null,
      })
      setTexto('')
      setHumor('')
      setMedicamentos('')
      setDataHoraClinica(dataHoraParaInput())
      aoCriar(resposta)
    } catch (falha) {
      setErro(falha instanceof ErroApi ? falha.message : 'Não foi possível salvar o parecer.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="formulario" onSubmit={enviar} aria-label="Novo parecer">
      <h2>Novo parecer</h2>
      {erro && <p role="alert" className="erro">{erro}</p>}
      <label>Data e hora clínica<input type="datetime-local" value={dataHoraClinica} onChange={e => setDataHoraClinica(e.target.value)} /></label>
      <label>Texto do parecer<textarea value={texto} onChange={e => setTexto(e.target.value)} /></label>
      <label>Estado/humor<input value={humor} onChange={e => setHumor(e.target.value)} /></label>
      <label>Medicações em uso<input value={medicamentos} onChange={e => setMedicamentos(e.target.value)} /></label>
      <button disabled={enviando}>{enviando ? 'Salvando...' : 'Salvar parecer'}</button>
    </form>
  )
}
