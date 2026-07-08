import { Cliente } from '../models/Cliente'
import {
  buscarClientePorCpf,
  buscarClientesPorNome,
  atualizarCliente,
  removerCliente,
  listarClientes
} from '../services/clienteService'
import { listarHistoricoPorCliente } from '../services/reservaService'
import { consultarComModos } from '../utils/fluxoConsulta'
import { selecionarOpcao, confirmar, pedirTexto } from '../utils/prompts'

async function clienteConsultarController(): Promise<void> {
  await consultarComModos<Cliente>(
    'Consultar clientes',
    [
      { rotulo: 'Listar todos', buscar: listarClientes },
      {
        rotulo: 'Buscar por nome',
        buscar: async () => {
          const nome = await pedirTexto('Digite o nome ou parte dele:')
          if (!nome.trim()) {
            console.log('Digite ao menos um caractere para buscar.')
            return []
          }
          return buscarClientesPorNome(nome.trim())
        }
      },
      {
        rotulo: 'Buscar por CPF',
        buscar: async () => {
          const cpf = await pedirTexto('Digite o CPF (somente números):')
          const cliente = await buscarClientePorCpf(cpf)
          return cliente ? [cliente] : []
        }
      }
    ],
    (c) => `${c.nome} ${c.sobrenome} — CPF: ${c.cpf}`,
    exibirDetalheCliente
  )
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

  const acao = await selecionarOpcao('O que deseja fazer?', [
    'Atualizar cliente',
    'Remover cliente',
    'Voltar'
  ] as const)

  if (acao === 'Voltar') return
  if (acao === 'Remover cliente') return removerClienteFluxo(cliente)

  await atualizarClienteFluxo(cliente)
}

async function atualizarClienteFluxo(cliente: Cliente): Promise<void> {
  const nome = await pedirTexto('Nome:', cliente.nome)
  const sobrenome = await pedirTexto('Sobrenome:', cliente.sobrenome)
  const email = await pedirTexto('Email:', cliente.email)
  const telefone = await pedirTexto('Telefone:', cliente.telefone)

  try {
    await atualizarCliente(cliente.id, { nome, sobrenome, email, telefone })
    console.log('Cliente atualizado com sucesso!')
  } catch (error) {
    console.log((error as Error).message)
  }
}

async function removerClienteFluxo(cliente: Cliente): Promise<void> {
  const confirmado = await confirmar(
    `Tem certeza que deseja remover "${cliente.nome} ${cliente.sobrenome}"?`
  )

  if (!confirmado) {
    console.log('Remoção cancelada.')
    return
  }

  try {
    await removerCliente(cliente.id)
    console.log('Cliente removido com sucesso.')
  } catch (error) {
    console.log((error as Error).message)
  }
}

export { clienteConsultarController }
