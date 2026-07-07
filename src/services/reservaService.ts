import { recalcularStatusLivro } from './livroService'
import { ReservaDetalhada } from '../models/Reserva'
import * as livroRepository from '../repositories/livroRepository'
import * as reservaRepository from '../repositories/reservaRepository'

async function emprestarLivro(
  livroId: number,
  funcionarioId: number,
  clienteId: number,
  prazoDias: number
): Promise<void> {
  await reservaRepository.atualizarStatusAtrasados()

  const possuiEmprestimoAtivo =
    await reservaRepository.existeReservaAtivaPorCliente(clienteId)
  if (possuiEmprestimoAtivo) {
    throw new Error(
      'Este cliente já possui um livro emprestado. É preciso devolvê-lo antes de pegar outro.'
    )
  }

  const livro = await livroRepository.buscarPorId(livroId)
  if (!livro) throw new Error('Livro não encontrado')

  const ativas = await reservaRepository.contarAtivasPorLivro(livroId)
  if (ativas >= livro.total_exemplares) {
    throw new Error('Não há exemplares disponíveis para empréstimo')
  }

  const hoje = new Date()
  const dataPrevista = new Date(hoje)
  dataPrevista.setDate(dataPrevista.getDate() + prazoDias)
  const dataPrevistaFormatada = dataPrevista.toISOString().slice(0, 10)

  await reservaRepository.criar(
    livroId,
    funcionarioId,
    clienteId,
    dataPrevistaFormatada
  )
  await recalcularStatusLivro(livroId)
}

async function devolverLivro(
  reservaId: number,
  funcionarioDevolucaoId: number,
  dataDevolucao: string
): Promise<void> {
  const reserva = await reservaRepository.buscarPorId(reservaId)
  if (!reserva) throw new Error('Reserva não encontrada')
  if (reserva.status === 'devolvida')
    throw new Error('Essa reserva já foi encerrada')

  await reservaRepository.registrarDevolucao(
    reservaId,
    funcionarioDevolucaoId,
    dataDevolucao
  )
  await recalcularStatusLivro(reserva.livro_id)
}

async function listarAtivasPorLivro(
  livroId: number
): Promise<ReservaDetalhada[]> {
  await reservaRepository.atualizarStatusAtrasados()
  return reservaRepository.listarAtivasPorLivro(livroId)
}

async function listarHistoricoPorLivro(
  livroId: number
): Promise<ReservaDetalhada[]> {
  await reservaRepository.atualizarStatusAtrasados()
  return reservaRepository.listarHistoricoPorLivro(livroId)
}

async function listarHistoricoPorCliente(
  clienteId: number
): Promise<ReservaDetalhada[]> {
  await reservaRepository.atualizarStatusAtrasados()
  return reservaRepository.listarHistoricoPorCliente(clienteId)
}

async function listarLivrosComEmprestimoAtivo() {
  await reservaRepository.atualizarStatusAtrasados()
  return reservaRepository.listarLivrosComEmprestimoAtivo()
}

async function listarClientesComEmprestimoAtivo() {
  await reservaRepository.atualizarStatusAtrasados()
  return reservaRepository.listarClientesComEmprestimoAtivo()
}

export {
  emprestarLivro,
  devolverLivro,
  listarAtivasPorLivro,
  listarHistoricoPorLivro,
  listarHistoricoPorCliente,
  listarClientesComEmprestimoAtivo,
  listarLivrosComEmprestimoAtivo
}
