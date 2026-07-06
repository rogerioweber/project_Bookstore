export type StatusLivro = 'disponivel' | 'indisponivel'

export interface Livro {
  id: number
  titulo: string
  total_exemplares: number
  status: StatusLivro
}

// Usado nas telas de listagem (autores/categorias vêm concatenados numa string)
export interface LivroListagem {
  id: number
  titulo: string
  total_exemplares: number
  status: StatusLivro
  autores: string | null
  categorias: string | null
}

// Usado na tela de detalhe/edição (autores/categorias vêm como listas de objetos)
export interface LivroDetalhado extends Livro {
  autores: { id: number; nome: string }[]
  categorias: { id: number; nome: string }[]
}

export type OrdenarLivrosPor = 'titulo' | 'autor' | 'categoria'

export interface AtualizarLivroInput {
  titulo: string
  totalExemplares: number
  status: StatusLivro
  autorIds: number[]
  categoriaIds: number[]
}
