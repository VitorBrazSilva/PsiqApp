import { useState, type FormEvent } from 'react'
import { ErroApi } from '../../shared/api/erroApi'
import { dataHoraLocalParaApi, dataHoraParaInput } from './datasClinicas'
import { servicoRegistrosClinicos, type CriarRegistroClinicoResposta } from './servicoRegistrosClinicos'

interface Props {
  pacienteId: string
  originalId: string
  aoCancelar: () => void
  aoCriar: (resposta: CriarRegistroClinicoResposta) => void
}

export function FormularioComplemento({ pacienteId, originalId, aoCancelar, aoCriar }: Props) {
  const [texto, setTexto] = useState('')
  const [humor, setHumor] = useState('')
  const [medicamentos, setMedicamentos] = useState('')
  const [dataHoraClinica, setDataHoraClinica] = useState(dataHoraParaInput)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    if (!texto.trim()) {
      setErro('Informe o texto do complemento.')
      return
    }
    setEnviando(true)
    setErro('')
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
    <form className="formulario complemento-form" onSubmit={enviar} aria-label="Novo complemento">
      {erro && <p role="alert" className="erro">{erro}</p>}
      <label>Data e hora clínica<input type="datetime-local" value={dataHoraClinica} onChange={e => setDataHoraClinica(e.target.value)} /></label>
      <label>Texto do complemento<textarea value={texto} onChange={e => setTexto(e.target.value)} /></label>
      <label>Estado/humor<input value={humor} onChange={e => setHumor(e.target.value)} /></label>
      <label>Medicações em uso<input value={medicamentos} onChange={e => setMedicamentos(e.target.value)} /></label>
      <div className="acoes-linha">
        <button disabled={enviando}>{enviando ? 'Salvando...' : 'Salvar complemento'}</button>
        <button type="button" className="secundario" onClick={aoCancelar}>Cancelar</button>
      </div>
    </form>
  )
}
