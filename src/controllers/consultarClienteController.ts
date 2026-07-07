import inquirer from 'inquirer'

import { Cliente } from '../models/Cliente'
import {
  buscarClientePorCpf,
  buscarClientesPorNome,
  atualizarCliente,
  removerCliente
} from '../services/clienteService'
import { listarHistoricoPorCliente } from '../services/reservaService'

async function consultarClienteController(): Promise<void> {
  const { opcao } = await inquirer.prompt<{
    opcao: 'Buscar por nome' | 'Buscar por CPF' | 'Voltar'
  }>([
    {
      type: 'select',
      name: 'opcao',
      message: 'Consultar clientes',
      choices: ['Buscar por nome', 'Buscar por CPF', 'Voltar']
    }
  ])

  if (opcao === 'Voltar') return

  let cliente: Cliente | null = null

  if (opcao === 'Buscar por CPF') {
    const { cpf } = await inquirer.prompt<{ cpf: string }>([
      { type: 'input', name: 'cpf', message: 'CPF do cliente:' }
    ])
    cliente = await buscarClientePorCpf(cpf)

    if (!cliente) {
      console.log('Cliente não encontrado.')
      return
    }
  } else {
    const { nome } = await inquirer.prompt<{ nome: string }>([
      { type: 'input', name: 'nome', message: 'Nome (ou parte dele):' }
    ])
    const encontrados = await buscarClientesPorNome(nome)

    if (encontrados.length === 0) {
      console.log('Nenhum cliente encontrado.')
      return
    }

    const { clienteId } = await inquirer.prompt<{ clienteId: number }>([
      {
        type: 'select',
        name: 'clienteId',
        message: 'Selecione o cliente:',
        choices: encontrados.map((c) => ({
          name: `${c.nome} ${c.sobrenome} — CPF ${c.cpf}`,
          value: c.id
        }))
      }
    ])

    cliente = encontrados.find((c) => c.id === clienteId) ?? null
  }

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
          `"${r.livro_titulo}" — devolvido em ${r.data_devolucao ?? '—'} (emprestado em ${r.data_reserva} por ${r.funcionario_emprestou_nome}, devolução registrada por ${r.funcionario_devolveu_nome ?? '—'})`
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
  } catch (error) {
    console.log((error as Error).message)
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
  } catch (error) {
    console.log(
      'Não foi possível remover: esse cliente possui empréstimos registrados no histórico.',
      error
    )
  }
}

export { consultarClienteController }
