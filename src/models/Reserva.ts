export type StatusReserva = 'ativa' | 'devolvida' | 'atrasada'

export interface Reserva {
  id: number
  livro_id: number
  funcionario_id: number
  funcionario_devolucao_id: number | null
  cliente_id: number
  data_reserva: string
  data_devolucao: string | null
  status: StatusReserva
}

export interface ReservaDetalhada extends Reserva {
  livro_titulo: string
  cliente_nome: string
  funcionario_emprestou_nome: string
  funcionario_devolveu_nome: string | null
}

export interface LivroEmprestadoResumo {
  livro_id: number
  livro_titulo: string
  total_exemplares: number
  exemplares_emprestados: number
}
