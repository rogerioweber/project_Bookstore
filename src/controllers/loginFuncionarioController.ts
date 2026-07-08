import inquirer from 'inquirer'

import { Funcionario } from '../models/Funcionario'
import { autenticarFuncionario } from '../services/funcionarioService'

interface LoginFuncionarioPrompt {
  usuario: string
  senha: string
}

async function loginFuncionarioController(): Promise<Funcionario | null> {
  const { usuario, senha } = await inquirer.prompt<LoginFuncionarioPrompt>([
    { type: 'input', name: 'usuario', message: 'Usuário:' },
    { type: 'password', name: 'senha', message: 'Senha:', mask: '*' }
  ])

  const funcionario = await autenticarFuncionario(usuario, senha)

  if (!funcionario) {
    console.log('Usuário ou senha inválidos.')
    return null
  }

  console.log(`Bem-vindo, ${funcionario.nome}!`)
  return funcionario
}

export { loginFuncionarioController }
