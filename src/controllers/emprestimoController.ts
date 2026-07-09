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
import {
  selecionarOpcao,
  confirmar,
  pedirTexto,
  pedirNumero,
  selecionarItem
} from '../utils/prompts'

async function emprestimoMenuController(
  funcionario: Funcionario
): Promise<void> {
  for (;;) {
    const opcao = await selecionarOpcao('Gerenciar empréstimos', [
      'Emprestar livro',
      'Devolver livro',
      'Voltar'
    ] as const)

    if (opcao === 'Voltar') break

    try {
      if (opcao === 'Emprestar livro') await emprestarFluxo(funcionario)
      if (opcao === 'Devolver livro') await devolverFluxo(funcionario)
    } catch (error) {
      console.log((error as Error).message)
    }
  }
}

async function selecionarLivroFluxo(): Promise<number | null> {
  const termo = await pedirTexto('Digite parte do título ou do nome do autor:')

  if (!termo.trim()) {
    console.log('Digite ao menos um caractere para buscar.')
    return null
  }

  const livros = await listarLivrosPorTituloOuAutor(termo.trim())

  if (livros.length === 0) {
    console.log('Nenhum livro encontrado.')
    return null
  }

  const selecionado = await selecionarItem(
    'Selecione o livro:',
    livros,
    (l) =>
      `${l.titulo} — ${l.autores ?? 'sem autor'} (${l.status}, ${String(l.total_exemplares)} exemplar(es))`
  )

  return selecionado ? selecionado.id : null
}

async function selecionarClienteFluxo(): Promise<Cliente | null> {
  const modoBusca = await selecionarOpcao('Como deseja localizar o cliente?', [
    'Buscar por nome',
    'Buscar por CPF',
    'Cancelar'
  ] as const)

  if (modoBusca === 'Cancelar') return null

  let cliente: Cliente | null = null

  if (modoBusca === 'Buscar por CPF') {
    const cpf = await pedirTexto('CPF do cliente:')
    cliente = await buscarClientePorCpf(cpf)
  } else {
    const nome = await pedirTexto('Nome (ou parte dele):')
    const encontrados = await buscarClientesPorNome(nome)

    if (encontrados.length > 0) {
      cliente = await selecionarItem(
        'Selecione o cliente:',
        encontrados,
        (c) => `${c.nome} ${c.sobrenome}`
      )
    }
  }

  if (cliente) {
    const confirmado = await confirmar(
      `Cliente: ${cliente.nome} ${cliente.sobrenome} — CPF ${cliente.cpf ?? '-'}. É esse mesmo?`,
      true
    )
    return confirmado ? cliente : null
  }

  console.log(
    'Cliente não encontrado. É necessário cadastrá-lo antes de realizar o empréstimo'
  )
  return null
}

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

  const prazoDias = await pedirNumero('Prazo para devolução (em dias):', 7)

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

  const reserva = await selecionarItem(
    'Qual reserva devolver?',
    ativas,
    (r) => `${r.cliente_nome} — emprestado em ${r.data_reserva}`
  )

  if (!reserva) return

  await devolverLivro(reserva.id, funcionario.id)
  console.log('Devolução registrada com sucesso!')
}

export { emprestimoMenuController }
