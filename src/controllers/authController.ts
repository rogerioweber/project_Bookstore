import inquirer from 'inquirer'

import { cadastroFuncionarioController } from './cadastroFuncionarioController'
import { loginFuncionarioController } from './loginFuncionarioController'
import { Funcionario } from '../models/Funcionario'

interface AuthMenuPrompt {
  opcao: 'Entrar' | 'Cadastrar novo funcionário' | 'Voltar'
}

async function authMenuController(): Promise<Funcionario | null> {
  const { opcao } = await inquirer.prompt<AuthMenuPrompt>([
    {
      type: 'select',
      name: 'opcao',
      message: 'Login Administrador',
      choices: ['Entrar', 'Cadastrar novo funcionário', 'Voltar']
    }
  ])

  switch (opcao) {
    case 'Entrar':
      return await loginFuncionarioController()
    case 'Cadastrar novo funcionário':
      return await cadastroFuncionarioController()
    case 'Voltar':
      return null
    default:
      return null
  }
}

export { authMenuController }
