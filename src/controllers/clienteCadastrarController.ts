import { cadastrarCliente } from '../services/clienteService'
import { pedirTexto } from '../utils/prompts'

async function clienteCadastrarController(): Promise<void> {
  const nome = await pedirTexto('Nome:')
  const sobrenome = await pedirTexto('Sobrenome:')
  const cpf = await pedirTexto('CPF (somente números):')
  const email = await pedirTexto('Email:')
  const telefone = await pedirTexto('Telefone:')

  try {
    const cliente = await cadastrarCliente(
      nome,
      sobrenome,
      cpf,
      email,
      telefone
    )
    console.log(
      `Cliente "${cliente.nome} ${cliente.sobrenome}" cadastrado com sucesso!`
    )
  } catch (error) {
    console.log((error as Error).message)
  }
}

export { clienteCadastrarController }
