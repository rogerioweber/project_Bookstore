import inquirer from 'inquirer'

import { cadastrarCliente } from '../services/clienteService'

async function cadastroClienteController(): Promise<void> {
  const resposta = await inquirer.prompt<{
    nome: string
    sobrenome: string
    cpf: string
    email: string
  }>([
    { type: 'input', name: 'nome', message: 'Nome:' },
    { type: 'input', name: 'sobrenome', message: 'Sobrenome:' },
    {
      type: 'input',
      name: 'cpf',
      message: 'CPF (somente números ou com pontuação):'
    },
    { type: 'input', name: 'email', message: 'Email (opcional):' }
  ])

  try {
    const usuario = await cadastrarCliente(
      resposta.nome,
      resposta.sobrenome,
      resposta.cpf,
      resposta.email.trim() || null
    )
    console.log(
      `Cliente "${usuario.nome} ${usuario.sobrenome}" cadastrado com sucesso! (id: ${String(usuario.id)})`
    )
  } catch (error) {
    console.log((error as Error).message)
  }
}

export { cadastroClienteController }
