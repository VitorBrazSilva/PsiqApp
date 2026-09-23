export class ControleRespostaObsoleta {
  private versao = 0

  novaConsulta() { return ++this.versao }
  aindaVigente(versao: number) { return versao === this.versao }
}
