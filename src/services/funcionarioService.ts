import bcrypt from 'bcrypt'

import { Funcionario } from '../models/Funcionario'
import { funcionarioRepository } from '../repositories/funcionarioRepository'

async function cadastrarFuncionario(
  nome: string,
  sobrenome: string,
  email: string,
  senha: string
): Promise<Funcionario> {
  const senhaHash = await bcrypt.hash(senha, 10)
  return funcionarioRepository.criar(nome, sobrenome, email, senhaHash)
}

async function autenticarFuncionario(
  email: string,
  senha: string
): Promise<Funcionario | null> {
  const funcionario = await funcionarioRepository.buscarPorEmail(email)

  if (!funcionario) {
    return null
  }

  const senhaValida = await bcrypt.compare(senha, funcionario.senha)

  if (!senhaValida) {
    return null
  }

  return funcionario
}

export { cadastrarFuncionario, autenticarFuncionario }
