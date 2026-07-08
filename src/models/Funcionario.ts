export interface Funcionario {
  id: number
  nome: string
  sobrenome: string
  email: string
  senha: string
}

export interface CadastroFuncionario {
  nome: string
  sobrenome: string
  usuario: string
  senha: string
  confirmarSenha: string
}

export interface LoginFuncionario {
  usuario: string
  senha: string
}
