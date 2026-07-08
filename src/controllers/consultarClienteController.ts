import inquirer from 'inquirer'

import { Cliente, ConsultarClienteMenuPrompt } from '../models/Cliente'
import {
  buscarClientePorCpf,
  buscarClientesPorNome,
  atualizarCliente,
  removerCliente,
  listarClientes
} from '../services/clienteService'
import { listarHistoricoPorCliente } from '../services/reservaService'

async function consultarClienteController(): Promise<void> {
  for (;;) {
    const { opcao } = await inquirer.prompt<ConsultarClienteMenuPrompt>([
      {
        type: 'select',
        name: 'opcao',
        message: 'Consultar clientes',
        choices: [
          'Listar todos os clientes',
          'Buscar por nome',
          'Buscar por CPF',
          'Voltar'
        ],
        loop: false
      }
    ])

    if (opcao === 'Voltar') break

    if (opcao === 'Listar todos os clientes') await listarTodosFluxo()
    if (opcao === 'Buscar por nome') await buscarPorNomeFluxo()
    if (opcao === 'Buscar por CPF') await buscarPorCpfFluxo()
  }
}

async function listarTodosFluxo(): Promise<void> {
  const clientes = await listarClientes()
  await exibirClientes(clientes)
}

async function buscarPorNomeFluxo(): Promise<void> {
  const { nome } = await inquirer.prompt<{ nome: string }>([
    { type: 'input', name: 'nome', message: 'Digite o nome ou parte dele:' }
  ])

  if (!nome.trim()) {
    console.log('Digite ao menos um caractere para buscar.')
    return
  }

  const clientes = await buscarClientesPorNome(nome.trim())
  await exibirClientes(clientes)
}

async function buscarPorCpfFluxo(): Promise<void> {
  const { cpf } = await inquirer.prompt<{ cpf: string }>([
    { type: 'input', name: 'cpf', message: 'Digite o CPF (somente números):' }
  ])

  const cliente = await buscarClientePorCpf(cpf)
  await exibirClientes(cliente ? [cliente] : [])
}

async function exibirClientes(clientes: Cliente[]): Promise<void> {
  if (clientes.length === 0) {
    console.log('Nenhum cliente encontrado.')
    return
  }

  const { clienteId } = await inquirer.prompt<{ clienteId: number | 'voltar' }>(
    [
      {
        type: 'select',
        name: 'clienteId',
        message: 'Selecione um cliente:',
        choices: [
          ...clientes.map((c) => ({
            name: `${c.nome} ${c.sobrenome} — CPF: ${c.cpf}`,
            value: c.id
          })),
          { name: 'Voltar', value: 'voltar' as const }
        ],
        loop: false
      }
    ]
  )

  if (clienteId === 'voltar') return

  const cliente = clientes.find((c) => c.id === clienteId)
  if (!cliente) return

  await exibirDetalheCliente(cliente)
}

async function exibirDetalheCliente(cliente: Cliente): Promise<void> {
  console.log('\n----- Dados do cliente -----')
  console.log(`Nome: ${cliente.nome} ${cliente.sobrenome}`)
  console.log(`CPF: ${cliente.cpf}`)
  console.log(`Email: ${cliente.email}`)
  console.log(`Telefone: ${cliente.telefone}`)
  console.log('-----------------------------\n')

  const historico = await listarHistoricoPorCliente(cliente.id)

  if (historico.length === 0) {
    console.log('Esse cliente ainda não pegou nenhum livro emprestado.')
  } else {
    console.log('----- Histórico de empréstimos -----')
    for (const r of historico) {
      if (r.status === 'ativa') {
        console.log(
          `"${r.livro_titulo}" — EMPRESTADO desde ${r.data_reserva} (registrado por ${r.funcionario_emprestou_nome})`
        )
      } else {
        console.log(
          `"${r.livro_titulo}" — devolvido em ${r.data_devolucao ?? '—'} (emprestado em ${r.data_reserva} ( por ${r.funcionario_emprestou_nome}), devolução registrada por ${r.funcionario_devolveu_nome ?? '—'})`
        )
      }
    }
    console.log('-------------------------------------\n')
  }

  const { acao } = await inquirer.prompt<{
    acao: 'Atualizar cliente' | 'Remover cliente' | 'Voltar'
  }>([
    {
      type: 'select',
      name: 'acao',
      message: 'O que deseja fazer?',
      choices: ['Atualizar cliente', 'Remover cliente', 'Voltar']
    }
  ])

  if (acao === 'Voltar') return

  if (acao === 'Remover cliente') {
    await removerClienteFluxo(cliente)
    return
  }

  await atualizarClienteFluxo(cliente)
}

async function atualizarClienteFluxo(cliente: Cliente): Promise<void> {
  const resposta = await inquirer.prompt<{
    nome: string
    sobrenome: string
    email: string
    telefone: string
  }>([
    { type: 'input', name: 'nome', message: 'Nome:', default: cliente.nome },
    {
      type: 'input',
      name: 'sobrenome',
      message: 'Sobrenome:',
      default: cliente.sobrenome
    },
    { type: 'input', name: 'email', message: 'Email:', default: cliente.email },
    {
      type: 'input',
      name: 'telefone',
      message: 'Telefone:',
      default: cliente.telefone
    }
  ])

  try {
    await atualizarCliente(cliente.id, resposta)
    console.log('Cliente atualizado com sucesso!')
  } catch {
    console.log('Erro ao atualizar cliente')
  }
}

async function removerClienteFluxo(cliente: Cliente): Promise<void> {
  const { confirmar } = await inquirer.prompt<{ confirmar: boolean }>([
    {
      type: 'confirm',
      name: 'confirmar',
      message: `Tem certeza que deseja remover "${cliente.nome} ${cliente.sobrenome}"?`,
      default: false
    }
  ])

  if (!confirmar) {
    console.log('Remoção cancelada.')
    return
  }

  try {
    await removerCliente(cliente.id)
    console.log('Cliente removido com sucesso.')
  } catch {
    console.log(
      'Não foi possível remover: esse cliente possui empréstimos registrados no histórico.'
    )
    return
  }
}

export { consultarClienteController }
