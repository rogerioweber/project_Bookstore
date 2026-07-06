import inquirer from 'inquirer'

import { adminMenuController } from './adminMenuController'
import { authMenuController } from './authController'

async function menuController(): Promise<boolean> {
  console.log('==============BOOKSTORE==============')
  const resposta = await inquirer.prompt([
    {
      type: 'select',
      name: 'opcao',
      message: 'Escolha uma opção',
      choices: ['Login Administrador', 'Consultar', 'Fechar programa']
    }
  ])

  switch (resposta.opcao) {
    case 'Login Administrador': {
      const funcionario = await authMenuController()
      if (funcionario) {
        await adminMenuController(funcionario)
      }
      return true
    }
    case 'Consultar':
      return true
    case 'Fechar programa':
      return false
    default:
      console.log('Erro em algum momento')
      return false
  }
}

export { menuController }
