// src/controllers/adminMenuController.ts
import inquirer from 'inquirer'

import { cadastroLivroController } from './cadastroLivroController'
import { Funcionario } from '../models/Funcionario'

interface AdminMenuPrompt {
  opcao:
    | 'Cadastrar livro'
    | 'Consultar livros'
    | 'Atualizar livro'
    | 'Remover livro'
    | 'Gerenciar empréstimos'
    | 'Relatórios'
    | 'Sair'
}

async function adminMenuController(funcionario: Funcionario): Promise<void> {
  let continuar = true

  while (continuar) {
    const { opcao } = await inquirer.prompt<AdminMenuPrompt>([
      {
        type: 'select',
        name: 'opcao',
        message: `Menu Administrador (${funcionario.nome})`,
        choices: [
          'Cadastrar livro',
          'Consultar livros',
          'Atualizar livro',
          'Remover livro',
          'Gerenciar empréstimos',
          'Relatórios',
          'Sair'
        ]
      }
    ])

    switch (opcao) {
      case 'Cadastrar livro':
        await cadastroLivroController()
        break
      case 'Sair':
        continuar = false
        break
      default:
        console.log(`Opção "${opcao}" ainda não implementada.`)
    }
  }
}

export { adminMenuController }
