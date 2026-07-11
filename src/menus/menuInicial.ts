import { adminMenuController } from './adminMenuController'
import { loginMenuController } from './loginMenuController'
import { consultaPublicaController } from '../controllers/consultaPublicaController'
import { selecionarOpcao } from '../utils/prompts'

async function menuController(): Promise<boolean> {
  console.log('==============BOOKSTORE MANAGER CLI==============')

  const opcao = await selecionarOpcao('Escolha uma opção', [
    'Login',
    'Consultar',
    'Fechar programa'
  ] as const)

  switch (opcao) {
    case 'Login': {
      const funcionario = await loginMenuController()
      if (funcionario) {
        await adminMenuController(funcionario)
      }
      return true
    }
    case 'Consultar':
      await consultaPublicaController()
      return true
    case 'Fechar programa':
      return false
    default:
      console.log('Erro em algum momento')
      return false
  }
}

export { menuController }
