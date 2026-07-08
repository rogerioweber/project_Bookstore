import inquirer from 'inquirer'

import { Cliente } from '../models/Cliente'
import { Funcionario } from '../models/Funcionario'
import {
  buscarClientePorCpf,
  buscarClientesPorNome
} from '../services/clienteService'
import {
  buscarLivroPorId,
  listarLivrosPorTituloOuAutor
} from '../services/livroService'
import {
  emprestarLivro,
  devolverLivro,
  listarAtivasPorLivro
} from '../services/reservaService'

async function emprestimoMenuController(
  funcionario: Funcionario
): Promise<void> {
  for (;;) {
    const { opcao } = await inquirer.prompt<{
      opcao: 'Emprestar livro' | 'Devolver livro' | 'Voltar'
    }>([
      {
        type: 'select',
        name: 'opcao',
        message: 'Gerenciar empréstimos',
        choices: ['Emprestar livro', 'Devolver livro', 'Voltar']
      }
    ])

    if (opcao === 'Voltar') break

    try {
      if (opcao === 'Emprestar livro') await emprestarFluxo(funcionario)
      if (opcao === 'Devolver livro') await devolverFluxo(funcionario)
    } catch (error) {
      console.log((error as Error).message)
      return
    }
  }
}

// ----- Seleção de livro por busca (título ou autor) -----
async function selecionarLivroFluxo(): Promise<number | null> {
  const { termo } = await inquirer.prompt<{ termo: string }>([
    {
      type: 'input',
      name: 'termo',
      message: 'Digite parte do título ou do nome do autor:'
    }
  ])

  if (!termo.trim()) {
    console.log('Digite ao menos um caractere para buscar.')
    return null
  }

  const livros = await listarLivrosPorTituloOuAutor(termo.trim())

  if (livros.length === 0) {
    console.log('Nenhum livro encontrado.')
    return null
  }

  const { livroId } = await inquirer.prompt<{ livroId: number | 'voltar' }>([
    {
      type: 'select',
      name: 'livroId',
      message: 'Selecione o livro:',
      choices: [
        ...livros.map((l) => ({
          name: `${l.titulo} — ${l.autores ?? 'sem autor'} (${l.status}, ${String(l.total_exemplares)} exemplar(es))`,
          value: l.id
        })),
        { name: 'Voltar', value: 'voltar' as const }
      ],
      loop: false
    }
  ])

  if (livroId === 'voltar') return null
  return livroId
}

// ----- Seleção/cadastro de cliente por CPF ou nome -----
async function selecionarClienteFluxo(): Promise<Cliente | null> {
  const { modoBusca } = await inquirer.prompt<{
    modoBusca: 'Buscar por nome' | 'Buscar por CPF' | 'Cancelar'
  }>([
    {
      type: 'select',
      name: 'modoBusca',
      message: 'Como deseja localizar o cliente?',
      choices: ['Buscar por nome', 'Buscar por CPF', 'Cancelar']
    }
  ])

  if (modoBusca === 'Cancelar') return null

  let cliente: Cliente | null = null

  if (modoBusca === 'Buscar por CPF') {
    const { cpf } = await inquirer.prompt<{ cpf: string }>([
      { type: 'input', name: 'cpf', message: 'CPF do cliente:' }
    ])
    cliente = await buscarClientePorCpf(cpf)
  } else {
    const { nome } = await inquirer.prompt<{ nome: string }>([
      { type: 'input', name: 'nome', message: 'Nome (ou parte dele):' }
    ])
    const encontrados = await buscarClientesPorNome(nome)

    if (encontrados.length > 0) {
      const { clienteId } = await inquirer.prompt<{
        clienteId: number | 'voltar'
      }>([
        {
          type: 'select',
          name: 'clienteId',
          message: 'Selecione o cliente:',
          choices: [
            ...encontrados.map((c) => ({
              name: `${c.nome} ${c.sobrenome}`,
              value: c.id
            })),
            { name: 'Nenhum destes', value: 'voltar' as const }
          ],
          loop: false
        }
      ])

      if (clienteId !== 'voltar') {
        cliente = encontrados.find((c) => c.id === clienteId) ?? null
      }
    }
  }

  if (cliente) {
    const { confirmar } = await inquirer.prompt<{ confirmar: boolean }>([
      {
        type: 'confirm',
        name: 'confirmar',
        message: `Cliente: ${cliente.nome} ${cliente.sobrenome} — CPF ${cliente.cpf}. É esse mesmo?`,
        default: true
      }
    ])
    return confirmar ? cliente : null
  }

  console.log(
    'Cliente não encontrado. É necessário cadastrá-lo antes de realizar o empréstimo'
  )
  return null
}

// ----- Fluxos principais -----
async function emprestarFluxo(funcionario: Funcionario): Promise<void> {
  const livroId = await selecionarLivroFluxo()
  if (livroId === null) return

  const livro = await buscarLivroPorId(livroId)
  if (!livro) {
    console.log('Livro não encontrado.')
    return
  }

  if (livro.status === 'indisponivel') {
    console.log(
      `O livro "${livro.titulo}" não está disponível para empréstimo no momento.`
    )
    return
  }

  const cliente = await selecionarClienteFluxo()
  if (!cliente) {
    console.log('Operação cancelada.')
    return
  }

  const { prazoDias } = await inquirer.prompt<{ prazoDias: number }>([
    {
      type: 'number',
      name: 'prazoDias',
      message: 'Prazo para devolução (em dias):',
      default: 7
    }
  ])

  await emprestarLivro(livroId, funcionario.id, cliente.id, prazoDias)
  console.log('Empréstimo registrado com sucesso!')
}

async function devolverFluxo(funcionario: Funcionario): Promise<void> {
  const livroId = await selecionarLivroFluxo()
  if (livroId === null) return

  const ativas = await listarAtivasPorLivro(livroId)

  if (ativas.length === 0) {
    console.log('Não há empréstimos ativos para esse livro.')
    return
  }

  const { reservaId } = await inquirer.prompt<{ reservaId: number }>([
    {
      type: 'select',
      name: 'reservaId',
      message: 'Qual reserva devolver?',
      choices: ativas.map((r) => ({
        name: `${r.cliente_nome} — emprestado em ${r.data_reserva}`,
        value: r.id
      }))
    }
  ])

  await devolverLivro(reservaId, funcionario.id)
  console.log('Devolução registrada com sucesso!')
}

export { emprestimoMenuController }
