import { autorController } from '../controllers/autorController'
import { clienteCadastrarController } from '../controllers/clienteCadastrarController'
import { clienteConsultarController } from '../controllers/clienteConsultarController'
import { emprestimoMenuController } from '../controllers/emprestimoController'
import { livroCadastroController } from '../controllers/livroCadastroController'
import { livroConsultarController } from '../controllers/livroConsultarController'
import { relatorioMenuController } from '../controllers/relatorioController'
import { Funcionario } from '../models/Funcionario'
import { selecionarOpcao } from '../utils/prompts'

async function adminMenuController(funcionario: Funcionario): Promise<void> {
  for (;;) {
    const opcao = await selecionarOpcao(
      `Menu Administrador (${funcionario.nome})`,
      [
        'Gerenciar autores',
        'Gerenciar livros',
        'Gerenciar clientes',
        'Gerenciar empréstimos',
        'Relatórios',
        'Sair'
      ] as const
    )

    if (opcao === 'Sair') break

    if (opcao === 'Gerenciar autores') await autorController()
    if (opcao === 'Gerenciar livros') await gerenciarLivrosMenu()
    if (opcao === 'Gerenciar clientes') await gerenciarClientesMenu()
    if (opcao === 'Gerenciar empréstimos')
      await emprestimoMenuController(funcionario)
    if (opcao === 'Relatórios') await relatorioMenuController()
  }
}

async function gerenciarLivrosMenu(): Promise<void> {
  for (;;) {
    const opcao = await selecionarOpcao('Gerenciar livros', [
      'Cadastrar livro',
      'Consultar livros',
      'Voltar'
    ] as const)

    if (opcao === 'Voltar') break
    if (opcao === 'Cadastrar livro') await livroCadastroController()
    if (opcao === 'Consultar livros') await livroConsultarController()
  }
}

async function gerenciarClientesMenu(): Promise<void> {
  for (;;) {
    const opcao = await selecionarOpcao('Gerenciar clientes', [
      'Cadastrar cliente',
      'Consultar clientes',
      'Voltar'
    ] as const)

    if (opcao === 'Voltar') break
    if (opcao === 'Cadastrar cliente') await clienteCadastrarController()
    if (opcao === 'Consultar clientes') await clienteConsultarController()
  }
}

export { adminMenuController }
