export interface Cliente {
  id: number
  nome: string
  sobrenome: string
  cpf: string | null
  email: string
  telefone: string
  anonimizado: boolean
}
export interface AtualizarClienteInput {
  nome: string
  sobrenome: string
  email: string
  telefone: string
}

export interface ClienteComEmprestimoAtivo {
  cliente_id: number
  cliente_nome: string
  cliente_cpf: string
  livro_titulo: string
  data_reserva: string
  data_devolucao: string | null
  data_prevista_devolucao: string
  status: string
}
