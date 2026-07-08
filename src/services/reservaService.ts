import { recalcularStatusLivro } from './livroService'
import { ReservaDetalhada } from '../models/Reserva'
import * as livroRepository from '../repositories/livroRepository'
import * as reservaRepository from '../repositories/reservaRepository'
import { formatarDataBrasil } from '../utils/data'

async function emprestarLivro(
  livroId: number,
  funcionarioId: number,
  clienteId: number,
  prazoDias: number
): Promise<void> {
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
  const dataPrevistaFormatada = formatarDataBrasil(dataPrevista)

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
  funcionarioDevolucaoId: number
): Promise<void> {
  const reserva = await reservaRepository.buscarPorId(reservaId)
  if (!reserva) throw new Error('Reserva não encontrada')
  if (reserva.status !== 'ativa')
    throw new Error('Essa reserva já foi encerrada')

  await reservaRepository.registrarDevolucao(reservaId, funcionarioDevolucaoId)
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
