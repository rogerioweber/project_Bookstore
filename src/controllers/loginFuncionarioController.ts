import inquirer from 'inquirer'

import { Funcionario } from '../models/Funcionario'
import { autenticarFuncionario } from '../services/funcionarioService'

interface LoginFuncionarioPrompt {
  email: string
  senha: string
}

async function loginFuncionarioController(): Promise<Funcionario | null> {
  const { email, senha } = await inquirer.prompt<LoginFuncionarioPrompt>([
    { type: 'input', name: 'email', message: 'Email:' },
    { type: 'password', name: 'senha', message: 'Senha:', mask: '*' }
  ])

  const funcionario = await autenticarFuncionario(email, senha)

  if (!funcionario) {
    console.log('Email ou senha inválidos.')
    return null
  }

  console.log(`Bem-vindo, ${funcionario.nome}!`)
  return funcionario
}

export { loginFuncionarioController }
