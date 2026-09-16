import type { CriarPaciente } from './servicoPacientes'

export function validarCpf(cpf: string) {
  const digitos = cpf.replace(/\D/g, '')
  if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) return false
  const calcular = (tamanho: number) => {
    const soma = digitos.slice(0, tamanho).split('')
      .reduce((total, valor, indice) => total + Number(valor) * (tamanho + 1 - indice), 0)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }
  return calcular(9) === Number(digitos[9]) && calcular(10) === Number(digitos[10])
}

export function validarPaciente(dados: CriarPaciente) {
  const erros: Record<string, string> = {}
  if (!dados.nome.trim()) erros.nome = 'Informe o nome.'
  if (!validarCpf(dados.cpf)) erros.cpf = 'Informe um CPF valido.'
  if (!dados.dataNascimento) erros.dataNascimento = 'Informe a data de nascimento.'
  else if (new Date(`${dados.dataNascimento}T00:00:00`) > new Date()) erros.dataNascimento = 'Nascimento não pode estar no futuro.'
  if (!/^\S+@\S+\.\S+$/.test(dados.email.trim())) erros.email = 'Informe um e-mail valido.'
  const telefone = dados.telefone.replace(/\D/g, '')
  const telefoneNacional = telefone.startsWith('55') ? telefone.slice(2) : telefone
  if (!(telefoneNacional.length === 10 || telefoneNacional.length === 11)) erros.telefone = 'Informe telefone brasileiro com DDD.'
  return erros
}
