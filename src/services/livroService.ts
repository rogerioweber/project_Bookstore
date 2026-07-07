import {
  Livro,
  LivroListagem,
  LivroDetalhado,
  OrdenarLivrosPor,
  AtualizarLivroInput
} from '../models/Livro'
import * as autorRepository from '../repositories/autorRepository'
import * as categoriaRepository from '../repositories/categoriaRepository'
import * as livroRepository from '../repositories/livroRepository'
import { capitalizar } from '../utils/texto'

async function buscarOuCriarAutor(nome: string): Promise<number> {
  const nomeNormalizado = capitalizar(nome)
  const existente = await autorRepository.buscarPorNome(nomeNormalizado)
  if (existente) return existente.id
  const novo = await autorRepository.criar(nomeNormalizado)
  return novo.id
}

async function buscarOuCriarCategoria(nome: string): Promise<number> {
  const nomeNormalizado = capitalizar(nome)
  const existente = await categoriaRepository.buscarPorNome(nomeNormalizado)
  if (existente) return existente.id
  const nova = await categoriaRepository.criar(nomeNormalizado)
  return nova.id
}

async function cadastrarLivro(
  titulo: string,
  totalExemplares: number,
  nomesAutores: string[],
  nomesCategorias: string[]
): Promise<Livro> {
  const tituloNormalizado = titulo.trim()

  if (!tituloNormalizado) throw new Error('O título do livro é obrigatório')
  if (totalExemplares < 0) throw new Error('A quantidade não pode ser negativa')
  if (nomesAutores.length === 0) throw new Error('Informe ao menos um autor')
  if (nomesCategorias.length === 0)
    throw new Error('Informe ao menos uma categoria')

  const existente = await livroRepository.buscarPorTitulo(tituloNormalizado)
  if (existente) {
    throw new Error(`Já existe um livro com o título "${existente.titulo}"`)
  }

  const autorIds: number[] = []
  for (const nome of nomesAutores) autorIds.push(await buscarOuCriarAutor(nome))

  const categoriaIds: number[] = []
  for (const nome of nomesCategorias)
    categoriaIds.push(await buscarOuCriarCategoria(nome))

  return livroRepository.criar({
    titulo: tituloNormalizado,
    totalExemplares,
    autorIds,
    categoriaIds
  })
}

async function listarLivros(
  ordenarPor: OrdenarLivrosPor
): Promise<LivroListagem[]> {
  return livroRepository.listarTodos(ordenarPor)
}

async function listarLivrosPorAutor(
  nomeAutor: string
): Promise<LivroListagem[]> {
  return livroRepository.listarPorAutor(nomeAutor)
}

async function listarLivrosPorTitulo(
  tituloBusca: string
): Promise<LivroListagem[]> {
  return livroRepository.listarPorTituloParcial(tituloBusca)
}

async function listarLivrosPorCategorias(
  nomesCategorias: string[]
): Promise<LivroListagem[]> {
  return livroRepository.listarPorCategorias(nomesCategorias)
}

async function buscarLivroDetalhado(
  id: number
): Promise<LivroDetalhado | null> {
  return livroRepository.buscarDetalhadoPorId(id)
}

async function atualizarLivro(
  id: number,
  dados: AtualizarLivroInput
): Promise<Livro> {
  if (!dados.titulo.trim()) throw new Error('O título do livro é obrigatório')
  if (dados.totalExemplares < 0)
    throw new Error('A quantidade não pode ser negativa')
  return livroRepository.atualizar(id, dados)
}

async function removerLivro(id: number): Promise<boolean> {
  return livroRepository.deletar(id)
}

export {
  cadastrarLivro,
  listarLivros,
  listarLivrosPorAutor,
  listarLivrosPorTitulo,
  listarLivrosPorCategorias,
  buscarLivroDetalhado,
  atualizarLivro,
  removerLivro
}
