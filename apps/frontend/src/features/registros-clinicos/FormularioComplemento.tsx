import { useState, type FormEvent } from 'react'
import { ErroApi } from '../../shared/api/erroApi'
import { dataHoraLocalParaApi, dataHoraParaInput, formatarDataClinica } from './datasClinicas'
import { servicoRegistrosClinicos, type CriarRegistroClinicoResposta } from './servicoRegistrosClinicos'

interface Props {
  pacienteId: string
  originalId: string
  pacienteNome: string
  dataParecerOriginal: string
  aoCancelar: () => void
  aoCriar: (resposta: CriarRegistroClinicoResposta) => void
}

export function FormularioComplemento({ pacienteId, originalId, pacienteNome, dataParecerOriginal, aoCancelar, aoCriar }: Props) {
  const [texto, setTexto] = useState('')
  const [humor, setHumor] = useState('')
  const [medicamentos, setMedicamentos] = useState('')
  const [dataHoraClinica, setDataHoraClinica] = useState(dataHoraParaInput)
  const [erro, setErro] = useState('')
  const [campoInvalido, setCampoInvalido] = useState<'texto' | 'data' | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    if (!texto.trim()) {
      setErro('Informe o texto do complemento.')
      setCampoInvalido('texto')
      evento.currentTarget.querySelector<HTMLTextAreaElement>('textarea')?.focus()
      return
    }
    if (!dataHoraClinica) {
      setErro('Informe a data e a hora clínica.')
      setCampoInvalido('data')
      evento.currentTarget.querySelector<HTMLInputElement>('input[type="datetime-local"]')?.focus()
      return
    }
    setEnviando(true)
    setErro('')
    setCampoInvalido(null)
    try {
      const resposta = await servicoRegistrosClinicos.criarComplemento(pacienteId, originalId, {
        texto: texto.trim(),
        humor: humor.trim() || null,
        medicamentos: medicamentos.trim() || null,
        dataHoraClinica: dataHoraLocalParaApi(dataHoraClinica),
        consultaId: null,
      })
      aoCriar(resposta)
    } catch (falha) {
      setErro(falha instanceof ErroApi ? falha.message : 'Não foi possível salvar o complemento.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="formulario complemento-form" onSubmit={enviar} aria-label="Novo complemento" noValidate>
      <div className="form-context">{pacienteNome}<br /><span className="hint">Complemento do parecer de {formatarDataClinica(dataParecerOriginal)}. O original será preservado.</span></div>
      {erro && <p id="complemento-erro" role="alert" className="erro">{erro}</p>}
      <label>Data e hora clínica<input type="datetime-local" value={dataHoraClinica} onChange={e => { setDataHoraClinica(e.target.value); if (campoInvalido === 'data') { setCampoInvalido(null); setErro('') } }} required aria-invalid={campoInvalido === 'data'} aria-describedby={`complemento-data-hint${campoInvalido === 'data' ? ' complemento-erro' : ''}`} /><span className="hint" id="complemento-data-hint">Pode corresponder a um atendimento anterior. Horário de Brasília.</span></label>
      <label>Texto do complemento <span className="hint">Obrigatório</span><textarea value={texto} onChange={e => { setTexto(e.target.value); if (campoInvalido === 'texto') { setCampoInvalido(null); setErro('') } }} required aria-invalid={campoInvalido === 'texto'} aria-describedby={campoInvalido === 'texto' ? 'complemento-erro' : undefined} placeholder="Registre o complemento clínico…" /></label>
      <div className="form-grid"><label>Estado/humor <span className="hint">Opcional</span><input value={humor} onChange={e => setHumor(e.target.value)} /></label>
      <label>Medicações em uso <span className="hint">Opcional</span><input value={medicamentos} onChange={e => setMedicamentos(e.target.value)} /></label></div>
      <div className="form-actions">
        <button type="button" className="secondary" onClick={aoCancelar}>Voltar ao prontuário</button>
        <button type="submit" className="primary" disabled={enviando}>{enviando ? 'Salvando…' : 'Salvar complemento'}</button>
      </div>
    </form>
  )
}
