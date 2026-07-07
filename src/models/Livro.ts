export type StatusLivro = 'disponivel' | 'indisponivel'

export interface Livro {
  id: number
  titulo: string
  total_exemplares: number
  status: StatusLivro
}

export interface CriarLivroInput {
  titulo: string
  totalExemplares: number
  autorIds: number[]
  categoriaIds: number[]
}
export interface LivroListagem {
  id: number
  titulo: string
  total_exemplares: number
  status: StatusLivro
  autores: string | null
  categorias: string | null
}

export interface LivroDetalhado extends Livro {
  autores: { id: number; nome: string }[]
  categorias: { id: number; nome: string }[]
}

export type OrdenarLivrosPor = 'titulo' | 'autor' | 'categoria'

export interface AtualizarLivroInput {
  titulo: string
  totalExemplares: number
  autorIds: number[]
  categoriaIds: number[]
}
