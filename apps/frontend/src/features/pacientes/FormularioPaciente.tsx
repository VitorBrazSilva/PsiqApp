import { useEffect, useRef, useState } from 'react'
import { errosDeCampo, mensagemErro, type ErrosFormulario } from '../../shared/formularios/errosDeCampo'
import { servicoPacientes, type CriarPaciente, type Paciente } from './servicoPacientes'
import { validarPaciente } from './validacaoPaciente'

const inicial: CriarPaciente = { nome: '', cpf: '', dataNascimento: '', telefone: '', email: '', queixaInicial: null }
const camposObrigatorios = [
  ['nome', 'patient-nome'],
  ['cpf', 'patient-cpf'],
  ['dataNascimento', 'patient-nascimento'],
  ['telefone', 'patient-telefone'],
  ['email', 'patient-email'],
] as const

export function FormularioPaciente({ aoCriar, aoCancelar }: { aoCriar: (paciente: Paciente) => void; aoCancelar: () => void }) {
  const [dados, setDados] = useState(inicial)
  const [erros, setErros] = useState<ErrosFormulario>({})
  const [erroGeral, setErroGeral] = useState('')
  const [salvando, setSalvando] = useState(false)
  const resumoErros = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (Object.keys(erros).length > 0) resumoErros.current?.focus()
  }, [erros])

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault()
    const validacao = validarPaciente(dados)
    setErros(validacao)
    setErroGeral('')
    if (Object.keys(validacao).length) return
    setSalvando(true)
    try {
      const paciente = await servicoPacientes.criar({ ...dados, queixaInicial: dados.queixaInicial?.trim() || null })
      setDados(inicial)
      aoCriar(paciente)
    } catch (erro) {
      setErros(errosDeCampo(erro))
      setErroGeral(mensagemErro(erro))
    } finally {
      setSalvando(false)
    }
  }

  function atualizar(campo: keyof CriarPaciente, valor: string) {
    setDados(atual => ({ ...atual, [campo]: campo === 'queixaInicial' ? valor || null : valor }))
  }

  function focarCampo(evento: React.MouseEvent<HTMLAnchorElement>, id: string) {
    evento.preventDefault()
    document.getElementById(id)?.focus()
  }

  return (
    <form className="formulario" onSubmit={enviar} noValidate>
      <div className="demo-note registration-note">Os dados abaixo identificam o paciente e seu prontuário.</div>
      {erroGeral && <p role="alert" className="erro">{erroGeral}</p>}
      <div id="registration-errors" ref={resumoErros} role="alert" tabIndex={-1} className="validation-summary" hidden={!Object.keys(erros).length}>
        <strong>Revise os campos indicados.</strong>
        <ul>{camposObrigatorios.filter(([campo]) => erros[campo]).map(([campo, id]) => <li key={campo}><a href={`#${id}`} onClick={evento => focarCampo(evento, id)}>{erros[campo]}</a></li>)}</ul>
      </div>
      <div className="registration-field"><label htmlFor="patient-nome" aria-label="Nome">Nome completo</label><input id="patient-nome" name="nome" autoComplete="name" autoFocus value={dados.nome} onChange={e => atualizar('nome', e.target.value)} aria-invalid={!!erros.nome} aria-describedby={erros.nome ? 'patient-nome-error' : undefined} />{erros.nome && <span id="patient-nome-error" className="erro-campo">{erros.nome}</span>}</div>
      <div className="grade-form">
        <div className="registration-field"><label htmlFor="patient-cpf">CPF</label><input id="patient-cpf" inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" value={dados.cpf} onChange={e => atualizar('cpf', e.target.value)} aria-invalid={!!erros.cpf} aria-describedby={erros.cpf ? 'patient-cpf-error' : undefined} />{erros.cpf && <span id="patient-cpf-error" className="erro-campo">{erros.cpf}</span>}</div>
        <div className="registration-field"><label htmlFor="patient-nascimento" aria-label="Nascimento">Data de nascimento</label><input id="patient-nascimento" type="date" autoComplete="bday" value={dados.dataNascimento} onChange={e => atualizar('dataNascimento', e.target.value)} aria-invalid={!!erros.dataNascimento} aria-describedby={erros.dataNascimento ? 'patient-nascimento-error' : undefined} />{erros.dataNascimento && <span id="patient-nascimento-error" className="erro-campo">{erros.dataNascimento}</span>}</div>
      </div>
      <div className="grade-form">
        <div className="registration-field"><label htmlFor="patient-telefone" aria-label="Telefone">Telefone com DDD</label><input id="patient-telefone" type="tel" autoComplete="tel" placeholder="(11) 90000-0000" value={dados.telefone} onChange={e => atualizar('telefone', e.target.value)} aria-invalid={!!erros.telefone} aria-describedby={erros.telefone ? 'patient-telefone-error' : undefined} />{erros.telefone && <span id="patient-telefone-error" className="erro-campo">{erros.telefone}</span>}</div>
        <div className="registration-field"><label htmlFor="patient-email">E-mail</label><input id="patient-email" type="email" autoComplete="email" spellCheck={false} placeholder="paciente@example.test" value={dados.email} onChange={e => atualizar('email', e.target.value)} aria-invalid={!!erros.email} aria-describedby={erros.email ? 'patient-email-error' : undefined} />{erros.email && <span id="patient-email-error" className="erro-campo">{erros.email}</span>}</div>
      </div>
      <label htmlFor="patient-queixa">Queixa inicial <span className="hint">Opcional</span><textarea id="patient-queixa" className="short-textarea" placeholder="Descreva o motivo inicial do acompanhamento…" value={dados.queixaInicial ?? ''} onChange={e => atualizar('queixaInicial', e.target.value)} /></label>
      <p className="hint">Nome, CPF, nascimento, telefone e e-mail são obrigatórios.</p>
      <div className="form-actions"><button type="button" className="secondary" onClick={aoCancelar}>Voltar à lista</button><button aria-label="Salvar paciente" className="primary" disabled={salvando}>{salvando ? 'Salvando...' : 'Cadastrar e abrir prontuário'}</button></div>
    </form>
  )
}
