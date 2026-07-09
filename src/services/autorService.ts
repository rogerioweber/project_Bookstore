import { Autor, AutorComQuantidadeLivros } from '../models/Autor'
import {
  buscarPorNome,
  buscarPorId,
  buscarPorNomeParcial,
  listarTodos,
  criar,
  atualizar,
  listarComQuantidadeLivros,
  contarLivrosVinculados,
  deletar
} from '../repositories/autorRepository'
import { capitalizar } from '../utils/texto'

async function buscarAutorPorNome(nome: string): Promise<Autor | null> {
  const nomeNormalizado = capitalizar(nome.trim())
  return buscarPorNome(nomeNormalizado)
}

async function atualizarNomeAutor(id: number, nome: string): Promise<Autor> {
  const nomeNormalizado = capitalizar(nome.trim())
  if (!nomeNormalizado) throw new Error('O nome do autor não pode ser vazio')

  const existente = await buscarPorNome(nomeNormalizado)
  if (existente && existente.id !== id) {
    throw new Error(
      `Já existe um autor cadastrado como "${existente.nome}". Escolha outro nome ou deixe como está.`
    )
  }
  return atualizar(id, nomeNormalizado)
}

async function listarAutoresComQuantidadeLivros(): Promise<
  AutorComQuantidadeLivros[]
> {
  return listarComQuantidadeLivros()
}

async function removerAutor(id: number): Promise<boolean> {
  const totalLivros = await contarLivrosVinculados(id)

  if (totalLivros > 0) {
    throw new Error(
      `Não é possível remover este autor: ele está vinculado a ${String(totalLivros)} livro(s). Remova ou atualize esses livros primeiro.`
    )
  }

  return deletar(id)
}

async function cadastrarAutor(nome: string): Promise<Autor> {
  const nomeNormalizado = capitalizar(nome.trim())
  if (!nomeNormalizado) throw new Error('O nome do autor é obrigatório')

  const existente = await buscarPorNome(nomeNormalizado)
  if (existente) {
    throw new Error(`Já existe um autor cadastrado como "${existente.nome}"`)
  }

  return criar(nomeNormalizado)
}

async function listarAutores(): Promise<Autor[]> {
  return listarTodos()
}

async function buscarAutorPorId(id: number): Promise<Autor | null> {
  return buscarPorId(id)
}

async function buscarAutoresPorNome(nome: string): Promise<Autor[]> {
  return buscarPorNomeParcial(nome)
}

export {
  atualizarNomeAutor,
  buscarAutorPorNome,
  listarAutoresComQuantidadeLivros,
  removerAutor,
  cadastrarAutor,
  listarAutores,
  buscarAutorPorId,
  buscarAutoresPorNome
}
