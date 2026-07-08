import bcrypt from 'bcrypt'

import { Funcionario } from '../models/Funcionario'
import { funcionarioRepository } from '../repositories/funcionarioRepository'

async function cadastrarFuncionario(
  nome: string,
  sobrenome: string,
  usuario: string,
  senha: string
): Promise<Funcionario> {
  const senhaHash = await bcrypt.hash(senha, 10)
  return funcionarioRepository.criar(nome, sobrenome, usuario, senhaHash)
}

async function autenticarFuncionario(
  usuario: string,
  senha: string
): Promise<Funcionario | null> {
  const funcionario = await funcionarioRepository.buscarPorUsuario(usuario)

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
