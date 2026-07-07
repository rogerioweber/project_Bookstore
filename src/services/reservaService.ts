import { recalcularStatusLivro } from './livroService'
import { ReservaDetalhada } from '../models/Reserva'
import * as livroRepository from '../repositories/livroRepository'
import * as reservaRepository from '../repositories/reservaRepository'

async function emprestarLivro(
  livroId: number,
  funcionarioId: number,
  clienteId: number
): Promise<void> {
  const livro = await livroRepository.buscarPorId(livroId)
  if (!livro) throw new Error('Livro não encontrado')

  const ativas = await reservaRepository.contarAtivasPorLivro(livroId)
  if (ativas >= livro.total_exemplares) {
    throw new Error('Não há exemplares disponíveis para empréstimo')
  }

  await reservaRepository.criar(livroId, funcionarioId, clienteId)
  await recalcularStatusLivro(livroId)
}

async function devolverLivro(
  reservaId: number,
  funcionarioDevolucaoId: number,
  dataDevolucao: string
): Promise<void> {
  const reserva = await reservaRepository.buscarPorId(reservaId)
  if (!reserva) throw new Error('Reserva não encontrada')
  if (reserva.status !== 'ativa')
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
  return reservaRepository.listarAtivasPorLivro(livroId)
}

async function listarHistoricoPorLivro(
  livroId: number
): Promise<ReservaDetalhada[]> {
  return reservaRepository.listarHistoricoPorLivro(livroId)
}

async function listarHistoricoPorCliente(
  clienteId: number
): Promise<ReservaDetalhada[]> {
  return reservaRepository.listarHistoricoPorCliente(clienteId)
}

export {
  emprestarLivro,
  devolverLivro,
  listarAtivasPorLivro,
  listarHistoricoPorLivro,
  listarHistoricoPorCliente
}
