import { funcionarioCadastroController } from '../controllers/funcionarioCadastroController'
import { funcionarioLoginController } from '../controllers/funcionarioLoginController'
import { Funcionario } from '../models/Funcionario'
import { selecionarOpcao } from '../utils/prompts'

async function loginMenuController(): Promise<Funcionario | null> {
  const opcao = await selecionarOpcao('Login Administrador', [
    'Entrar',
    'Cadastrar novo funcionário',
    'Voltar'
  ] as const)

  switch (opcao) {
    case 'Entrar':
      return await funcionarioLoginController()
    case 'Cadastrar novo funcionário':
      return await funcionarioCadastroController()
    case 'Voltar':
      return null
    default:
      return null
  }
}

export { loginMenuController }
