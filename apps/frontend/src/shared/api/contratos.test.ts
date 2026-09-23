import { describe, expect, it } from 'vitest'
import { ControleRespostaObsoleta } from './controleResposta'
import { normalizarPagina, normalizarSequencia } from './contratos'

describe('contratos compartilhados', () => {
  it('preserva campos evolutivos e normaliza página', () => {
    const pagina = normalizarPagina<{ id: string }>({ itens: [{ id: '1' }], pagina: 2, tamanho: 1, total: 3, campoNovo: 'preservado' })
    expect(pagina).toMatchObject({ pagina: 2, total: 3, campoNovo: 'preservado' })
  })
  it('aceita o nome legado da sequência somente na borda', () => {
    expect(normalizarSequencia({ sequenciaRequisicao: 4 })).toMatchObject({ sequenciaRequest: 4 })
  })
  it('identifica resposta anterior sem descartá-la silenciosamente no chamador', () => {
    const controle = new ControleRespostaObsoleta()
    const primeira = controle.novaConsulta()
    const segunda = controle.novaConsulta()
    expect(controle.aindaVigente(primeira)).toBe(false)
    expect(controle.aindaVigente(segunda)).toBe(true)
  })
})
