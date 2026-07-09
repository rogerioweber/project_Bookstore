import { Funcionario } from '../models/Funcionario'
import { cadastrarFuncionario } from '../services/funcionarioService'
import { pedirTexto, pedirSenha } from '../utils/prompts'

async function funcionarioCadastroController(): Promise<Funcionario | null> {
  const nome = await pedirTexto('Nome:')
  const sobrenome = await pedirTexto('Sobrenome:')
  const usuario = await pedirTexto('Usuário:')
  const senha = await pedirSenha('Senha:')
  const confirmarSenha = await pedirSenha('Confirme a senha:')

  if (senha !== confirmarSenha) {
    console.log('As senhas não coincidem.')
    return null
  }

  try {
    const funcionario = await cadastrarFuncionario(
      nome,
      sobrenome,
      usuario,
      senha
    )
    console.log('Funcionário cadastrado com sucesso!')
    return funcionario
  } catch (error) {
    console.log((error as Error).message)
    return null
  }
}

export { funcionarioCadastroController }
