import inquirer from 'inquirer'

import { listarAutoresComQuantidadeLivros } from '../services/autorService'
import {
  listarLivrosPorStatus,
  listarLivrosPorTituloOuAutor
} from '../services/livroService'
import {
  listarLivrosComEmprestimoAtivo,
  listarClientesComEmprestimoAtivo,
  listarHistoricoPorLivro
} from '../services/reservaService'

async function relatorioMenuController(): Promise<void> {
  for (;;) {
    const { opcao } = await inquirer.prompt<{
      opcao:
        | 'Livros disponíveis'
        | 'Livros emprestados'
        | 'Livros cadastrados por autor'
        | 'Quantidade de empréstimos por livro'
        | 'Clientes com empréstimo ativo'
        | 'Voltar'
    }>([
      {
        type: 'select',
        name: 'opcao',
        message: 'Relatórios',
        choices: [
          'Livros disponíveis',
          'Livros emprestados',
          'Livros cadastrados por autor',
          'Quantidade de empréstimos por livro',
          'Clientes com empréstimo ativo',
          'Voltar'
        ]
      }
    ])

    if (opcao === 'Voltar') break

    if (opcao === 'Livros disponíveis') await relatorioLivrosDisponiveis()
    if (opcao === 'Livros emprestados') await relatorioLivrosEmprestados()
    if (opcao === 'Livros cadastrados por autor')
      await relatorioLivrosPorAutor()
    if (opcao === 'Quantidade de empréstimos por livro')
      await relatorioHistoricoPorLivro()
    if (opcao === 'Clientes com empréstimo ativo')
      await relatorioClientesComEmprestimoAtivo()
  }
}

async function relatorioLivrosDisponiveis(): Promise<void> {
  const livros = await listarLivrosPorStatus('disponivel')

  if (livros.length === 0) {
    console.log('Nenhum livro disponível no momento.')
    return
  }

  console.log('\n----- Livros disponíveis -----')
  for (const l of livros) {
    console.log(
      `${l.titulo} — ${l.autores ?? 'sem autor'} (${String(l.total_exemplares)} exemplar(es))`
    )
  }
  console.log('-------------------------------\n')
}

async function relatorioLivrosEmprestados(): Promise<void> {
  const livros = await listarLivrosComEmprestimoAtivo()

  if (livros.length === 0) {
    console.log('Nenhum livro emprestado no momento.')
    return
  }

  console.log('\n----- Livros emprestados -----')
  for (const l of livros) {
    console.log(
      `${l.livro_titulo} — ${String(l.exemplares_emprestados)}/${String(l.total_exemplares)} exemplar(es) emprestado(s)`
    )
  }
  console.log('-------------------------------\n')
}

async function relatorioLivrosPorAutor(): Promise<void> {
  const autores = await listarAutoresComQuantidadeLivros()

  if (autores.length === 0) {
    console.log('Nenhum autor cadastrado.')
    return
  }

  console.log('\n----- Livros cadastrados por autor -----')
  for (const a of autores) {
    console.log(`${a.autor_nome}: ${String(a.quantidade_livros)} livro(s)`)
  }
  console.log('------------------------------------------\n')
}

async function relatorioHistoricoPorLivro(): Promise<void> {
  const { termo } = await inquirer.prompt<{ termo: string }>([
    {
      type: 'input',
      name: 'termo',
      message: 'Digite parte do título ou do nome do autor:'
    }
  ])

  if (!termo.trim()) {
    console.log('Digite ao menos um caractere para buscar.')
    return
  }

  const livros = await listarLivrosPorTituloOuAutor(termo.trim())

  if (livros.length === 0) {
    console.log('Nenhum livro encontrado.')
    return
  }

  const { livroId } = await inquirer.prompt<{ livroId: number | 'voltar' }>([
    {
      type: 'select',
      name: 'livroId',
      message: 'Selecione o livro:',
      choices: [
        ...livros.map((l) => ({
          name: `${l.titulo} — ${l.autores ?? 'sem autor'}`,
          value: l.id
        })),
        { name: 'Voltar', value: 'voltar' as const }
      ]
    }
  ])

  if (livroId === 'voltar') return

  const historico = await listarHistoricoPorLivro(livroId)

  if (historico.length === 0) {
    console.log('Nenhum histórico de empréstimo para esse livro.')
    return
  }

  console.log(`\n----- Total de empréstimos: ${String(historico.length)} -----`)
  for (const r of historico) {
    const devolucao = r.data_devolucao
      ? `devolvido em ${r.data_devolucao} (por ${r.funcionario_devolveu_nome ?? '—'})`
      : 'ainda não devolvido'
    console.log(
      `Cliente: ${r.cliente_nome} — emprestado em ${r.data_reserva} ( por ${r.funcionario_emprestou_nome}) | ${devolucao}`
    )
  }
  console.log('-------------------------------------\n')
}

async function relatorioClientesComEmprestimoAtivo(): Promise<void> {
  const registros = await listarClientesComEmprestimoAtivo()

  if (registros.length === 0) {
    console.log('Nenhum cliente com empréstimo ativo no momento.')
    return
  }

  console.log('\n----- Clientes com empréstimo ativo -----')
  for (const r of registros) {
    const marcador = r.status === 'atrasada' ? 'ATRASADO' : 'no prazo'
    console.log(
      `Cliente: ${r.cliente_nome} (CPF ${r.cliente_cpf}) — Livro: "${r.livro_titulo}" emprestado em ${r.data_reserva}, prazo até ${r.data_prevista_devolucao} [${marcador}]`
    )
  }
  console.log('-------------------------------------------\n')
}

export { relatorioMenuController }
