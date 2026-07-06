import inquirer from 'inquirer'

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

    if (opcao === 'Sair') {
      continuar = false
    } else {
      console.log(`Opção "${opcao}" ainda não implementada.`)
    }
  }
}

export { adminMenuController }
