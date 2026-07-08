import inquirer from 'inquirer'

import { Funcionario } from '../models/Funcionario'
import { cadastrarFuncionario } from '../services/funcionarioService'

interface CadastroFuncionarioPrompt {
  nome: string
  sobrenome: string
  usuario: string
  senha: string
  confirmarSenha: string
}

async function cadastroFuncionarioController(): Promise<Funcionario | null> {
  const resposta = await inquirer.prompt<CadastroFuncionarioPrompt>([
    { type: 'input', name: 'nome', message: 'Nome:' },
    { type: 'input', name: 'sobrenome', message: 'Sobrenome:' },
    { type: 'input', name: 'usuario', message: 'Usuário:' },
    { type: 'password', name: 'senha', message: 'Senha:', mask: '*' },
    {
      type: 'password',
      name: 'confirmarSenha',
      message: 'Confirme a senha:',
      mask: '*'
    }
  ])

  if (resposta.senha !== resposta.confirmarSenha) {
    console.log('As senhas não coincidem.')
    return null
  }

  try {
    const funcionario = await cadastrarFuncionario(
      resposta.nome,
      resposta.sobrenome,
      resposta.usuario,
      resposta.senha
    )

    console.log('Funcionário cadastrado com sucesso!')
    return funcionario
  } catch {
    console.log('Erro ao cadastrar. O usuário já pode estar em uso.')
    return null
  }
}

export { cadastroFuncionarioController }
