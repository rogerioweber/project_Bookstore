import { Cliente, AtualizarClienteInput } from '../models/Cliente'
import * as clienteRepository from '../repositories/clienteRepository'

function validarCpf(cpf: string): string {
  const digitos = cpf.replace(/\D/g, '')
  if (digitos.length !== 11) {
    throw new Error('CPF inválido. Deve conter 11 dígitos.')
  }
  return digitos
}

function validarEmail(email: string): string {
  const emailTrimado = email.trim()
  if (!emailTrimado.includes('@')) throw new Error('Email inválido.')
  return emailTrimado
}
async function cadastrarCliente(
  nome: string,
  sobrenome: string,
  cpf: string,
  email: string,
  telefone: string
): Promise<Cliente> {
  const cpfLimpo = validarCpf(cpf)
  const emailValido = validarEmail(email)

  if (!nome.trim()) throw new Error('O nome é obrigatório')
  if (!sobrenome.trim()) throw new Error('O sobrenome é obrigatório')
  if (!telefone.trim()) throw new Error('O telefone é obrigatório')

  const existente = await clienteRepository.buscarPorCpf(cpfLimpo)
  if (existente) {
    throw new Error(
      `Já existe um cliente cadastrado com esse CPF: ${existente.nome} ${existente.sobrenome}`
    )
  }

  return clienteRepository.criar(
    nome.trim(),
    sobrenome.trim(),
    cpfLimpo,
    emailValido,
    telefone.trim()
  )
}

async function buscarClientePorCpf(cpf: string): Promise<Cliente | null> {
  const cpfLimpo = cpf.replace(/\D/g, '')
  return clienteRepository.buscarPorCpf(cpfLimpo)
}

async function buscarClientesPorNome(nome: string): Promise<Cliente[]> {
  return clienteRepository.buscarPorNomeParcial(nome)
}

async function atualizarCliente(
  id: number,
  dados: AtualizarClienteInput
): Promise<Cliente> {
  if (!dados.nome.trim()) throw new Error('O nome é obrigatório')
  if (!dados.sobrenome.trim()) throw new Error('O sobrenome é obrigatório')
  const emailValido = validarEmail(dados.email)
  if (!dados.telefone.trim()) throw new Error('O telefone é obrigatório')

  return clienteRepository.atualizar(id, { ...dados, email: emailValido })
}

async function removerCliente(id: number): Promise<boolean> {
  return clienteRepository.deletar(id)
}

async function listarClientes(): Promise<Cliente[]> {
  return clienteRepository.listarTodos()
}

export {
  cadastrarCliente,
  buscarClientePorCpf,
  buscarClientesPorNome,
  atualizarCliente,
  removerCliente,
  listarClientes
}
