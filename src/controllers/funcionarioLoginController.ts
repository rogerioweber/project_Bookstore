import { Funcionario } from '../models/Funcionario'
import { autenticarFuncionario } from '../services/funcionarioService'
import { pedirTexto, pedirSenha } from '../utils/prompts'

async function funcionarioLoginController(): Promise<Funcionario | null> {
  const usuario = await pedirTexto('Usuário:')
  const senha = await pedirSenha('Senha:')

  const funcionario = await autenticarFuncionario(usuario, senha)

  if (!funcionario) {
    console.log('Usuário ou senha inválidos.')
    return null
  }

  console.log(`Bem-vindo, ${funcionario.nome}!`)
  return funcionario
}

export { funcionarioLoginController }
