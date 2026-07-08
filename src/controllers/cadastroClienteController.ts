import inquirer from 'inquirer'

import { cadastrarCliente } from '../services/clienteService'

async function cadastroClienteController(): Promise<void> {
  const resposta = await inquirer.prompt<{
    nome: string
    sobrenome: string
    cpf: string
    email: string
    telefone: string
  }>([
    { type: 'input', name: 'nome', message: 'Nome:' },
    { type: 'input', name: 'sobrenome', message: 'Sobrenome:' },
    {
      type: 'input',
      name: 'cpf',
      message: 'CPF (somente números):'
    },
    { type: 'input', name: 'email', message: 'Email:' },
    { type: 'input', name: 'telefone', message: 'Telefone:' }
  ])

  try {
    const cliente = await cadastrarCliente(
      resposta.nome,
      resposta.sobrenome,
      resposta.cpf,
      resposta.email,
      resposta.telefone
    )
    console.log(
      `Cliente "${cliente.nome} ${cliente.sobrenome}" cadastrado com sucesso!`
    )
  } catch (error) {
    console.log((error as Error).message)
    return
  }
}

export { cadastroClienteController }
