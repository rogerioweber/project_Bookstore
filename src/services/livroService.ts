import { Livro } from '../models/Livro'
import * as autorRepository from '../repositories/autorRepository'
import * as categoriaRepository from '../repositories/categoriaRepository'
import * as livroRepository from '../repositories/livroRepository'

function capitalizar(texto: string): string {
  const limpo = texto.trim().toLowerCase()
  return limpo.charAt(0).toUpperCase() + limpo.slice(1)
}

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

  if (!tituloNormalizado) {
    throw new Error('O título do livro é obrigatório')
  }
  if (totalExemplares < 0) {
    throw new Error('A quantidade de exemplares não pode ser negativa')
  }
  if (nomesAutores.length === 0) {
    throw new Error('O livro precisa ter ao menos um autor')
  }
  if (nomesCategorias.length === 0) {
    throw new Error('O livro precisa ter ao menos uma categoria')
  }

  const livroExistente =
    await livroRepository.buscarPorTitulo(tituloNormalizado)
  if (livroExistente) {
    throw new Error(
      `Já existe um livro cadastrado com o título "${livroExistente.titulo}"`
    )
  }

  const autorIds: number[] = []
  for (const nome of nomesAutores) {
    autorIds.push(await buscarOuCriarAutor(nome))
  }

  const categoriaIds: number[] = []
  for (const nome of nomesCategorias) {
    categoriaIds.push(await buscarOuCriarCategoria(nome))
  }

  return livroRepository.criar({
    titulo: tituloNormalizado,
    totalExemplares,
    autorIds,
    categoriaIds
  })
}

export { cadastrarLivro }
