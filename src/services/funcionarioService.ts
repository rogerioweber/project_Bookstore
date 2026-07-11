import bcrypt from 'bcrypt'

import { Funcionario } from '../models/Funcionario'
import { funcionarioRepository } from '../repositories/funcionarioRepository'

async function cadastrarFuncionario(
  nome: string,
  sobrenome: string,
  usuario: string,
  senha: string
): Promise<Funcionario> {
  if (!nome.trim()) throw new Error('O nome é obrigatório')
  if (!sobrenome.trim()) throw new Error('O sobrenome é obrigatório')
  if (!usuario.trim()) throw new Error('O usuário é obrigatório')
  if (!senha.trim()) throw new Error('A senha é obrigatória')
  if (senha.trim().length < 4) {
    throw new Error('A senha deve ter no mínimo 4 caracteres')
  }

  const senhaHash = await bcrypt.hash(senha, 10)
  return funcionarioRepository.criar(
    nome.trim(),
    sobrenome.trim(),
    usuario.trim(),
    senhaHash
  )
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
