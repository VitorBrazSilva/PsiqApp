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
      <h2>Cadastrar paciente</h2>
      {erroGeral && <p role="alert" className="erro">{erroGeral}</p>}
      <label>Nome<input value={dados.nome} onChange={e => atualizar('nome', e.target.value)} /></label>
      {erros.nome && <span className="erro-campo">{erros.nome}</span>}
      <div className="grade-form">
        <label>CPF<input value={dados.cpf} onChange={e => atualizar('cpf', e.target.value)} /></label>
        <label>Nascimento<input type="date" value={dados.dataNascimento} onChange={e => atualizar('dataNascimento', e.target.value)} /></label>
      </div>
      {(erros.cpf || erros.dataNascimento) && <span className="erro-campo">{erros.cpf ?? erros.dataNascimento}</span>}
      <div className="grade-form">
        <label>Telefone<input value={dados.telefone} onChange={e => atualizar('telefone', e.target.value)} /></label>
        <label>E-mail<input value={dados.email} onChange={e => atualizar('email', e.target.value)} /></label>
      </div>
      {(erros.telefone || erros.email) && <span className="erro-campo">{erros.telefone ?? erros.email}</span>}
      <label>Queixa inicial<textarea value={dados.queixaInicial ?? ''} onChange={e => atualizar('queixaInicial', e.target.value)} /></label>
      <button disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar paciente'}</button>
    </form>
  )
}
