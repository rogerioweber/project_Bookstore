// src/controllers/adminMenuController.ts
import inquirer from 'inquirer'

import { cadastroClienteController } from '../controllers/cadastroClienteController'
import { cadastroLivroController } from '../controllers/cadastroLivroController'
import { consultarClienteController } from '../controllers/consultarClienteController'
import { consultarLivroController } from '../controllers/consultarLivroController'
import { emprestimoMenuController } from '../controllers/emprestimoController'
import { Funcionario } from '../models/Funcionario'

interface AdminMenuPrompt {
  opcao:
    | 'Cadastrar livro'
    | 'Consultar livros'
    | 'Cadastrar cliente'
    | 'Consultar clientes'
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
          'Cadastrar cliente',
          'Consultar clientes',
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
      case 'Consultar livros':
        await consultarLivroController()
        break
      case 'Cadastrar cliente':
        await cadastroClienteController()
        break
      case 'Consultar clientes':
        await consultarClienteController()
        break
      case 'Gerenciar empréstimos':
        await emprestimoMenuController(funcionario)
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
