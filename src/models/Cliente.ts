export interface Cliente {
  id: number
  nome: string
  sobrenome: string
  cpf: string
  email: string
  telefone: string
}

export interface AtualizarClienteInput {
  nome: string
  sobrenome: string
  email: string
  telefone: string
}
