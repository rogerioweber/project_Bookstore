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

export interface ConsultarClienteMenuPrompt {
  opcao:
    'Listar todos os clientes' | 'Buscar por nome' | 'Buscar por CPF' | 'Voltar'
}
