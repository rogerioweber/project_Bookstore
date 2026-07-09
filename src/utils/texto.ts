export function capitalizar(texto: string): string {
  const limpo = texto.trim().toLowerCase()
  return limpo.charAt(0).toUpperCase() + limpo.slice(1)
}

export function obterIniciais(nomeCompleto: string): string {
  return nomeCompleto
    .trim()
    .split(/\s+/)
    .map((parte) => `${parte.charAt(0).toUpperCase()}.`)
    .join(' ')
}
