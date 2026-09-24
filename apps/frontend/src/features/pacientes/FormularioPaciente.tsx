import { useState } from 'react'
import { errosDeCampo, mensagemErro, type ErrosFormulario } from '../../shared/formularios/errosDeCampo'
import { servicoPacientes, type CriarPaciente, type Paciente } from './servicoPacientes'
import { validarPaciente } from './validacaoPaciente'

const inicial: CriarPaciente = { nome: '', cpf: '', dataNascimento: '', telefone: '', email: '', queixaInicial: null }

export function FormularioPaciente({ aoCriar }: { aoCriar: (paciente: Paciente) => void }) {
  const [dados, setDados] = useState(inicial)
  const [erros, setErros] = useState<ErrosFormulario>({})
  const [erroGeral, setErroGeral] = useState('')
  const [salvando, setSalvando] = useState(false)

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

  return (
    <form className="formulario" onSubmit={enviar} noValidate>
      <div className="demo-note">Use apenas dados fictícios. Este cadastro é uma simulação local.</div>
      <div className="registration-intro"><p>Os dados abaixo identificam o paciente e seu prontuário.</p><button type="button" className="link-botao" onClick={() => setDados({ nome: 'Helena Duarte', cpf: '529.982.247-25', dataNascimento: '1992-03-18', telefone: '(11) 90000-0000', email: 'helena.ficticia@example.test', queixaInicial: 'Dificuldade para dormir e mudanças na rotina.' })}>Preencher exemplo fictício</button></div>
      {erroGeral && <p role="alert" className="erro">{erroGeral}</p>}
      <label htmlFor="patient-nome" aria-label="Nome">Nome completo<input id="patient-nome" name="nome" autoComplete="name" autoFocus value={dados.nome} onChange={e => atualizar('nome', e.target.value)} aria-invalid={!!erros.nome} aria-describedby="patient-nome-error" /></label>
      {erros.nome && <span id="patient-nome-error" className="erro-campo">{erros.nome}</span>}
      <div className="grade-form">
        <label htmlFor="patient-cpf">CPF<input id="patient-cpf" inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" value={dados.cpf} onChange={e => atualizar('cpf', e.target.value)} aria-invalid={!!erros.cpf} aria-describedby="patient-cpf-error" /></label>
        <label htmlFor="patient-nascimento" aria-label="Nascimento">Data de nascimento<input id="patient-nascimento" type="date" autoComplete="bday" value={dados.dataNascimento} onChange={e => atualizar('dataNascimento', e.target.value)} aria-invalid={!!erros.dataNascimento} aria-describedby="patient-nascimento-error" /></label>
      </div>
      {erros.cpf && <span id="patient-cpf-error" className="erro-campo">{erros.cpf}</span>}{erros.dataNascimento && <span id="patient-nascimento-error" className="erro-campo">{erros.dataNascimento}</span>}
      <div className="grade-form">
        <label htmlFor="patient-telefone" aria-label="Telefone">Telefone com DDD<input id="patient-telefone" type="tel" autoComplete="tel" placeholder="(11) 90000-0000" value={dados.telefone} onChange={e => atualizar('telefone', e.target.value)} aria-invalid={!!erros.telefone} aria-describedby="patient-telefone-error" /></label>
        <label htmlFor="patient-email">E-mail<input id="patient-email" type="email" autoComplete="email" spellCheck={false} placeholder="paciente@example.test" value={dados.email} onChange={e => atualizar('email', e.target.value)} aria-invalid={!!erros.email} aria-describedby="patient-email-error" /></label>
      </div>
      {erros.telefone && <span id="patient-telefone-error" className="erro-campo">{erros.telefone}</span>}{erros.email && <span id="patient-email-error" className="erro-campo">{erros.email}</span>}
      <label htmlFor="patient-queixa">Queixa inicial <span className="hint">Opcional</span><textarea id="patient-queixa" className="short-textarea" placeholder="Descreva o motivo inicial do acompanhamento…" value={dados.queixaInicial ?? ''} onChange={e => atualizar('queixaInicial', e.target.value)} /></label>
      <p className="hint">Nome, CPF, nascimento, telefone e e-mail são obrigatórios.</p>
      <div className="form-actions"><button type="button" className="secondary" onClick={() => setDados(inicial)}>Voltar à lista</button><button aria-label="Salvar paciente" className="primary" disabled={salvando}>{salvando ? 'Salvando...' : 'Cadastrar e abrir prontuário'}</button></div>
    </form>
  )
}
