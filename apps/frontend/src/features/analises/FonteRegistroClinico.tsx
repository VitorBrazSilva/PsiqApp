import { ErroApi } from '../../shared/api/erroApi'
import { formatarDataHora } from '../registros-clinicos/datasClinicas'
import { servicoRegistrosClinicos, type RegistroClinico } from '../registros-clinicos/servicoRegistrosClinicos'
import { useEffect, useState } from 'react'

interface Props {
  pacienteId: string
  registroId: string | null
  aoFechar: () => void
}

export function FonteRegistroClinico({ pacienteId, registroId, aoFechar }: Props) {
  const [registro, setRegistro] = useState<RegistroClinico | null>(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!registroId) return
    const controle = new AbortController()
    servicoRegistrosClinicos.obter(pacienteId, registroId, controle.signal)
      .then(resposta => {
        setRegistro(resposta)
        setErro('')
      })
      .catch(falha => {
        if (falha instanceof DOMException) return
        setErro(falha instanceof ErroApi ? falha.message : 'Não foi possível abrir a fonte.')
      })
    return () => controle.abort()
  }, [pacienteId, registroId])

  if (!registroId) return null
  return (
    <section className="fonte-registro" aria-label="Fonte da evidência">
      <div className="registro-cabecalho">
        <h3>Fonte da evidência</h3>
        <button type="button" className="secundario" onClick={aoFechar}>Fechar</button>
      </div>
      {erro && <p role="alert" className="erro">{erro}</p>}
      {!registro && !erro && <p>Carregando fonte...</p>}
      {registro && (
        <>
          <p className="etiqueta">{formatarDataHora(registro.dataHoraClinica)} · criado em {formatarDataHora(registro.criadoEm)}</p>
          <p>{registro.texto}</p>
          {registro.humor && <p><strong>Estado/humor:</strong> {registro.humor}</p>}
          {registro.medicamentos && <p><strong>Medicações:</strong> {registro.medicamentos}</p>}
        </>
      )}
    </section>
  )
}
