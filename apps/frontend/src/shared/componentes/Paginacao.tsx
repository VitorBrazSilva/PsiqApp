interface Props { pagina: number; tamanho: number; total: number; aoMudar: (pagina: number) => void }

export function Paginacao({ pagina, tamanho, total, aoMudar }: Props) {
  const paginas = Math.max(1, Math.ceil(total / Math.max(tamanho, 1)))
  if (paginas <= 1) return null
  return <nav className="paginacao" aria-label="Paginação">
    <span>Página {pagina + 1} de {paginas}</span>
    <div>
      <button type="button" className="secundario" disabled={pagina === 0} onClick={() => aoMudar(pagina - 1)}>Anterior</button>
      <button type="button" className="secundario" disabled={pagina >= paginas - 1} onClick={() => aoMudar(pagina + 1)}>Próxima</button>
    </div>
  </nav>
}
