// Gerar uma vez por operação; reutilizar a mesma chave e payload ao repetir o envio.
export function chaveDeIdempotencia(): string {
  return crypto.randomUUID()
}
