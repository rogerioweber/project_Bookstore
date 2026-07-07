export interface Autor {
  id: number
  nome: string
}

export interface AutorComQuantidadeLivros {
  autor_id: number
  autor_nome: string
  quantidade_livros: number
}
