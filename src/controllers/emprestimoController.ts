import inquirer from 'inquirer'

import { Cliente } from '../models/Cliente'
import { Funcionario } from '../models/Funcionario'
import {
  buscarClientePorCpf,
  buscarClientesPorNome,
  cadastrarCliente
} from '../services/clienteService'
import { listarLivrosPorTituloOuAutor } from '../services/livroService'
import {
  emprestarLivro,
  devolverLivro,
  listarAtivasPorLivro,
  listarHistoricoPorLivro
} from '../services/reservaService'

async function emprestimoMenuController(
  funcionario: Funcionario
): Promise<void> {
  for (;;) {
    const { opcao } = await inquirer.prompt<{
      opcao:
        | 'Emprestar livro'
        | 'Devolver livro'
        | 'Ver quem está com o livro'
        | 'Ver histórico do livro'
        | 'Voltar'
    }>([
      {
        type: 'select',
        name: 'opcao',
        message: 'Gerenciar empréstimos',
        choices: [
          'Emprestar livro',
          'Devolver livro',
          'Ver quem está com o livro',
          'Ver histórico do livro',
          'Voltar'
        ]
      }
    ])

    if (opcao === 'Voltar') break

    try {
      if (opcao === 'Emprestar livro') await emprestarFluxo(funcionario)
      if (opcao === 'Devolver livro') await devolverFluxo(funcionario)
      if (opcao === 'Ver quem está com o livro') await verAtivasFluxo()
      if (opcao === 'Ver histórico do livro') await verHistoricoFluxo()
    } catch (error) {
      console.log((error as Error).message)
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
      ]
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
          ]
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

  console.log('Cliente não encontrado.')
  const { opcao } = await inquirer.prompt<{
    opcao: 'Cadastrar novo cliente' | 'Voltar'
  }>([
    {
      type: 'select',
      name: 'opcao',
      message: 'O que deseja fazer?',
      choices: ['Cadastrar novo cliente', 'Voltar']
    }
  ])

  if (opcao === 'Voltar') return null

  return cadastrarNovoClienteFluxo()
}

async function cadastrarNovoClienteFluxo(): Promise<Cliente | null> {
  const dados = await inquirer.prompt<{
    nome: string
    sobrenome: string
    cpf: string
    email: string
    telefone: string
  }>([
    { type: 'input', name: 'nome', message: 'Nome:' },
    { type: 'input', name: 'sobrenome', message: 'Sobrenome:' },
    { type: 'input', name: 'cpf', message: 'CPF:' },
    { type: 'input', name: 'email', message: 'Email:' },
    { type: 'input', name: 'telefone', message: 'Telefone:' }
  ])

  try {
    return await cadastrarCliente(
      dados.nome,
      dados.sobrenome,
      dados.cpf,
      dados.email,
      dados.telefone
    )
  } catch (error) {
    console.log((error as Error).message)
    return null
  }
}

// ----- Fluxos principais -----
async function emprestarFluxo(funcionario: Funcionario): Promise<void> {
  const livroId = await selecionarLivroFluxo()
  if (livroId === null) return

  const cliente = await selecionarClienteFluxo()
  if (!cliente) {
    console.log('Operação cancelada.')
    return
  }

  await emprestarLivro(livroId, funcionario.id, cliente.id)
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

  const { dataDevolucao } = await inquirer.prompt<{ dataDevolucao: string }>([
    {
      type: 'input',
      name: 'dataDevolucao',
      message: 'Data da devolução (AAAA-MM-DD):',
      default: new Date().toISOString().slice(0, 10)
    }
  ])

  await devolverLivro(reservaId, funcionario.id, dataDevolucao)
  console.log('Devolução registrada com sucesso!')
}

async function verAtivasFluxo(): Promise<void> {
  const livroId = await selecionarLivroFluxo()
  if (livroId === null) return

  const ativas = await listarAtivasPorLivro(livroId)

  if (ativas.length === 0) {
    console.log('Nenhum exemplar emprestado no momento.')
    return
  }

  console.log('\n----- Com quem o livro está -----')
  for (const r of ativas) {
    console.log(
      `${r.cliente_nome} — desde ${r.data_reserva} (registrado por ${r.funcionario_emprestou_nome})`
    )
  }
  console.log('----------------------------------\n')
}

async function verHistoricoFluxo(): Promise<void> {
  const livroId = await selecionarLivroFluxo()
  if (livroId === null) return

  const historico = await listarHistoricoPorLivro(livroId)

  if (historico.length === 0) {
    console.log('Nenhum histórico de empréstimo para esse livro.')
    return
  }

  console.log('\n----- Histórico de empréstimos -----')
  for (const r of historico) {
    const devolucao = r.data_devolucao
      ? `devolvido em ${r.data_devolucao} (por ${r.funcionario_devolveu_nome ?? '—'})`
      : 'ainda não devolvido'
    console.log(
      `${r.cliente_nome} — emprestado em ${r.data_reserva} por ${r.funcionario_emprestou_nome} | ${devolucao}`
    )
  }
  console.log('-------------------------------------\n')
}

export { emprestimoMenuController }
