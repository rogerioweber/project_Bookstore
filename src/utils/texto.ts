export function capitalizar(texto: string): string {
  const limpo = texto.trim().toLowerCase()
  return limpo.charAt(0).toUpperCase() + limpo.slice(1)
}
