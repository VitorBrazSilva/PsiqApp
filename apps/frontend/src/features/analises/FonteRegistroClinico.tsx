import { ErroApi } from '../../shared/api/erroApi'
import { formatarDataClinica } from '../registros-clinicos/datasClinicas'
import { servicoRegistrosClinicos, type RegistroClinico } from '../registros-clinicos/servicoRegistrosClinicos'
import { useEffect, useState } from 'react'

export interface FonteSelecionada {
  registroId: string
  campo: 'TEXTO' | 'HUMOR' | 'MEDICAMENTOS'
  citacao: string
}

interface Props {
  pacienteId: string
  pacienteNome: string
  fonte: FonteSelecionada | null
  aoFechar: () => void
  aoVoltar: () => void
  aoAbrirNoHistorico: (registroId: string) => void
}

export function FonteRegistroClinico({ pacienteId, pacienteNome, fonte, aoFechar, aoVoltar, aoAbrirNoHistorico }: Props) {
  const [registro, setRegistro] = useState<RegistroClinico | null>(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!fonte) return
    const controle = new AbortController()
    servicoRegistrosClinicos.obter(pacienteId, fonte.registroId, controle.signal)
      .then(resposta => {
        setRegistro(resposta)
        setErro('')
      })
      .catch(falha => {
        if (falha instanceof DOMException) return
        setErro(falha instanceof ErroApi ? falha.message : 'Não foi possível abrir a fonte.')
      })
    return () => controle.abort()
  }, [pacienteId, fonte])

  if (!fonte) return null

  const realcar = (valor: string | null, campo: FonteSelecionada['campo']) => {
    if (!valor) return null
    if (campo !== fonte.campo || !fonte.citacao) return valor
    const partes = valor.split(fonte.citacao)
    return partes.flatMap((parte, indice) => indice === partes.length - 1 ? [parte] : [parte, <mark key={`${campo}-${indice}`}>{fonte.citacao}</mark>])
  }

  return (
    <dialog open className="dialog-fonte" aria-labelledby="titulo-fonte" onKeyDown={evento => { if (evento.key === 'Escape') { evento.preventDefault(); aoFechar() } }}>
      <div className="dialog-header">
        <h2 id="titulo-fonte">Registro de origem</h2>
        <button type="button" className="icon-button" aria-label="Fechar fonte da evidência" onClick={aoFechar}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button>
      </div>
      <div className="dialog-body">
        <button type="button" className="text-button source-back-link" onClick={aoVoltar}>Voltar às evidências desta observação</button>
        {erro && <p role="alert" className="erro">{erro}</p>}
        {!registro && !erro && <p>Carregando fonte...</p>}
      {registro && (
        <>
          <p className="section-intro">{pacienteNome} / Parecer de {formatarDataClinica(registro.dataHoraClinica)}</p>
          <h3>Texto original do médico</h3>
          <p className="source-full-text">{realcar(registro.texto, 'TEXTO')}</p>
          <dl className="details-grid">
            <div><dt>Estado/humor</dt><dd>{realcar(registro.humor, 'HUMOR') ?? 'Não informado'}</dd></div>
            <div><dt>Medicações em uso</dt><dd>{realcar(registro.medicamentos, 'MEDICAMENTOS') ?? 'Não informado'}</dd></div>
          </dl>
          <button type="button" className="text-button source-history-link" onClick={() => aoAbrirNoHistorico(registro.id)}>Abrir no histórico <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg></button>
        </>
      )}
      </div>
    </dialog>
  )
}
