import { Autor } from '../models/Autor'
import { atualizar, buscarPorNome } from '../repositories/autorRepository'
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

export { atualizarNomeAutor, buscarAutorPorNome }
